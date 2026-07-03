import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type InfoCardProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export default function InfoCard({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        'p-6 flex flex-col gap-2.5 border border-[#0F172A]/8 rounded-3xl bg-white',
        className,
      )}
    >
      <div className={cn('text-[#111827] text-lg font-extrabold', titleClassName)}>{title}</div>
      <div className={cn('text-[#64748B] text-md font-medium', descriptionClassName)}>
        {description}
      </div>
    </div>
  );
}
