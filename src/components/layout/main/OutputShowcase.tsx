import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import {
  homeTemplates,
  type HomeTemplateCategory,
  type HomeTemplateItem,
} from '@/mocks/home/homeTemplates';
import { cn } from '@/lib/utils';

type CategoryFilter = 'all' | HomeTemplateCategory | 'leisure';

const categoryLabels: Record<HomeTemplateCategory, string> = {
  service: '서비스업',
  academy: '교육/학원',
  company: '기업',
  church: '종교/단체',
  politics: '정치',
};

const filterOptions: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'service', label: '서비스업' },
  { value: 'academy', label: '교육/학원' },
  { value: 'leisure', label: '숙박/레저' },
  { value: 'company', label: '기업' },
  { value: 'church', label: '종교/단체' },
  { value: 'politics', label: '정치' },
];

const LANDING_TEMPLATE_LIMIT = 3;

function filterTemplates(templates: HomeTemplateItem[], filter: CategoryFilter) {
  if (filter === 'all') return templates;

  if (filter === 'leisure') {
    return templates.filter(
      (template) =>
        template.category === 'service' &&
        template.tags.some((tag) => tag.includes('빌라') || tag.includes('풀빌라')),
    );
  }

  return templates.filter((template) => template.category === filter);
}

type LandingTemplateCardProps = {
  template: HomeTemplateItem;
};

function LandingTemplateCard({ template }: LandingTemplateCardProps) {
  return (
    <article className="group text-left">
      <Link
        to="/project/new"
        search={{ type: template.startType, templateId: template.id }}
        className="block"
      >
        <div className="relative aspect-10/16 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] transition duration-300 group-hover:border-[#cbd5e1]">
          <img
            src={template.image}
            alt={template.title}
            className="size-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="rounded-md bg-[#dbeafe] px-2 py-0.5 text-[12px] font-semibold text-[#2563eb]">
          무료
        </span>
        <span className="text-[15px] font-semibold text-[#0f172a]">{template.title}</span>
        <span className="text-[14px] text-[#64748b]">{categoryLabels[template.category]}</span>
      </div>
    </article>
  );
}

function OutputShowcase() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const visibleTemplates = useMemo(() => {
    return filterTemplates(homeTemplates, categoryFilter).slice(0, LANDING_TEMPLATE_LIMIT);
  }, [categoryFilter]);

  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex max-w-[1080px] flex-col items-center px-6 py-20">
        <header className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-[32px] font-bold tracking-tight text-[#0f172a] sm:text-[36px]">
            무료로 바로 시작해보세요
          </h2>
          <p className="max-w-[560px] text-[15px] leading-relaxed text-[#64748b] sm:text-[16px]">
            업종별 전문 템플릿. 선택하는 순간 나만의 홈페이지가 완성됩니다
          </p>
        </header>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {filterOptions.map((option) => {
            const isActive = categoryFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategoryFilter(option.value)}
                className={cn(
                  'rounded-full px-4 py-2 text-[14px] font-medium transition',
                  isActive
                    ? 'bg-[#0f172a] text-white'
                    : 'border border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#cbd5e1]',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTemplates.length > 0 ? (
            visibleTemplates.map((template) => (
              <LandingTemplateCard key={template.id} template={template} />
            ))
          ) : (
            <p className="col-span-full py-16 text-center text-[14px] text-[#94a3b8]">
              해당 업종의 템플릿을 준비 중입니다.
            </p>
          )}
        </div>

        <Link
          to="/home"
          className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-[#0f172a] px-6 text-[14px] font-semibold text-white transition hover:bg-[#1e293b]"
        >
          템플릿 더보기
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </section>
  );
}

export default OutputShowcase;
