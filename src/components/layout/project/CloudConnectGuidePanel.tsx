import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Check, Copy, X } from 'lucide-react';
import { useCloudRequirementsQuery } from '@/api/cloudConnections';
import { extractApiErrorMessage } from '@/utils/response';
import type { GetCloudRequirementsResType } from '@/types/cloudConnection.type';

/**
 * 배포하려는데 클라우드 연결이 없을 때 무엇을 해야 하는지 알려 준다.
 *
 * 이 자리에서 사용자가 적을 답이 없다 — 다른 화면으로 가서 계정을 연결하고 돌아와야
 * 한다. 그래서 입력창 대신 안내를 편다. 프리뷰 위로 덮어서, 하던 대화를 잃지 않고
 * 읽을 수 있게 한다.
 *
 * 내용은 전부 서버가 준다. 예전에는 정책 전문이 화면에 박혀 있었는데, 서버가 요구하는
 * 권한이 바뀔 때마다 화면을 다시 배포해야 했고 잊으면 낡은 정책을 안내했다.
 */

/** 두 단계를 다 밟아야 배포가 이어진다 — 하나만 하면 다시 여기로 돌아온다 */
const CONNECT_STEPS = [
  '계정에 클라우드 연결을 등록합니다.',
  '이 프로젝트에서 그 연결을 선택합니다.',
];

function stringifyPolicy(policy: unknown): string {
  if (policy == null) return '';
  if (typeof policy === 'string') return policy;
  try {
    return JSON.stringify(policy, null, 2);
  } catch {
    return '';
  }
}

type CopyBlockProps = {
  title: string;
  body: string;
};

function CopyBlock({ title, body }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  // 복사했다는 표시는 잠깐이면 된다. 남아 있으면 다음 복사가 됐는지 알 수 없다
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
    } catch {
      // 클립보드가 막힌 환경이면 아래 코드블록에서 직접 선택해 복사하면 된다
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#e2e8f0]">
      <div className="flex items-center justify-between gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
        <p className="text-[12px] font-semibold text-[#334155]">{title}</p>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#334155] hover:bg-[#f1f5f9]"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? '복사됨' : '전체 복사'}
        </button>
      </div>
      {/* 정책은 줄이 길다. 접으면 오히려 읽기 어려워서 가로로도 스크롤되게 둔다 */}
      <pre className="max-h-64 overflow-auto bg-[#0f172a] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-[#e2e8f0]">
        {body}
      </pre>
    </div>
  );
}

type CloudConnectGuidePanelProps = {
  /** 서버가 보낸 안내 문구. 왜 멈췄는지는 서버가 가장 정확히 안다 */
  question: string;
  projectId: number;
  /** 연결을 마친 뒤 눌러 배포를 이어 달리게 한다 */
  onRetry: () => void;
  isRetrying: boolean;
  onClose: () => void;
};

function CloudConnectGuidePanel({
  question,
  projectId,
  onRetry,
  isRetrying,
  onClose,
}: CloudConnectGuidePanelProps) {
  /*
    사용자가 방식을 직접 고르기 전에는 비워 둔다.

    화면이 기본값을 들고 있으면 안 된다 — 서버가 어떤 방식을 접었을 때(그 환경에서
    준비가 안 됐다든지) 화면만 그걸 계속 가리키게 된다. 무엇을 권할지 아는 쪽은 서버다.
  */
  const [chosenType, setChosenType] = useState<string | null>(null);

  const { data, isLoading, error } = useCloudRequirementsQuery(
    'cloud-connect-guide',
    'AWS',
    chosenType,
    true,
  );

  const requirements = data as GetCloudRequirementsResType | undefined;
  /*
    서버가 실제로 답한 방식을 쓴다.

    고른 것과 다를 수 있다 — 요청한 방식이 그 환경에서 안 되면 서버가 되는 쪽으로
    바꿔서 답한다. 그때 화면이 고른 값을 계속 들고 있으면, 보여주는 안내와 표시된
    방식이 어긋난다.
  */
  const credentialType = requirements?.credentialType || chosenType;
  const recommendedPolicy = stringifyPolicy(requirements?.recommendedPolicy);
  const trustPolicy = stringifyPolicy(requirements?.trustPolicy);

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-y-auto bg-white">
      <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-[#e2e8f0] bg-white px-5 py-4">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#0f172a]">클라우드 연결이 필요합니다</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#64748b]">{question}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="안내 닫기"
          className="shrink-0 cursor-pointer rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f1f5f9]"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 px-5 py-4">
        {/*
          두 단계를 먼저 못 박는다. 계정에 연결만 등록하고 프로젝트에서 고르지 않으면
          배포는 그대로 막히고 사용자는 왜인지 모른다 — 실제로 그 자리에서 한 번 막혔다.
        */}
        <ol className="space-y-1.5 rounded-xl bg-[#faf5ff] px-4 py-3">
          {CONNECT_STEPS.map((step, index) => (
            <li key={step} className="flex gap-2 text-[12px] leading-relaxed text-[#5b21b6]">
              <span className="font-semibold">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {isLoading ? (
          <div className="mt-4 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#e2e8f0]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#e2e8f0]" />
            <div className="mt-3 h-32 animate-pulse rounded-xl bg-[#f1f5f9]" />
          </div>
        ) : error ? (
          /*
            안내를 못 받으면 조용히 넘기지 않는다. 무엇을 해야 하는지가 이 화면의 전부라
            비워 두면 사용자가 할 수 있는 일이 없다.
          */
          <p className="mt-4 rounded-xl bg-[#fef2f2] px-4 py-3 text-[12px] leading-relaxed text-[#b91c1c]">
            {extractApiErrorMessage(error) ?? '연결 안내를 불러오지 못했습니다.'} 연결 화면에서 직접
            등록하실 수 있습니다.
          </p>
        ) : requirements ? (
          <>
            {requirements.credentialOptions.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {requirements.credentialOptions.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setChosenType(option.type)}
                    aria-pressed={option.type === credentialType}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold ${
                      option.type === credentialType
                        ? 'bg-[#0f172a] text-white'
                        : 'border border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {option.label}
                    {option.recommended === true ? (
                      <span className="rounded-full bg-[#ede9fe] px-1.5 py-0.5 text-[10px] font-semibold text-[#6d28d9]">
                        권장
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}

            {requirements.credentialOptions.find((option) => option.type === credentialType)
              ?.summary ? (
              <p className="mt-2 text-[12px] leading-relaxed text-[#64748b]">
                {
                  requirements.credentialOptions.find((option) => option.type === credentialType)
                    ?.summary
                }
              </p>
            ) : null}

            {requirements.steps.length > 0 ? (
              <div className="mt-4">
                <p className="text-[12px] font-semibold text-[#334155]">먼저 할 일</p>
                <ol className="mt-2 space-y-2">
                  {requirements.steps.map((step, index) => (
                    <li key={`${step.title}-${index}`} className="flex gap-2">
                      <span className="text-[12px] font-semibold text-[#94a3b8]">
                        {step.order ?? index + 1}.
                      </span>
                      <span className="min-w-0 text-[12px] leading-relaxed text-[#334155]">
                        <span className="font-medium">{step.title}</span>
                        {step.detail ? (
                          <span className="block text-[#64748b]">{step.detail}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {requirements.fields.length > 0 ? (
              <div className="mt-4">
                <p className="text-[12px] font-semibold text-[#334155]">넣어야 하는 값</p>
                <ul className="mt-2 space-y-2">
                  {requirements.fields.map((field) => (
                    <li key={field.key} className="rounded-lg bg-[#f8fafc] px-3 py-2">
                      <p className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-[#0f172a]">
                        {field.label}
                        {field.secret === true ? (
                          <span className="rounded-full bg-[#fee2e2] px-1.5 py-0.5 text-[10px] font-semibold text-[#b91c1c]">
                            비밀값
                          </span>
                        ) : null}
                      </p>
                      {field.whereToFind ? (
                        <p className="mt-0.5 text-[11px] leading-relaxed text-[#64748b]">
                          {field.whereToFind}
                        </p>
                      ) : null}
                      {/* 예시는 그대로 붙여 넣는 값이 아니다. 형태만 보여준다 */}
                      {field.example ? (
                        <p className="mt-0.5 font-mono text-[11px] text-[#94a3b8]">
                          예: {field.example}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {recommendedPolicy ? (
              <CopyBlock
                title={`권한 정책${requirements.policyName ? ` · ${requirements.policyName}` : ''}`}
                body={recommendedPolicy}
              />
            ) : null}

            {/* 신뢰 정책은 역할 위임에만 있다. 없으면 그 자리를 아예 감춘다 */}
            {trustPolicy ? (
              <CopyBlock
                title={`신뢰 정책${requirements.roleName ? ` · ${requirements.roleName}` : ''}`}
                body={trustPolicy}
              />
            ) : null}

            {requirements.notes.length > 0 ? (
              <ul className="mt-4 space-y-1.5 rounded-xl bg-[#fffbeb] px-4 py-3">
                {requirements.notes.map((note) => (
                  <li key={note} className="text-[12px] leading-relaxed text-[#92400e]">
                    {note}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-[#e2e8f0] bg-white px-5 py-3">
        <Link
          to="/onboarding/cloud"
          className="inline-flex h-9 items-center rounded-lg bg-[#0f172a] px-4 text-[13px] font-semibold text-white"
        >
          연결하러 가기
        </Link>
        <Link
          to="/project/$slug/infra"
          params={{ slug: String(projectId) }}
          className="inline-flex h-9 items-center rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-semibold text-[#334155] hover:bg-[#f8fafc]"
        >
          이 프로젝트에 선택하기
        </Link>
        {/*
          연결을 마쳤는지 화면은 알 수 없다. 사용자가 눌러 서버에 다시 물어보게 한다 —
          아직이면 서버가 같은 자리로 돌려보낸다.
        */}
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="ml-auto inline-flex h-9 cursor-pointer items-center rounded-lg border border-[#c4b5fd] bg-white px-4 text-[13px] font-semibold text-[#6d28d9] hover:bg-[#faf5ff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRetrying ? '확인하는 중' : '연결했어요 — 다시 시도'}
        </button>
      </div>
    </div>
  );
}

export default CloudConnectGuidePanel;
