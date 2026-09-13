import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putPreviewRuntimeConfig, usePreviewRuntimeConfigQuery } from '@/api/previewRuntime';
import { extractApiErrorMessage } from '@/utils/response';

const QUERY_KEY = 'project-infra-page';

/**
 * JAVA_FULLSTACK 은 저장 자체를 서버가 400 으로 막는다(BE #178). 화면에서도 못 고르게 둔다 —
 * 고를 수 있으면 저장은 되는 것처럼 보이다 프리뷰에서 뒤늦게 깨지고, 그때는 원인이 이 설정이라는
 * 걸 알기 어렵다.
 */
const RUNTIME_OPTIONS: { value: string; label: string; description: string; enabled: boolean }[] = [
  {
    value: 'STATIC',
    label: '정적 사이트',
    description: '빌드 결과만 서빙합니다. 백엔드가 없습니다.',
    enabled: true,
  },
  {
    value: 'NODE_SERVER',
    label: 'Node 서버',
    description: '앱이 UI와 API를 함께 서빙하고, DB가 자동으로 마련됩니다.',
    enabled: true,
  },
  {
    value: 'JAVA_FULLSTACK',
    label: 'Java 풀스택 (곧 지원)',
    description: '아직 지원되지 않습니다.',
    enabled: false,
  },
];

const DB_ENGINE_OPTIONS = [
  { value: 'MYSQL', label: 'MySQL' },
  { value: 'POSTGRESQL', label: 'PostgreSQL' },
];

function ProjectRuntimeSection({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient();
  const { data: runtime, isLoading } = usePreviewRuntimeConfigQuery(QUERY_KEY, projectId);

  const [saveError, setSaveError] = useState<string | null>(null);
  /**
   * 사용자가 고친 값만 들고 있고, 없으면 서버 값을 그대로 쓴다.
   * 서버 응답을 effect 로 state 에 밀어넣으면 응답이 늦게 도착할 때 사용자가 고르던 값을
   * 덮어쓰고, 렌더가 한 번 더 돈다. 저장에 성공하면 null 로 되돌려 서버 값을 다시 따른다.
   */
  const [draft, setDraft] = useState<{
    runtimeType: string;
    startCommand: string;
    dbEngine: string;
  } | null>(null);

  const runtimeType = draft?.runtimeType ?? runtime?.runtimeType ?? 'STATIC';
  const startCommand = draft?.startCommand ?? runtime?.startCommand ?? '';
  const dbEngine = draft?.dbEngine ?? runtime?.dbEngine ?? 'MYSQL';

  const editDraft = (
    patch: Partial<{ runtimeType: string; startCommand: string; dbEngine: string }>,
  ) => setDraft({ runtimeType, startCommand, dbEngine, ...patch });

  const saveMutation = useMutation({
    mutationFn: () =>
      putPreviewRuntimeConfig(projectId, {
        runtimeType,
        // 비우면 서버가 기본값(NODE_SERVER 는 npm start)을 쓴다
        startCommand: startCommand.trim() || null,
        dbEngine,
        // PUT 은 전체 교체다. 화면에 입력 자리가 없는 값도 읽은 그대로 실어 보내지 않으면
        // 서버가 기본값으로 되돌린다(apiPathPrefix → "/api", healthPath → null).
        // 지금은 둘 다 기본값이라 티가 안 나지만, JAVA 라우팅 설정에 UI 가 붙으면
        // 런타임을 저장할 때마다 그 값이 조용히 날아간다
        apiPathPrefix: runtime?.apiPathPrefix ?? null,
        healthPath: runtime?.healthPath ?? null,
      }),
    onSuccess: () => {
      setSaveError(null);
      // 저장됐으니 서버 값을 정본으로 되돌린다
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: ['preview-runtime-config'] });
      // 런타임이 바뀌면 DB 소유 주체도 바뀐다(서버형은 자동 마련)
      void queryClient.invalidateQueries({ queryKey: ['project-database-list'] });
    },
    onError: (error) => {
      setSaveError(extractApiErrorMessage(error) ?? '런타임 설정을 저장하지 못했습니다.');
    },
  });

  const isServerRuntime = runtimeType === 'NODE_SERVER';
  const selectedOption = RUNTIME_OPTIONS.find((option) => option.value === runtimeType);

  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
      <h2 className="text-[16px] font-bold text-[#0f172a]">프리뷰 런타임</h2>
      <p className="mt-1 text-[13px] text-[#64748b]">
        프리뷰에서 이 프로젝트를 어떻게 실행할지 정합니다.
        {runtime?.source === 'DEFAULT' ? ' 아직 설정하지 않아 기본값으로 동작합니다.' : ''}
      </p>

      {isLoading ? (
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-[#f8fafc]" />
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-[#475569]">런타임 타입</span>
              <select
                value={runtimeType}
                onChange={(event) => editDraft({ runtimeType: event.target.value })}
                className="h-9 rounded-lg border border-[#e2e8f0] px-2.5 text-[13px]"
              >
                {RUNTIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} disabled={!option.enabled}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {isServerRuntime ? (
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[#475569]">DB 엔진</span>
                <select
                  value={dbEngine}
                  onChange={(event) => editDraft({ dbEngine: event.target.value })}
                  className="h-9 rounded-lg border border-[#e2e8f0] px-2.5 text-[13px]"
                >
                  {DB_ENGINE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {selectedOption ? (
            <p className="mt-2 text-[12px] leading-relaxed text-[#94a3b8]">
              {selectedOption.description}
            </p>
          ) : null}

          {isServerRuntime ? (
            <label className="mt-3 flex flex-col gap-1">
              <span className="text-[12px] font-medium text-[#475569]">실행 명령 (선택)</span>
              <input
                value={startCommand}
                onChange={(event) => editDraft({ startCommand: event.target.value })}
                placeholder="npm start"
                className="h-9 rounded-lg border border-[#e2e8f0] px-2.5 text-[13px]"
              />
              <span className="text-[11px] text-[#94a3b8]">
                비워 두면 npm start 로 실행합니다. DB 접속정보는 환경변수로 자동 주입됩니다.
              </span>
            </label>
          ) : null}

          {saveError ? <p className="mt-3 text-[12px] text-[#dc2626]">{saveError}</p> : null}

          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="mt-3 h-9 cursor-pointer rounded-lg bg-[#0f172a] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveMutation.isPending ? '저장 중...' : '런타임 저장'}
          </button>
        </>
      )}
    </section>
  );
}

export default ProjectRuntimeSection;
