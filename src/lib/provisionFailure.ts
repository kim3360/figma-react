/**
 * 프로비저닝 실패 문구. DB(RDS·LOCAL)와 EC2 서버가 서버에서 같은 분류
 * (`ProvisionFailureCode`)를 쓰므로 화면 문구도 한 곳에서 관리한다 — 따로 두면
 * 한쪽만 고쳐진 채 같은 오류가 화면마다 다르게 읽힌다.
 */

/** 모르는 분류는 PROVIDER_ERROR 로 취급한다 — 서버가 오류 종류를 늘려도 화면이 버틴다 */
const PROVISION_ERROR_LABEL: Record<string, string> = {
  IAM_PERMISSION: '클라우드 권한이 부족합니다',
  QUOTA_EXCEEDED: '클라우드 할당량을 초과했습니다',
  ENGINE_UNSUPPORTED: '지원하지 않는 엔진입니다',
  PROVIDER_ERROR: '클라우드 오류가 발생했습니다',
};

/**
 * 실패 사유 라벨.
 *
 * 실패인데 errorCode 가 없으면 사용자가 거부한 것이다(승인 거절). 클라우드 오류가
 * 아니므로 그렇게 말하면 안 된다 — 사용자가 스스로 거부해놓고 "클라우드 오류가
 * 발생했습니다"를 보면 원인을 잘못 짚게 된다.
 */
function describeProvisionFailure(resource: {
  status: string;
  errorCode: string | null;
}): string | null {
  if (!resource.errorCode) {
    return resource.status === 'FAILED' ? '요청이 거부되었습니다' : null;
  }
  return PROVISION_ERROR_LABEL[resource.errorCode] ?? PROVISION_ERROR_LABEL.PROVIDER_ERROR;
}

export { PROVISION_ERROR_LABEL, describeProvisionFailure };
