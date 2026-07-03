import { useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  FolderKanban,
  GitBranch,
  Mail,
  MessageCircle,
  Search,
  User,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  HELP_FAQ_IDS,
  HELP_QUICK_LINK_IDS,
  type HelpFaqId,
  type HelpQuickLinkId,
} from '@/components/layout/help/helpContent';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const quickLinkIcons: Record<HelpQuickLinkId, typeof BookOpen> = {
  gettingStarted: BookOpen,
  projects: FolderKanban,
  github: GitBranch,
  account: User,
};

const quickLinkRoutes: Partial<Record<HelpQuickLinkId, string>> = {
  projects: '/project',
  account: '/settings',
};

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<HelpFaqId | null>(HELP_FAQ_IDS[0]);

  const { t } = useTranslation();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFaqIds = useMemo(() => {
    if (!normalizedQuery) return [...HELP_FAQ_IDS];

    return HELP_FAQ_IDS.filter((id) => {
      const question = t(`help.faq.items.${id}.question`).toLowerCase();
      const answer = t(`help.faq.items.${id}.answer`).toLowerCase();
      return question.includes(normalizedQuery) || answer.includes(normalizedQuery);
    });
  }, [normalizedQuery, t]);

  const handleFaqToggle = (id: HelpFaqId) => {
    setOpenFaqId((current) => (current === id ? null : id));
  };

  return (
    <div className="min-h-full bg-white px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-[960px] flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">{t('help.title')}</h1>
            <p className="mt-1 text-[14px] leading-relaxed text-[#64748b]">{t('help.description')}</p>
          </div>

          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('help.searchPlaceholder')}
              className="h-11 rounded-xl border-[#e2e8f0] bg-[#f8fafc] pl-10 text-[14px] shadow-none focus:border-[#e2e8f0] focus:ring-0 focus-visible:border-[#e2e8f0] focus-visible:ring-0"
            />
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold text-[#0f172a]">{t('help.quickLinks.title')}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {HELP_QUICK_LINK_IDS.map((id) => {
              const Icon = quickLinkIcons[id];
              const route = quickLinkRoutes[id];
              const cardClassName =
                'flex items-start gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]';

              const content = (
                <>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9]">
                    <Icon className="size-5 text-[#475569]" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#0f172a]">
                      {t(`help.quickLinks.items.${id}.title`)}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#64748b]">
                      {t(`help.quickLinks.items.${id}.description`)}
                    </p>
                  </div>
                  {route ? (
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-[#94a3b8]" aria-hidden />
                  ) : null}
                </>
              );

              if (route) {
                return (
                  <Link key={id} to={route} className={cardClassName}>
                    {content}
                  </Link>
                );
              }

              return (
                <div key={id} className={cardClassName}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold text-[#0f172a]">{t('help.faq.title')}</h2>
          <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
            {filteredFaqIds.length > 0 ? (
              filteredFaqIds.map((id, index) => {
                const isOpen = openFaqId === id;

                return (
                  <div
                    key={id}
                    className={cn(index > 0 && 'border-t border-[#f1f5f9]')}
                  >
                    <button
                      type="button"
                      onClick={() => handleFaqToggle(id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-[#f8fafc]"
                    >
                      <span className="text-[14px] font-medium text-[#0f172a]">
                        {t(`help.faq.items.${id}.question`)}
                      </span>
                      <ChevronRight
                        className={cn(
                          'mt-0.5 size-4 shrink-0 text-[#94a3b8] transition-transform',
                          isOpen && 'rotate-90',
                        )}
                        aria-hidden
                      />
                    </button>
                    {isOpen ? (
                      <div className="px-4 pb-4 text-[13px] leading-relaxed text-[#64748b]">
                        {t(`help.faq.items.${id}.answer`)}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="px-4 py-8 text-center text-[14px] text-[#64748b]">{t('help.faq.empty')}</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <MessageCircle className="size-5 text-[#475569]" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#0f172a]">{t('help.contact.title')}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-[#64748b]">
                  {t('help.contact.description')}
                </p>
              </div>
            </div>
            <a
              href="mailto:support@devely.ai"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1e293b]"
            >
              <Mail className="size-4" strokeWidth={1.75} />
              {t('help.contact.action')}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HelpPage;
