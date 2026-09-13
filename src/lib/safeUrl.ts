/**
 * href·src 에 넣어도 되는 http(s) 주소만 통과시킨다.
 *
 * 서버가 주는 값이라도 그대로 넣으면 안 된다 — `javascript:` 스킴이 섞이면 클릭 시
 * 그 자리에서 실행된다. 여기 오는 주소들(배포 URL, 연결 도메인, 프리뷰 게이트웨이)은
 * 서버가 조립하지만 일부는 사용자가 정한 값(저장소 이름, 호스트명)이 섞여 만들어진다.
 *
 * 통과하지 못하면 undefined 를 돌려주므로, 호출부는 링크를 아예 그리지 않으면 된다.
 */
export function toSafeHttpUrl(rawUrl?: string | null): string | undefined {
  const raw = rawUrl?.trim();
  if (!raw) return undefined;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    return parsed.toString();
  } catch {
    // 상대 경로거나 파싱 불가 — 링크로 쓰지 않는다
    return undefined;
  }
}
