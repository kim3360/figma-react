import { X } from 'lucide-react';
import type { HomePromptAttachedTemplate } from '@/lib/homePromptTemplate';

type HomePromptTemplateChipProps = {
  template: HomePromptAttachedTemplate;
  onRemove: () => void;
};

function HomePromptTemplateChip({ template, onRemove }: HomePromptTemplateChipProps) {
  return (
    <div className="relative inline-flex max-w-[min(100%,300px)]">
      <div className="flex min-w-0 items-stretch overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <img
          src={template.image}
          className="h-[58px] w-[76px] shrink-0 border-r border-[#e2e8f0] object-cover object-top"
        />
        <div className="flex min-w-0 flex-col justify-center py-2 pl-3 pr-4">
          <p className="truncate text-[13px] font-semibold leading-tight text-[#0f172a]">
            {template.title}
          </p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-[#64748b]">
            {template.subtitle}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label="템플릿 제거"
        className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b] shadow-sm transition hover:bg-[#f1f5f9] hover:text-[#334155]"
      >
        <X className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default HomePromptTemplateChip;
