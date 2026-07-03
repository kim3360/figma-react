import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, Laptop, Mic, Plus, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useProjectListQuery } from '@/api/projects';
import {
  formatProjectDisplayName,
  markHomeChatProject,
  setPendingHomeAgentPrompt,
} from '@/components/layout/project/agentChat.utils';
import HomeProjectListPopover from '@/components/layout/home/HomeProjectListPopover';
import HomePromptTemplateChip from '@/components/layout/home/HomePromptTemplateChip';
import { getHomeTemplateById } from '@/mocks/home/homeTemplates';
import {
  clearHomePromptTemplate,
  readHomePromptTemplate,
  setHomePromptTemplate,
  toHomePromptAttachedTemplate,
  type HomePromptAttachedTemplate,
} from '@/lib/homePromptTemplate';
import { cn } from '@/lib/utils';

const quickActions = [
  { emoji: '💻', label: '슬라이드 제작' },
  { emoji: '<>', label: '웹사이트 구축' },
  { emoji: '🖥️', label: '데스크톱 앱 개발' },
  { emoji: '🎨', label: '디자인' },
] as const;

function HomePromptHero() {
  const navigate = useNavigate();
  const { templateId: templateIdFromSearch } = useSearch({ from: '/_authenticated/home' });

  const [prompt, setPrompt] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null);
  const [attachedTemplate, setAttachedTemplate] = useState<HomePromptAttachedTemplate | null>(() =>
    readHomePromptTemplate(),
  );

  const { data: projects = [], isLoading: isProjectsLoading } = useProjectListQuery('home-prompt');

  useEffect(() => {
    if (!templateIdFromSearch) return;

    const template = getHomeTemplateById(templateIdFromSearch);
    if (!template) return;

    const attached = toHomePromptAttachedTemplate(template);
    setHomePromptTemplate(attached);

    void navigate({
      to: '/home',
      search: {},
      replace: true,
    });
  }, [navigate, templateIdFromSearch]);

  const latestProjectId = useMemo(() => {
    if (projects.length === 0) return null;
    const sorted = [...projects].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return sorted[0].projectId;
  }, [projects]);

  const targetProjectId = selectedProjectId ?? latestProjectId;

  const handleRemoveTemplate = () => {
    setAttachedTemplate(null);
    clearHomePromptTemplate();
  };

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed || isProjectsLoading) return;

    if (targetProjectId == null) {
      setSubmitError('먼저 프로젝트를 생성해 주세요.');
      return;
    }

    const message = attachedTemplate ? `[${attachedTemplate.title} 템플릿] ${trimmed}` : trimmed;

    setSubmitError(null);
    markHomeChatProject(targetProjectId);
    setPendingHomeAgentPrompt(message);
    clearHomePromptTemplate();
    setAttachedTemplate(null);
    void navigate({
      to: '/project/$slug/agent',
      params: { slug: String(targetProjectId) },
    });
  };

  const cloudButtonLabel =
    selectedProjectId != null && selectedProjectName
      ? formatProjectDisplayName(selectedProjectName, selectedProjectId)
      : '프로젝트 선택';

  const promptPlaceholder = attachedTemplate
    ? '이 템플릿으로 만들 내용과 요구사항을 입력하세요'
    : '작업을 할당하거나 무엇이든 질문하세요';

  return (
    <section className="relative z-10 flex flex-col items-center pt-10 pb-8">
      <h1 className="text-center text-[32px] font-semibold tracking-tight text-[#0f172a] sm:text-[36px]">
        무엇을 도와드릴까요?
      </h1>

      <div className="mt-8 w-full max-w-[720px]">
        <div className="overflow-visible rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          {attachedTemplate ? (
            <div className="px-5 pt-5">
              <HomePromptTemplateChip template={attachedTemplate} onRemove={handleRemoveTemplate} />
            </div>
          ) : null}

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            rows={attachedTemplate ? 2 : 3}
            placeholder={promptPlaceholder}
            className={cn(
              'block w-full resize-none bg-transparent px-5 pb-2 text-[15px] leading-relaxed text-[#0f172a] outline-none placeholder:text-[#94a3b8]',
              attachedTemplate ? 'pt-4' : 'pt-5',
            )}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                aria-label="첨부"
              >
                <Plus className="size-[18px]" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                aria-label="설정"
              >
                <SlidersHorizontal className="size-[18px]" strokeWidth={1.75} />
              </button>
              <HomeProjectListPopover
                open={projectPickerOpen}
                onOpenChange={setProjectPickerOpen}
                selectedProjectId={selectedProjectId}
                onSelect={(project) => {
                  setSelectedProjectId(project.projectId);
                  setSelectedProjectName(project.name);
                }}
                trigger={
                  <button
                    type="button"
                    onClick={() => setProjectPickerOpen((prev) => !prev)}
                    aria-expanded={projectPickerOpen}
                    aria-haspopup="listbox"
                    title={cloudButtonLabel}
                    className={cn(
                      'inline-flex h-8 max-w-[220px] items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition',
                      projectPickerOpen
                        ? 'border-[#0f172a] bg-white ring-2 ring-[#0f172a]/10 text-[#0f172a]'
                        : 'border-[#e5e7eb] bg-[#f8fafc] text-[#334155] hover:bg-[#f1f5f9]',
                    )}
                  >
                    <Laptop className="size-3.5 shrink-0 text-[#64748b]" strokeWidth={1.75} />
                    <span className="truncate">{cloudButtonLabel}</span>
                  </button>
                }
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9]"
                aria-label="음성 입력"
              >
                <Mic className="size-[18px]" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                disabled={!prompt.trim()}
                onClick={handleSubmit}
                className="flex size-9 items-center justify-center rounded-full bg-[#0f172a] text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:bg-[#cbd5e1]"
                aria-label="전송"
              >
                <ArrowUp className="size-[18px]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {submitError ? (
        <p className="mt-3 text-center text-[13px] text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="mt-5 flex max-w-[720px] flex-wrap justify-center gap-2">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() =>
              setPrompt((prev) => (prev ? prev : `${action.label} 관련 작업을 도와주세요`))
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-2 text-[13px] font-medium text-[#334155] shadow-sm transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
          >
            {'emoji' in action && action.emoji ? (
              <span className="text-[14px] leading-none" aria-hidden>
                {action.emoji}
              </span>
            ) : null}
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default HomePromptHero;
