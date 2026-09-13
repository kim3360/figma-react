/**
 * 승인 유형·상태 문구.
 *
 * 채팅의 승인 카드와 승인 탭이 같은 승인을 서로 다른 화면에서 보여준다. 문구를
 * 각자 들고 있으면 한쪽만 고쳐진 채 같은 승인이 화면마다 다르게 읽힌다 — 실제로
 * 승인 탭은 `SERVER_PROVISION` 같은 원시 값을 그대로 보여주고 있었다.
 */

/** 승인 유형별 제목과 설명. 무엇을 승인하는지 버튼 바로 옆에서 읽히게 한다 */
const APPROVAL_COPY: Record<string, { title: string; description: string }> = {
  CHANGE: {
    title: '변경 사항 승인',
    description: '에이전트가 만든 코드 변경을 적용할지 결정합니다.',
  },
  DEPLOYMENT: {
    title: '배포 승인',
    description: '이 작업물을 배포할지 결정합니다.',
  },
  DOMAIN_BINDING: {
    title: '도메인 연결 승인',
    description: '이 프로젝트에 도메인을 연결할지 결정합니다.',
  },
  /*
    떼어내는 것은 붙이는 것과 다른 결정이라 따로 쓴다.

    전에는 둘이 같은 유형이라 해제 승인에도 "도메인을 연결할지 결정합니다" 가 떴다.
    상세줄만 "연결 해제" 라고 맞게 적혀 있었는데, 제목과 설명이 반대를 말하면 그쪽을
    먼저 읽는다 — 되돌리기 어려운 동작에서 가장 나쁜 종류의 어긋남이다.

    서버가 이 유형으로 바꿔 보내기 전에 미리 넣어 둔다. 그래야 배포되는 순간부터
    제대로 읽히고, 그동안 원시 값이 노출되는 구간도 안 생긴다.
  */
  DOMAIN_UNBIND: {
    title: '도메인 연결 해제 승인',
    description: '이 도메인을 프로젝트에서 떼어냅니다. 그 주소로는 더 이상 접속할 수 없습니다.',
  },
  INFRA_OPERATION: {
    title: '인프라 작업 승인',
    description: '인프라를 변경하는 작업입니다. 진행할지 결정합니다.',
  },
  REPOSITORY_BINDING: {
    title: 'GitHub 저장소 연결',
    description:
      '작업물이 준비됐는데 이 프로젝트에는 아직 GitHub 저장소가 연결되어 있지 않습니다. 아래 이름으로 새 저장소를 만들어 연결합니다.',
  },
  RESULT: {
    title: '작업 결과 승인',
    description: '에이전트가 낸 결과를 확정할지 결정합니다.',
  },
  SERVER_PROVISION: {
    title: '백엔드 서버 생성',
    description: '당신의 AWS 계정에 서버를 만듭니다. 켜져 있는 동안 과금됩니다.',
  },
  DATABASE_PROVISION: {
    title: '데이터베이스 생성',
    description: '당신의 AWS 계정에 데이터베이스를 만듭니다. 켜져 있는 동안 과금됩니다.',
  },
};

/** 모르는 유형이 와도 카드는 떠야 한다. 결정할 방법이 사라지는 것보다 낫다 */
const FALLBACK_APPROVAL_COPY = {
  title: '승인이 필요합니다',
  description: '아래 내용을 확인하고 결정해 주세요.',
};

/** 처리된 승인 목록에서 쓰는 상태 문구 */
const APPROVAL_STATUS_LABEL: Record<string, string> = {
  PENDING: '대기 중',
  APPROVED: '승인함',
  REJECTED: '거절함',
  CANCELLED: '취소됨',
};

/** 유형 제목. 모르는 값은 그대로 보여준다 — 원시 값이라도 없는 것보다 낫다 */
function describeApprovalType(type: string): string {
  return APPROVAL_COPY[type]?.title ?? type;
}

export {
  APPROVAL_COPY,
  APPROVAL_STATUS_LABEL,
  FALLBACK_APPROVAL_COPY,
  describeApprovalType,
};
