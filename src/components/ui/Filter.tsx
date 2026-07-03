import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterOption = {
  value: string;
  label: string;
};

type FilterProps = React.ComponentProps<'div'>;

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
  'aria-label'?: string;
};

function Filter({ className, ...props }: FilterProps) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />;
}

function FilterSelect({
  value,
  onChange,
  options,
  className,
  'aria-label': ariaLabel,
}: FilterSelectProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        aria-label={ariaLabel ?? options.find((option) => option.value === value)?.label}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-lg border border-[#e5e7eb] bg-white py-0 pl-3 pr-8 text-[13px] font-medium text-[#334155] outline-none transition hover:bg-[#f8fafc] focus:border-[#e5e7eb] focus:ring-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-[#334155]">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#94a3b8]"
        aria-hidden
      />
    </div>
  );
}

Filter.Select = FilterSelect;

export { Filter, FilterSelect };
export default Filter;
