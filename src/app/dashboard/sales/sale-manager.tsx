"use client";

import { useActionState, useState, useEffect } from "react";
import { registerSale, updateSale, deleteSale } from "@/lib/actions/inventory";
import { findNearestSpec, type NearestPurchase, type NearestSale } from "@/lib/actions/lookup";
import { formatSpec } from "@/lib/format";
import type { Product } from "@/lib/actions/products";
import { StatusMessage } from "../status-message";
import { AutoGrowTextarea } from "../auto-grow-textarea";

export type SaleRow = {
  out_id: number;
  order_date: string;
  out_date: string | null;
  apartment: string | null;
  product_id: string;
  width_mm: number;
  height_mm: number;
  thickness_mm: number | null;
  out_qty: number;
  out_prc: number;
  note: string | null;
  products: { product_nm: string } | null;
};

const inputClass =
  "w-full rounded-none border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700";

const thClass =
  "w-28 border border-slate-300 bg-slate-100 px-3 py-2 text-left align-middle text-sm font-medium text-slate-600";

const tdClass = "border border-slate-300 p-2";

const today = () => new Date().toISOString().slice(0, 10);

export function SaleManager({
  products,
  sales,
}: {
  products: Product[];
  sales: SaleRow[];
}) {
  const [selected, setSelected] = useState<SaleRow | null>(null);
  const [addState, addAction, addPending] = useActionState(registerSale, undefined);
  const [updateState, updateAction, updatePending] = useActionState(updateSale, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteSale, undefined);

  const [productId, setProductId] = useState(selected?.product_id ?? "");
  const [width, setWidth] = useState(selected?.width_mm?.toString() ?? "");
  const [height, setHeight] = useState(selected?.height_mm?.toString() ?? "");
  const [thickness, setThickness] = useState(selected?.thickness_mm?.toString() ?? "");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookup, setLookup] = useState<{
    purchase: NearestPurchase | null;
    sale: NearestSale | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (addState?.success || updateState?.success || deleteState?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears selection/spec fields once per action result, not every render
      setSelected(null);
      setProductId("");
      setWidth("");
      setHeight("");
      setThickness("");
      setLookup(null);
    }
  }, [addState, updateState, deleteState]);

  const w = Number(width);
  const h = Number(height);
  const t = thickness !== "" ? Number(thickness) : null;
  const specComplete = productId !== "" && width !== "" && height !== "" && w > 0 && h > 0;

  useEffect(() => {
    if (!specComplete) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flips loading flag before the debounced lookup fires; guarded by `cancelled` on cleanup
    setLookupLoading(true);
    const timer = setTimeout(() => {
      findNearestSpec(productId, w, h, t).then((result) => {
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
  }, [specComplete, productId, w, h, t]);

  const isEditing = selected !== null;
  const pending = addPending || updatePending || deletePending;

  return (
    <div className="space-y-6">
      <form
        key={selected?.out_id ?? "new"}
        action={isEditing ? updateAction : addAction}
        className="border border-slate-300 bg-white"
      >
        <h2 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
          {isEditing ? `매출 수정 (#${selected.out_id})` : "매출 등록"}
        </h2>

        {isEditing && <input type="hidden" name="out_id" value={selected.out_id} />}

        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <th className={thClass}>주문일자</th>
              <td className={tdClass}>
                <input
                  name="order_date"
                  type="date"
                  required
                  defaultValue={selected?.order_date ?? today()}
                  className={inputClass}
                />
              </td>
            </tr>
            <tr>
              <th className={thClass}>배송일자</th>
              <td className={tdClass}>
                <input
                  name="out_date"
                  type="date"
                  defaultValue={selected?.out_date ?? ""}
                  className={inputClass}
                />
              </td>
            </tr>
            <tr>
              <th className={thClass}>현장</th>
              <td className={tdClass}>
                <input
                  name="apartment"
                  placeholder="아파트명"
                  defaultValue={selected?.apartment ?? ""}
                  className={inputClass}
                />
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
                    placeholder="두께(mm, 선택)"
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th className={thClass}>개수/단가</th>
              <td className={tdClass}>
                <div className="flex gap-2">
                  <input
                    name="out_qty"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="개수"
                    required
                    defaultValue={selected?.out_qty ?? 1}
                    className={inputClass}
                  />
                  <input
                    name="out_prc"
                    type="number"
                    step="0.01"
                    placeholder="매출단가(원)"
                    required
                    defaultValue={selected?.out_prc}
                    className={inputClass}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th className={thClass}>비고</th>
              <td className={tdClass}>
                <AutoGrowTextarea
                  name="note"
                  placeholder="비고"
                  defaultValue={selected?.note}
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
            ) : lookup?.error ? (
              <p className="text-red-700">조회 실패: {lookup.error}</p>
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

        <div className="flex flex-wrap items-center gap-3 p-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-none bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isEditing ? (updatePending ? "수정 중..." : "수정") : addPending ? "처리 중..." : "추가"}
          </button>
          {isEditing && (
            <button
              type="submit"
              formAction={deleteAction}
              disabled={pending}
              className="rounded-none border border-red-700 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {deletePending ? "삭제 중..." : "삭제"}
            </button>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setProductId("");
                setWidth("");
                setHeight("");
                setThickness("");
                setLookup(null);
              }}
              className="rounded-none border border-slate-400 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
          )}
          <StatusMessage state={addState} />
          <StatusMessage state={updateState} />
          <StatusMessage state={deleteState} />
        </div>
      </form>

      <section className="border border-slate-300 bg-white">
        <h2 className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
          매출 내역 (클릭해서 수정)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">주문일자</th>
                <th className="border-r border-slate-200 p-2">배송일자</th>
                <th className="border-r border-slate-200 p-2">현장</th>
                <th className="border-r border-slate-200 p-2">제품</th>
                <th className="border-r border-slate-200 p-2">규격</th>
                <th className="border-r border-slate-200 p-2">매출개수</th>
                <th className="border-r border-slate-200 p-2">매출단가</th>
                <th className="p-2">비고</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((row) => (
                <tr
                  key={row.out_id}
                  onClick={() => {
                    setSelected(row);
                    setProductId(row.product_id);
                    setWidth(row.width_mm.toString());
                    setHeight(row.height_mm.toString());
                    setThickness(row.thickness_mm?.toString() ?? "");
                  }}
                  className={`cursor-pointer border-b border-slate-200 hover:bg-blue-50 ${
                    selected?.out_id === row.out_id ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="border-r border-slate-200 p-2">{row.order_date}</td>
                  <td className="border-r border-slate-200 p-2">{row.out_date ?? "-"}</td>
                  <td className="border-r border-slate-200 p-2">{row.apartment ?? "-"}</td>
                  <td className="border-r border-slate-200 p-2">
                    {row.products?.product_nm ?? "-"}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="border-r border-slate-200 p-2">{row.out_qty}</td>
                  <td className="border-r border-slate-200 p-2">
                    {Number(row.out_prc).toLocaleString()}
                  </td>
                  <td className="whitespace-pre-wrap p-2">{row.note ?? "-"}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-400">
                    매출 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
