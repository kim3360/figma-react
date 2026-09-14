import { Link } from '@tanstack/react-router';
import { Eye } from 'lucide-react';
import type { ProjectStartType } from '@/lib/userProjects';

export type HomeTemplateCardData = {
  id: string;
  title: string;
  tags: string[];
  image: string;
  startType: ProjectStartType;
  previewUrl?: string;
  livePreview?: boolean;
};

type HomeTemplateCardProps = {
  card: HomeTemplateCardData;
};

function HomeTemplateCard({ card }: HomeTemplateCardProps) {
  return (
    <article className="group text-left">
      <Link
        to="/project/new"
        search={{ type: card.startType, templateId: card.id }}
        aria-label={`${card.title} 미리보기`}
        className="relative isolate block aspect-16/10 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f1f5f9] outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2"
      >
        {card.livePreview && card.previewUrl ? (
          <iframe
            src={card.previewUrl}
            title={`${card.title} 썸네일`}
            aria-hidden="true"
            tabIndex={-1}
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-[400%] w-[400%] origin-top-left scale-[0.25] border-0"
          />
        ) : (
          <img
            src={card.image}
            alt=""
            className="size-full object-cover object-top transition duration-500 group-hover:scale-[1.035]"
          />
        )}
        {!card.livePreview && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/50 to-transparent" />
        )}
        <span className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-[#0f172a] shadow-sm transition group-hover:bg-[#0f172a] group-hover:text-white group-focus-visible:bg-[#0f172a] group-focus-visible:text-white">
          <Eye className="size-3.5" strokeWidth={2} />
          미리보기
        </span>
      </Link>

      <p className="mt-2 text-[22px] font-semibold tracking-tight text-[#0f172a]">
        {card.title}
      </p>
      <p className="mt-0.5 text-[13px] text-[#64748b]">{card.tags.join(' ')}</p>
    </article>
  );
}

export default HomeTemplateCard;
