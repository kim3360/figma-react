export type NotificationTab = 'updates' | 'messages';

export type NotificationMedia = 'feature-demo' | 'gradient' | 'none';

export type NotificationItem = {
  id: string;
  tab: NotificationTab;
  title: string;
  description: string;
  dateLabel: string;
  media: NotificationMedia;
};

export const notificationItems: NotificationItem[] = [
  {
    id: 'n1',
    tab: 'updates',
    title: '업종별 템플릿 갤러리가 열렸어요',
    description: '카페, 교회, 포트폴리오 등 바로 시작할 수 있는 템플릿을 확인해 보세요.',
    dateLabel: '2026.06.10',
    media: 'feature-demo',
  },
  {
    id: 'n2',
    tab: 'updates',
    title: 'NEW: 분석 대시보드에서 프로젝트 성과를 확인하세요',
    description: '방문 수, 전환율, 배포 횟수, 에이전트 사용량을 한 화면에서 추적할 수 있습니다.',
    dateLabel: '2026.06.08',
    media: 'gradient',
  },
  {
    id: 'n3',
    tab: 'messages',
    title: '에이전트 작업이 완료되었습니다',
    description:
      "'블랑뷰티살롱' 프로젝트의 랜딩 페이지 수정이 반영되었습니다. 미리보기에서 확인해 보세요.",
    dateLabel: '2026.06.07',
    media: 'none',
  },
  {
    id: 'n4',
    tab: 'messages',
    title: '배포가 완료되었습니다',
    description: "'개발자 포트폴리오' 프로젝트가 성공적으로 배포되었습니다. 라이브 URL을 확인해 보세요.",
    dateLabel: '2026.06.05',
    media: 'none',
  },
];
