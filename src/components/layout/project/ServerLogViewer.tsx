import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getServerLogs } from '@/api/servers';
import { extractApiErrorMessage } from '@/utils/response';
import type { ServerLogSource } from '@/types/server.type';

/**
 * 서버 로그를 화면 안에서 읽는다.
 *
 * 앱이 안 뜨거나 죽었을 때 사용자가 이유를 볼 수 있는 유일한 창구다. 이게 없으면
 * "실패했습니다" 만 보고 왜인지는 영영 모른다 — SSH 도 없는 구조라 더 그렇다.
 *
 * 모달이 아니라 카드 안에 편다. 로그를 보면서 옆의 상태·주소를 같이 봐야 하는데,
 * 모달은 그걸 가린다.
 */

const SOURCE_LABEL: Record<ServerLogSource, { label: string; hint: string }> = {
  APP: { label: '앱', hint: '앱이 찍은 로그입니다.' },
  BOOT: { label: '부팅', hint: '서버가 뜨는 과정입니다 — 앱이 왜 안 떴는지 여기 있습니다.' },
  CADDY: { label: 'HTTPS', hint: '인증서 발급과 프록시 로그입니다.' },
};

/**
 * 이만큼 지나면 "기다리는 게 맞다" 고 말해 준다.
 *
 * 인스턴스가 건강하면 1~3초에 온다. 그런데 부팅 직후나 인증서 발급 중이면 에이전트가
 * 명령을 늦게 집어가서 서버가 40초 가까이 기다린다 — 그 시간을 아무 말 없는 스켈레톤으로
 * 채우면 고장 난 것처럼 보이고, 사용자는 새로고침을 누르거나 창을 닫는다.
 *
 * 정상 응답보다 넉넉히 뒤에 둔다. 매번 뜨면 안내가 아니라 소음이다.
 */
const SLOW_LOG_NOTICE_MS = 4000;

type ServerLogViewerProps = {
  serverId: number;
  /**
   * 고를 수 있는 소스.
   *
   * 종료된 서버는 보존된 부팅 로그만 남아 있다 — 앱·HTTPS 는 인스턴스가 없어 서버가
   * 거절한다. 고를 수 있게 두면 눌러도 오류만 보므로 호출부가 목록을 정한다.
   */
  sources: ServerLogSource[];
};

function ServerLogViewer({ serverId, sources }: ServerLogViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<ServerLogSource>(sources[0]);
  const [isTakingLong, setIsTakingLong] = useState(false);

  const {
    data: logs,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['server-logs', serverId, source],
    queryFn: () => getServerLogs(serverId, source),
    // 열었을 때만 부른다. 로그는 인스턴스에 명령을 보내 읽어오는 것이라 싸지 않다
    enabled: isOpen,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // 읽기가 끝나면 정리된다 — 다음 요청은 다시 조용히 시작한다
  useEffect(() => {
    if (!isFetching) return;
    const timer = window.setTimeout(() => setIsTakingLong(true), SLOW_LOG_NOTICE_MS);
    return () => {
      window.clearTimeout(timer);
      setIsTakingLong(false);
    };
  }, [isFetching]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-3 cursor-pointer text-[12px] font-semibold text-[#334155] underline underline-offset-2 hover:text-[#0f172a]"
      >
        로그 보기
      </button>
    );
  }

  const content = logs?.content?.trim();

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#e2e8f0]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
        <div className="flex gap-1">
          {sources.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === source}
              onClick={() => setSource(option)}
              className={`h-7 cursor-pointer rounded-lg px-2.5 text-[12px] font-semibold ${
                option === source
                  ? 'bg-[#0f172a] text-white'
                  : 'border border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f1f5f9]'
              }`}
            >
              {SOURCE_LABEL[option].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="h-7 cursor-pointer rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[12px] font-semibold text-[#334155] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? '읽는 중' : '새로고침'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-7 cursor-pointer px-1 text-[12px] font-medium text-[#94a3b8] hover:text-[#64748b]"
          >
            접기
          </button>
        </div>
      </div>

      <p className="border-b border-[#f1f5f9] bg-white px-3 py-1.5 text-[11px] text-[#94a3b8]">
        {SOURCE_LABEL[source].hint}
      </p>

      {isFetching && !content ? (
        <div>
          <div className="h-24 animate-pulse bg-[#f8fafc]" />
          {isTakingLong ? (
            <p className="border-t border-[#f1f5f9] px-3 py-2 text-[11px] leading-relaxed text-[#94a3b8]">
              인스턴스에 명령을 보내 읽어오는 중입니다. 서버가 막 뜬 참이거나 인증서를 받는 중이면
              40초쯤 걸릴 수 있습니다 — 기다리시면 됩니다.
            </p>
          ) : null}
        </div>
      ) : error ? (
        <p className="px-3 py-3 text-[12px] leading-relaxed text-[#b91c1c]">
          {extractApiErrorMessage(error) ?? '로그를 읽지 못했습니다.'}
        </p>
      ) : content ? (
        // 로그는 줄이 길다. 가로로도 스크롤되게 두고 줄바꿈하지 않는다 — 접으면 스택
        // 트레이스나 명령줄이 뭉개져서 오히려 읽기 어렵다
        <pre className="max-h-80 overflow-auto bg-[#0f172a] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-[#e2e8f0]">
          {content}
        </pre>
      ) : (
        <p className="px-3 py-3 text-[12px] text-[#94a3b8]">기록된 로그가 없습니다.</p>
      )}
    </div>
  );
}

export default ServerLogViewer;
