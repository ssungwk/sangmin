"use client";

import { useActionState, useRef, useEffect } from "react";
import { addProduct, stockIn, stockOut } from "@/lib/actions/inventory";

type Product = { id: string; name: string };

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

export function NewProductForm() {
  const [state, formAction, pending] = useActionState(addProduct, undefined);
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
      <h2 className="font-medium">상품 등록</h2>
      <input
        name="name"
        placeholder="상품명"
        required
        className="w-full rounded border px-2 py-1"
      />
      <input
        name="sku"
        placeholder="SKU (선택)"
        className="w-full rounded border px-2 py-1"
      />
      <div className="flex gap-2">
        <input
          name="purchase_price"
          type="number"
          step="0.01"
          placeholder="매입가"
          required
          className="w-full rounded border px-2 py-1"
        />
        <input
          name="sale_price"
          type="number"
          step="0.01"
          placeholder="판매가"
          required
          className="w-full rounded border px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "등록 중..." : "등록"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}

export function StockInForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(stockIn, undefined);
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
      <h2 className="font-medium">입고</h2>
      <select
        name="product_id"
        required
        className="w-full rounded border px-2 py-1"
      >
        <option value="">상품 선택</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          name="quantity"
          type="number"
          min={1}
          placeholder="수량"
          required
          className="w-full rounded border px-2 py-1"
        />
        <input
          name="purchase_price"
          type="number"
          step="0.01"
          placeholder="매입단가"
          required
          className="w-full rounded border px-2 py-1"
        />
      </div>
      <input
        name="note"
        placeholder="메모 (선택)"
        className="w-full rounded border px-2 py-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "처리 중..." : "입고 처리"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}

export function StockOutForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(stockOut, undefined);
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
      <h2 className="font-medium">출고</h2>
      <select
        name="product_id"
        required
        className="w-full rounded border px-2 py-1"
      >
        <option value="">상품 선택</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          name="quantity"
          type="number"
          min={1}
          placeholder="수량"
          required
          className="w-full rounded border px-2 py-1"
        />
        <input
          name="sale_price"
          type="number"
          step="0.01"
          placeholder="판매단가"
          required
          className="w-full rounded border px-2 py-1"
        />
      </div>
      <input
        name="note"
        placeholder="메모 (선택)"
        className="w-full rounded border px-2 py-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-orange-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "처리 중..." : "출고 처리"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}
