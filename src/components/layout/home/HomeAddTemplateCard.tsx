import { Plus } from 'lucide-react';

function HomeAddTemplateCard() {
  return (
    <button
      type="button"
      className="flex aspect-16/10 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] text-[#64748b] transition hover:border-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569]"
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-[#e2e8f0] bg-white">
        <Plus className="size-5" strokeWidth={1.75} />
      </span>
      <span className="text-[13px] font-medium">내 템플릿 추가</span>
    </button>
  );
}

export default HomeAddTemplateCard;
