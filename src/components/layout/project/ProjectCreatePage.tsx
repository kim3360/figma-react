import { useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ChevronLeft, ExternalLink, Monitor, Smartphone } from 'lucide-react';
import { setHomePromptTemplate, toHomePromptAttachedTemplate } from '@/lib/homePromptTemplate';

import {
  DEFAULT_TEMPLATE_ID,
  getHomeTemplateById,
  homeTemplates,
  resolveHomeTemplatePreviewUrl,
} from '@/mocks/home/homeTemplates';

function ProjectCreatePage() {
  const navigate = useNavigate();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const search = useSearch({ from: '/_authenticated/project/new' });
  const templateId = search.templateId ?? DEFAULT_TEMPLATE_ID;
  const template =
    getHomeTemplateById(templateId) ?? getHomeTemplateById(DEFAULT_TEMPLATE_ID) ?? homeTemplates[0];
  const previewUrl = resolveHomeTemplatePreviewUrl(template);

  const handleUseTemplate = () => {
    const attached = toHomePromptAttachedTemplate(template);
    setHomePromptTemplate(attached);
    void navigate({
      to: '/home',
      search: { templateId: template.id },
    });
  };

  return (
    <div className="flex h-screen min-h-0 flex-col bg-[#f8fafc]">
      <div className="flex min-h-0 flex-1">
        <section className="flex min-h-0 w-full shrink-0 flex-col bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[#e2e8f0] px-4 py-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2 justify-self-start">
              <Link
                to="/home"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[13px] font-medium text-[#334155] transition hover:bg-[#f8fafc]"
              >
                <ChevronLeft className="size-3.5" strokeWidth={2} />
                템플릿 뒤로가기
              </Link>
              <button
                type="button"
                onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[13px] font-medium text-[#334155] transition hover:bg-[#f8fafc]"
              >
                <ExternalLink className="size-3.5" />새 탭에서 보기
              </button>
            </div>

            <div className="inline-flex justify-self-center rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#64748b] hover:text-[#334155]'
                }`}
              >
                <Monitor className="size-3.5" />
                PC
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#64748b] hover:text-[#334155]'
                }`}
              >
                <Smartphone className="size-3.5" />
                모바일
              </button>
            </div>

            <div className="flex justify-self-end">
              <button
                type="button"
                onClick={handleUseTemplate}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#7c3aed] px-4 text-[13px] font-semibold text-white transition hover:bg-[#6d28d9]"
              >
                템플릿 사용하기
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
            <div
              className={`relative size-full min-h-0 ${
                previewDevice === 'mobile'
                  ? 'mx-auto h-full w-[390px] border-x border-[#e2e8f0] shadow-[0_0_0_1px_rgba(15,23,42,0.06)]'
                  : ''
              }`}
            >
              <iframe
                src={previewUrl}
                title={`${template.title} 미리보기`}
                className="absolute inset-0 block size-full border-0 bg-white"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProjectCreatePage;
