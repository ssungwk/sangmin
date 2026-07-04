"use client";

import { useActionState, useRef, useEffect } from "react";
import { registerPurchase, registerSale } from "@/lib/actions/inventory";

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

const today = () => new Date().toISOString().slice(0, 10);

export function PurchaseForm() {
  const [state, formAction, pending] = useActionState(registerPurchase, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-2 border border-slate-300 bg-white p-4"
    >
      <h2 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-700">
        매입 등록
      </h2>
      <input
        name="in_date"
        type="date"
        required
        defaultValue={today()}
        className={inputClass}
      />
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
      <input
        name="in_prc"
        type="number"
        step="0.01"
        placeholder="매입단가(원)"
        required
        className={inputClass}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-blue-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50"
      >
        {pending ? "처리 중..." : "매입 등록"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}

export function SaleForm() {
  const [state, formAction, pending] = useActionState(registerSale, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-2 border border-slate-300 bg-white p-4"
    >
      <h2 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-700">
        매출 등록
      </h2>
      <div className="flex gap-2">
        <input
          name="order_date"
          type="date"
          required
          defaultValue={today()}
          className={inputClass}
        />
        <input name="out_date" type="date" placeholder="배송일자" className={inputClass} />
      </div>
      <input name="apartment" placeholder="현장(아파트)" className={inputClass} />
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
      <input
        name="out_prc"
        type="number"
        step="0.01"
        placeholder="매출단가(원)"
        required
        className={inputClass}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-none bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "처리 중..." : "매출 등록"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}
