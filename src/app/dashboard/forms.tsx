"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { registerPurchase, registerSale } from "@/lib/actions/inventory";
import { findNearestSpec, type NearestPurchase, type NearestSale } from "@/lib/actions/lookup";
import { formatSpec } from "@/lib/format";
import type { Product } from "@/lib/actions/products";

function StatusMessage({
  state,
}: {
  state: { error?: string; success?: string } | undefined;
}) {
  if (!state) return null;
  if (state.error) return <p className="text-sm text-red-700">{state.error}</p>;
  if (state.success)
    return <p className="text-sm text-blue-700">{state.success}</p>;
  return null;
}

const inputClass =
  "w-full rounded-none border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700";

const thClass =
  "w-28 border border-slate-300 bg-slate-100 px-3 py-2 text-left align-middle text-sm font-medium text-slate-600";

const tdClass = "border border-slate-300 p-2";

const today = () => new Date().toISOString().slice(0, 10);

function ProductSelect({ products }: { products: Product[] }) {
  return (
    <select name="product_id" required defaultValue="" className={inputClass}>
      <option value="" disabled>
        제품 선택
      </option>
      {products.map((p) => (
        <option key={p.product_id} value={p.product_id}>
          {p.product_nm}
        </option>
      ))}
    </select>
  );
}

export function PurchaseForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(registerPurchase, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border border-slate-300 bg-white"
    >
      <h2 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
        매입 등록
      </h2>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <th className={thClass}>매입일자</th>
            <td className={tdClass}>
              <input
                name="in_date"
                type="date"
                required
                defaultValue={today()}
                className={inputClass}
              />
            </td>
          </tr>
          <tr>
            <th className={thClass}>제품</th>
            <td className={tdClass}>
              <ProductSelect products={products} />
            </td>
          </tr>
          <tr>
            <th className={thClass}>규격</th>
            <td className={tdClass}>
              <div className="flex gap-2">
                <input
                  name="width_mm"
                  type="number"
                  step="0.01"
                  placeholder="가로(mm)"
                  required
                  className={inputClass}
                />
                <input
                  name="height_mm"
                  type="number"
                  step="0.01"
                  placeholder="세로(mm)"
                  required
                  className={inputClass}
                />
                <input
                  name="thickness_mm"
                  type="number"
                  step="0.01"
                  placeholder="두께(mm)"
                  required
                  className={inputClass}
                />
              </div>
            </td>
          </tr>
          <tr>
            <th className={thClass}>매입단가</th>
            <td className={tdClass}>
              <input
                name="in_prc"
                type="number"
                step="0.01"
                placeholder="원"
                required
                className={inputClass}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex items-center gap-3 p-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-none bg-blue-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50"
        >
          {pending ? "처리 중..." : "매입 등록"}
        </button>
        <StatusMessage state={state} />
      </div>
    </form>
  );
}

export function SaleForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(registerSale, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const [productId, setProductId] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [thickness, setThickness] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookup, setLookup] = useState<{
    purchase: NearestPurchase | null;
    sale: NearestSale | null;
  } | null>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears controlled spec fields once per successful submit result, not on every render
      setProductId("");
      setWidth("");
      setHeight("");
      setThickness("");
      setLookup(null);
    }
  }, [state]);

  const pid = Number(productId);
  const w = Number(width);
  const h = Number(height);
  const t = Number(thickness);
  const specComplete =
    productId !== "" && width !== "" && height !== "" && thickness !== "" && w > 0 && h > 0 && t > 0;

  useEffect(() => {
    if (!specComplete) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flips loading flag before the debounced lookup fires; guarded by `cancelled` on cleanup
    setLookupLoading(true);
    const timer = setTimeout(() => {
      findNearestSpec(pid, w, h, t).then((result) => {
        if (!cancelled) {
          setLookup(result);
          setLookupLoading(false);
        }
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [specComplete, pid, w, h, t]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border border-slate-300 bg-white"
    >
      <h2 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
        매출 등록
      </h2>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <th className={thClass}>주문일자</th>
            <td className={tdClass}>
              <input
                name="order_date"
                type="date"
                required
                defaultValue={today()}
                className={inputClass}
              />
            </td>
          </tr>
          <tr>
            <th className={thClass}>배송일자</th>
            <td className={tdClass}>
              <input name="out_date" type="date" className={inputClass} />
            </td>
          </tr>
          <tr>
            <th className={thClass}>현장</th>
            <td className={tdClass}>
              <input name="apartment" placeholder="아파트명" className={inputClass} />
            </td>
          </tr>
          <tr>
            <th className={thClass}>제품</th>
            <td className={tdClass}>
              <select
                name="product_id"
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  제품 선택
                </option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_nm}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th className={thClass}>규격</th>
            <td className={tdClass}>
              <div className="flex gap-2">
                <input
                  name="width_mm"
                  type="number"
                  step="0.01"
                  placeholder="가로(mm)"
                  required
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className={inputClass}
                />
                <input
                  name="height_mm"
                  type="number"
                  step="0.01"
                  placeholder="세로(mm)"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={inputClass}
                />
                <input
                  name="thickness_mm"
                  type="number"
                  step="0.01"
                  placeholder="두께(mm)"
                  required
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  className={inputClass}
                />
              </div>
            </td>
          </tr>
          <tr>
            <th className={thClass}>매출단가</th>
            <td className={tdClass}>
              <input
                name="out_prc"
                type="number"
                step="0.01"
                placeholder="원"
                required
                className={inputClass}
              />
            </td>
          </tr>
        </tbody>
      </table>

      {specComplete && (lookupLoading || lookup) && (
        <div className="border-t border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="mb-2 font-medium text-slate-600">
            참고: 같은 제품 중 입력 규격과 가장 비슷한 이전 내역
          </p>
          {lookupLoading ? (
            <p className="text-slate-400">조회 중...</p>
          ) : (
            <div className="space-y-1 text-slate-700">
              <p>
                매입단가:{" "}
                {lookup?.purchase ? (
                  <>
                    <span className="font-medium">
                      {Number(lookup.purchase.in_prc).toLocaleString()}원
                    </span>{" "}
                    ({lookup.purchase.in_date},{" "}
                    {formatSpec(
                      lookup.purchase.width_mm,
                      lookup.purchase.height_mm,
                      lookup.purchase.thickness_mm,
                    )}
                    )
                  </>
                ) : (
                  "매입 내역 없음"
                )}
              </p>
              <p>
                매출단가:{" "}
                {lookup?.sale ? (
                  <>
                    <span className="font-medium">
                      {Number(lookup.sale.out_prc).toLocaleString()}원
                    </span>{" "}
                    ({lookup.sale.order_date},{" "}
                    {formatSpec(
                      lookup.sale.width_mm,
                      lookup.sale.height_mm,
                      lookup.sale.thickness_mm,
                    )}
                    )
                  </>
                ) : (
                  "매출 내역 없음"
                )}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 p-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-none bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "처리 중..." : "매출 등록"}
        </button>
        <StatusMessage state={state} />
      </div>
    </form>
  );
}
