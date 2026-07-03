import { Link } from '@tanstack/react-router';
import { Eye } from 'lucide-react';
import type { ProjectStartType } from '@/lib/userProjects';

export type HomeTemplateCardData = {
  id: string;
  title: string;
  tags: string[];
  image: string;
  startType: ProjectStartType;
};

type HomeTemplateCardProps = {
  card: HomeTemplateCardData;
  selected: boolean;
  onSelect: () => void;
};

function HomeTemplateCard({ card, onSelect }: HomeTemplateCardProps) {
  return (
    <article
      className="group text-left"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative aspect-16/10 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f1f5f9] transition duration-300">
        <img
          src={card.image}
          alt={card.title}
          className="size-full object-cover object-top transition duration-500 group-hover:scale-[1.035]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/50 to-transparent" />

        <Link
          to="/project/new"
          search={{ type: card.startType, templateId: card.id }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`${card.title} 미리보기`}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/45 text-[15px] font-semibold text-white opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-black/55"
        >
          <Eye className="size-5" strokeWidth={2} />
          미리보기
        </Link>
      </div>

      <p className="mt-2 text-[22px] font-semibold tracking-tight text-[#0f172a]">{card.title}</p>
      <p className="mt-0.5 text-[13px] text-[#64748b]">{card.tags.join(' ')}</p>
    </article>
  );
}

export default HomeTemplateCard;
