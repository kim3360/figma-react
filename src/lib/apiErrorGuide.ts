import {
  dispatchGitHubAppInstallRequired,
  dispatchGitHubAppReauthorizationRequired,
} from '@/constants/authEvents';
import { extractApiErrorCode, extractApiErrorMessage } from '@/utils/response';

/**
 * 오류 코드를 다음 행동으로 옮긴다.
 *
 * 서버 문장은 이미 완결적이다("GitHub App이 이 저장소에 접근할 권한이 없습니다.
 * GitHub App 설정에서 이 저장소 접근을 허용한 뒤 다시 시도해주세요"). 그래서 여기서
 * 문장을 다시 쓰지 않는다 — 두 벌로 적으면 서버가 문구를 고칠 때 화면만 옛말을 한다.
 *
 * 화면이 보탤 수 있는 건 **행동**이다. 읽고 나서 어디로 가야 하는지, 지금 눌러도 되는
 * 건지. 그래서 이 모듈은 짧은 힌트와 이동 위치만 돌려준다.
 */

/** 화면이 붙일 수 있는 후속 행동 */
type ApiErrorAction =
  /** GitHub App 재인증·권한 부여 진입점을 띄운다 */
  | { kind: 'github-app'; label: string }
  /** 앱 안의 다른 화면으로 보낸다 */
  | { kind: 'navigate'; to: string; label: string }
  /** 같은 요청을 다시 시도하게 한다 */
  | { kind: 'retry'; label: string };

type ApiErrorGuide = {
  /** 서버 문구 뒤에 덧붙일 한 줄. 서버 문장을 되풀이하지 않는다 */
  hint: string;
  /** 사용자가 지금 할 수 있는 일. 없으면 undefined */
  action?: ApiErrorAction;
};

/**
 * 코드별 안내.
 *
 * 모르는 코드는 여기 없다 — 그때는 서버 문구만 보여주고 끝낸다. 아는 코드만 손대는
 * 이유는, 서버가 코드를 늘릴 때마다 화면이 엉뚱한 안내를 붙이는 게 아무 안내도 없는
 * 것보다 나쁘기 때문이다.
 */
const API_ERROR_GUIDE: Record<string, ApiErrorGuide> = {
  AI_PROVIDER_UNAVAILABLE: {
    // 크레딧 소진·키 누락·인증 실패가 여기로 온다. 셋 다 기다린다고 풀리지 않는다 —
    // 재시도를 권하면 사용자가 같은 벽에 계속 부딪힌다
    hint: '기다려도 풀리지 않습니다. 다른 AI 제공자를 골라 다시 보내보세요.',
  },
  AI_PROVIDER_RATE_LIMITED: {
    // 이건 반대로 시간이 풀어준다
    hint: '잠시 뒤에 다시 보내면 됩니다.',
    action: { kind: 'retry', label: '다시 보내기' },
  },
  AI_PROVIDER_ERROR: {
    hint: '제공자 쪽 일시적인 문제일 수 있습니다. 다시 보내거나 다른 제공자를 골라보세요.',
    action: { kind: 'retry', label: '다시 보내기' },
  },
  GITHUB_APP_NOT_INSTALLED: {
    hint: 'GitHub App을 설치해야 저장소를 다룰 수 있습니다.',
    action: { kind: 'github-app', label: 'GitHub App 설치하기' },
  },
  GITHUB_APP_REPOSITORY_ACCESS_DENIED: {
    // App 은 설치돼 있는데 이 저장소가 허용 목록에 없는 경우다. 설치가 아니라
    // 권한 범위를 넓히는 일이라 들어가는 화면이 다르다
    hint: 'App은 설치돼 있지만 이 저장소가 허용 목록에 없습니다.',
    action: { kind: 'github-app', label: 'GitHub App 권한 다시 설정' },
  },
  PREVIEW_ENVIRONMENT_UNAVAILABLE: {
    // 서버 쪽 Docker 문제라 사용자가 고칠 수 있는 게 없다. 재시도 외에는
    // 문의밖에 없다는 걸 솔직히 적는다
    hint: '서버 쪽 실행 환경 문제라 잠시 뒤 다시 시도해야 합니다. 계속되면 운영자에게 알려주세요.',
    action: { kind: 'retry', label: '다시 시도' },
  },
};

/** 오류에서 안내를 찾는다. 모르는 코드거나 코드가 없으면 null */
function findApiErrorGuide(error: unknown): ApiErrorGuide | null {
  const code = extractApiErrorCode(error);
  if (!code) return null;
  return API_ERROR_GUIDE[code] ?? null;
}

/**
 * 사용자에게 보여줄 문구. 서버 문장 아래에 힌트를 한 줄 덧붙인다.
 * 아는 코드가 아니면 서버 문장만 그대로 나간다 — 지금까지와 같다.
 */
function composeApiErrorMessage(error: unknown, fallback = '요청 처리 중 오류가 발생했습니다.') {
  const message = extractApiErrorMessage(error) ?? fallback;
  const guide = findApiErrorGuide(error);
  return guide ? `${message}\n\n${guide.hint}` : message;
}

/**
 * 오류가 진입점을 요구하면 띄운다.
 *
 * GitHub App 계열만 해당한다 — 재시도는 사용자가 같은 버튼을 다시 누르면 되고,
 * 제공자 전환은 이미 화면에 셀렉트가 있다. 반면 App 권한은 **여기서 길을 열어주지
 * 않으면 사용자가 GitHub 설정까지 스스로 찾아가야 한다.**
 *
 * 이미 있는 다이얼로그를 재사용한다. 설치 안 됨과 저장소 권한 부족은 둘 다 App
 * 설정 화면으로 가야 하므로 같은 진입점을 쓴다.
 */
function dispatchApiErrorAction(error: unknown): boolean {
  const guide = findApiErrorGuide(error);
  if (guide?.action?.kind !== 'github-app') return false;

  const code = extractApiErrorCode(error);
  if (code === 'GITHUB_APP_NOT_INSTALLED' || code === 'GITHUB_APP_REPOSITORY_ACCESS_DENIED') {
    dispatchGitHubAppInstallRequired();
    return true;
  }

  dispatchGitHubAppReauthorizationRequired();
  return true;
}

export {
  API_ERROR_GUIDE,
  composeApiErrorMessage,
  dispatchApiErrorAction,
  findApiErrorGuide,
  type ApiErrorAction,
  type ApiErrorGuide,
};
