"use client";

import { useActionState, useRef, useEffect } from "react";
import { addProduct } from "@/lib/actions/products";

export function ProductForm() {
  const [state, formAction, pending] = useActionState(addProduct, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-center gap-3 border border-slate-300 bg-white p-4"
    >
      <input
        name="product_nm"
        placeholder="제품명"
        required
        className="w-full max-w-xs rounded-none border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-blue-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50"
      >
        {pending ? "등록 중..." : "제품 등록"}
      </button>
      {state?.error && <span className="text-sm text-red-700">{state.error}</span>}
      {state?.success && <span className="text-sm text-blue-700">{state.success}</span>}
    </form>
  );
}
