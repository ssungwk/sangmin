"use client";

import { useActionState, useState, useEffect } from "react";
import { registerPurchase, updatePurchase, deletePurchase } from "@/lib/actions/inventory";
import { formatSpec } from "@/lib/format";
import type { Product } from "@/lib/actions/products";

export type PurchaseRow = {
  in_id: number;
  in_date: string;
  product_id: string;
  width_mm: number;
  height_mm: number;
  thickness_mm: number;
  in_prc: number;
  products: { product_nm: string } | null;
};

function StatusMessage({
  state,
}: {
  state: { error?: string; success?: string } | undefined;
}) {
  if (!state) return null;
  if (state.error) return <p className="text-sm text-red-700">{state.error}</p>;
  if (state.success) return <p className="text-sm text-blue-700">{state.success}</p>;
  return null;
}

const inputClass =
  "w-full rounded-none border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700";

const thClass =
  "w-28 border border-slate-300 bg-slate-100 px-3 py-2 text-left align-middle text-sm font-medium text-slate-600";

const tdClass = "border border-slate-300 p-2";

const today = () => new Date().toISOString().slice(0, 10);

export function PurchaseManager({
  products,
  purchases,
}: {
  products: Product[];
  purchases: PurchaseRow[];
}) {
  const [selected, setSelected] = useState<PurchaseRow | null>(null);
  const [addState, addAction, addPending] = useActionState(registerPurchase, undefined);
  const [updateState, updateAction, updatePending] = useActionState(updatePurchase, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deletePurchase, undefined);

  useEffect(() => {
    if (addState?.success || updateState?.success || deleteState?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears selection once per action result, not every render
      setSelected(null);
    }
  }, [addState, updateState, deleteState]);

  const isEditing = selected !== null;
  const pending = addPending || updatePending || deletePending;

  return (
    <div className="space-y-6">
      <form
        key={selected?.in_id ?? "new"}
        action={isEditing ? updateAction : addAction}
        className="border border-slate-300 bg-white"
      >
        <h2 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
          {isEditing ? `매입 수정 (#${selected.in_id})` : "매입 등록"}
        </h2>

        {isEditing && <input type="hidden" name="in_id" value={selected.in_id} />}

        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <th className={thClass}>매입일자</th>
              <td className={tdClass}>
                <input
                  name="in_date"
                  type="date"
                  required
                  defaultValue={selected?.in_date ?? today()}
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
                  defaultValue={selected?.product_id ?? ""}
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
                    defaultValue={selected?.width_mm}
                    className={inputClass}
                  />
                  <input
                    name="height_mm"
                    type="number"
                    step="0.01"
                    placeholder="세로(mm)"
                    required
                    defaultValue={selected?.height_mm}
                    className={inputClass}
                  />
                  <input
                    name="thickness_mm"
                    type="number"
                    step="0.01"
                    placeholder="두께(mm)"
                    required
                    defaultValue={selected?.thickness_mm}
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
                  defaultValue={selected?.in_prc}
                  className={inputClass}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-wrap items-center gap-3 p-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-none bg-blue-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50"
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
              onClick={() => setSelected(null)}
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
          매입 내역 (클릭해서 수정)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-left text-slate-600">
                <th className="border-r border-slate-200 p-2">매입일자</th>
                <th className="border-r border-slate-200 p-2">제품</th>
                <th className="border-r border-slate-200 p-2">규격</th>
                <th className="p-2">매입단가</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((row) => (
                <tr
                  key={row.in_id}
                  onClick={() => setSelected(row)}
                  className={`cursor-pointer border-b border-slate-200 hover:bg-blue-50 ${
                    selected?.in_id === row.in_id ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="border-r border-slate-200 p-2">{row.in_date}</td>
                  <td className="border-r border-slate-200 p-2">
                    {row.products?.product_nm ?? "-"}
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    {formatSpec(row.width_mm, row.height_mm, row.thickness_mm)}
                  </td>
                  <td className="p-2">{Number(row.in_prc).toLocaleString()}</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400">
                    매입 내역이 없습니다.
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
