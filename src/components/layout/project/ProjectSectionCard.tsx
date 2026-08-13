import type { ReactNode } from 'react';

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-[#0f172a]">{title}</h2>
        {description ? <p className="mt-1 text-[12px] text-[#64748b]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f1f5f9] py-2.5 last:border-b-0">
      <span className="shrink-0 text-[12px] text-[#94a3b8]">{label}</span>
      <span className="min-w-0 text-right text-[13px] font-medium text-[#0f172a]">{value}</span>
    </div>
  );
}
