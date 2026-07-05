"use client";

import { useActionState } from "react";
import { updateProduct, deleteProduct } from "@/lib/actions/products";
import type { Product } from "@/lib/actions/products";

const cellInputClass =
  "rounded-none border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700";

export function ProductRow({ product }: { product: Product }) {
  const [updateState, updateAction, updatePending] = useActionState(updateProduct, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteProduct, undefined);

  return (
    <tr className="border-b border-slate-200">
      <td className="border-r border-slate-200 p-2 text-slate-500">{product.product_id}</td>
      <td className="border-r border-slate-200 p-2">
        <form action={updateAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="product_id" value={product.product_id} />
          <input
            name="product_nm"
            defaultValue={product.product_nm}
            required
            className={`w-40 ${cellInputClass}`}
          />
          <input
            name="sort_no"
            type="number"
            defaultValue={product.sort_no}
            required
            className={`w-20 ${cellInputClass}`}
          />
          <button
            type="submit"
            disabled={updatePending}
            className="rounded-none bg-blue-800 px-3 py-1 text-xs font-medium text-white hover:bg-blue-900 disabled:opacity-50"
          >
            {updatePending ? "저장 중..." : "저장"}
          </button>
          {updateState?.success && <span className="text-xs text-blue-700">{updateState.success}</span>}
          {updateState?.error && <span className="text-xs text-red-700">{updateState.error}</span>}
        </form>
      </td>
      <td className="p-2">
        <form action={deleteAction} className="flex items-center gap-2">
          <input type="hidden" name="product_id" value={product.product_id} />
          <button
            type="submit"
            disabled={deletePending}
            className="rounded-none border border-red-700 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {deletePending ? "삭제 중..." : "삭제"}
          </button>
          {deleteState?.error && <span className="text-xs text-red-700">{deleteState.error}</span>}
        </form>
      </td>
    </tr>
  );
}
