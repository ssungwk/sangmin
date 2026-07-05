"use client";

import { useEffect, useRef } from "react";

function resize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function AutoGrowTextarea({
  name,
  defaultValue,
  placeholder,
  className,
}: {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) resize(ref.current);
  }, []);

  return (
    <textarea
      ref={ref}
      name={name}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      rows={1}
      className={`resize-none overflow-hidden ${className ?? ""}`}
      onInput={(e) => resize(e.currentTarget)}
    />
  );
}
