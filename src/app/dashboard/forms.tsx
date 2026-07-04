"use client";

import { useActionState, useRef, useEffect } from "react";
import { registerPurchase, registerSale } from "@/lib/actions/inventory";

function StatusMessage({
  state,
}: {
  state: { error?: string; success?: string } | undefined;
}) {
  if (!state) return null;
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.success)
    return <p className="text-sm text-green-600">{state.success}</p>;
  return null;
}

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
      className="space-y-2 rounded border p-4"
    >
      <h2 className="font-medium">매입 등록</h2>
      <input
        name="in_date"
        type="date"
        required
        defaultValue={today()}
        className="w-full rounded border px-2 py-1"
      />
      <div className="flex gap-2">
        <input
          name="width_mm"
          type="number"
          step="0.01"
          placeholder="가로(mm)"
          required
          className="w-full rounded border px-2 py-1"
        />
        <input
          name="height_mm"
          type="number"
          step="0.01"
          placeholder="세로(mm)"
          required
          className="w-full rounded border px-2 py-1"
        />
        <input
          name="thickness_mm"
          type="number"
          step="0.01"
          placeholder="두께(mm)"
          required
          className="w-full rounded border px-2 py-1"
        />
      </div>
      <input
        name="in_prc"
        type="number"
        step="0.01"
        placeholder="매입단가(원)"
        required
        className="w-full rounded border px-2 py-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
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
      className="space-y-2 rounded border p-4"
    >
      <h2 className="font-medium">매출 등록</h2>
      <div className="flex gap-2">
        <input
          name="order_date"
          type="date"
          required
          defaultValue={today()}
          className="w-full rounded border px-2 py-1"
        />
        <input
          name="out_date"
          type="date"
          placeholder="배송일자"
          className="w-full rounded border px-2 py-1"
        />
      </div>
      <input
        name="apartment"
        placeholder="현장(아파트)"
        className="w-full rounded border px-2 py-1"
      />
      <div className="flex gap-2">
        <input
          name="width_mm"
          type="number"
          step="0.01"
          placeholder="가로(mm)"
          required
          className="w-full rounded border px-2 py-1"
        />
        <input
          name="height_mm"
          type="number"
          step="0.01"
          placeholder="세로(mm)"
          required
          className="w-full rounded border px-2 py-1"
        />
        <input
          name="thickness_mm"
          type="number"
          step="0.01"
          placeholder="두께(mm)"
          required
          className="w-full rounded border px-2 py-1"
        />
      </div>
      <input
        name="out_prc"
        type="number"
        step="0.01"
        placeholder="매출단가(원)"
        required
        className="w-full rounded border px-2 py-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-orange-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "처리 중..." : "매출 등록"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}
