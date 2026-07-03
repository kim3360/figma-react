import type { ReactNode } from 'react';
import { CircleHelp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type MeAccountCreditRowProps = {
  icon: typeof Sparkles;
  label: string;
  value: string;
  description?: string;
  helpLabel: string;
};

function MeAccountCreditRow({
  icon: Icon,
  label,
  value,
  description,
  helpLabel,
}: MeAccountCreditRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0 text-[#64748b]" strokeWidth={1.75} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-medium text-[#0f172a]">{label}</p>
            <button
              type="button"
              aria-label={helpLabel}
              className="text-[#94a3b8] transition hover:text-[#64748b]"
            >
              <CircleHelp className="size-3.5" strokeWidth={1.75} />
            </button>
          </div>
          {description ? (
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#64748b]">{description}</p>
          ) : null}
        </div>
      </div>
      <p className="shrink-0 text-[14px] font-medium text-[#0f172a]">{value}</p>
    </div>
  );
}

type MeAccountActionRowProps = {
  title: string;
  description?: string;
  action: ReactNode;
  danger?: boolean;
};

function MeAccountActionRow({ title, description, action, danger }: MeAccountActionRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className={cn('text-[14px] font-medium', danger ? 'text-[#0f172a]' : 'text-[#0f172a]')}>
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              'mt-1 text-[13px] leading-relaxed',
              danger ? 'text-[#ef4444]' : 'text-[#64748b]',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function MeAccountSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-[#e2e8f0]" />
        <div className="flex items-center gap-3">
          <div className="size-9 animate-pulse rounded-full bg-[#e2e8f0]" />
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-[#e2e8f0]" />
        </div>
      </div>
      <div className="rounded-2xl bg-[#f8fafc] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-12 animate-pulse rounded bg-[#e2e8f0]" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-[#e2e8f0]" />
        </div>
        <div className="space-y-4 border-t border-[#e2e8f0] pt-4">
          <div className="h-10 animate-pulse rounded bg-[#e2e8f0]" />
          <div className="h-12 animate-pulse rounded bg-[#e2e8f0]" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-20 animate-pulse rounded bg-[#e2e8f0]" />
        <div className="h-16 animate-pulse rounded bg-[#e2e8f0]" />
        <div className="h-16 animate-pulse rounded bg-[#e2e8f0]" />
      </div>
    </div>
  );
}

export { MeAccountActionRow, MeAccountCreditRow, MeAccountSettingsSkeleton };
