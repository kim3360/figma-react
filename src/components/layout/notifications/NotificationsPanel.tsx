import { useMemo, useState } from 'react';
import { Play, Sparkles, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  notificationItems,
  type NotificationItem,
  type NotificationMedia,
} from '@/mocks/notifications/notifications';
import { cn } from '@/lib/utils';

type NotificationFilter = 'all' | 'updates' | 'messages';

function NotificationMediaBlock({ media }: { media: NotificationMedia }) {
  if (media === 'feature-demo') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[#7c3aed]">
        <div className="flex h-full items-center justify-center gap-6 px-6">
          <div className="flex size-14 items-center justify-center rounded-xl bg-white/90">
            <Wand2 className="size-7 text-[#7c3aed]" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="flex size-20 items-center justify-center rounded-full bg-[#5b21b6]">
            <Play className="ml-1 size-10 text-white" strokeWidth={2} fill="white" aria-hidden />
          </div>
          <div className="flex size-14 items-center justify-center rounded-xl bg-white/90">
            <Sparkles className="size-7 text-[#7c3aed]" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
      </div>
    );
  }

  if (media === 'gradient') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-linear-to-br from-[#93c5fd] via-[#fde68a] to-[#fdba74]" />
    );
  }

  return null;
}

function NotificationCard({ item }: { item: NotificationItem }) {
  return (
    <article className="flex flex-col">
      <h3 className="text-[16px] font-extrabold leading-snug text-[#0f172a]">{item.title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">{item.description}</p>
      {item.media !== 'none' ? (
        <div className="mt-4">
          <NotificationMediaBlock media={item.media} />
        </div>
      ) : null}
      <p className="mt-3 text-[13px] font-medium text-[#94a3b8]">{item.dateLabel}</p>
    </article>
  );
}

function NotificationsPanel() {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const { t } = useTranslation();

  const tabs = useMemo(
    () => [
      { value: 'all' as const, label: t('notifications.tabs.all') },
      { value: 'updates' as const, label: t('notifications.tabs.updates') },
      { value: 'messages' as const, label: t('notifications.tabs.messages') },
    ],
    [t],
  );

  const filteredItems = useMemo(() => {
    if (filter === 'all') return notificationItems;
    return notificationItems.filter((item) => item.tab === filter);
  }, [filter]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 px-5 pt-5 sm:px-6">
        {tabs.map((tab) => {
          const isActive = filter === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={cn(
                'rounded-full px-4 py-2 text-[13px] font-semibold transition',
                isActive
                  ? 'bg-[#f1f5f9] text-[#111827]'
                  : 'text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#475569]',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {filteredItems.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredItems.map((item, index) => (
              <div key={item.id}>
                <NotificationCard item={item} />
                {index < filteredItems.length - 1 ? (
                  <div className="mt-6 h-px w-full bg-[#e2e8f0]" />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-6 text-center">
            <p className="text-[14px] font-medium text-[#64748b]">{t('notifications.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPanel;
