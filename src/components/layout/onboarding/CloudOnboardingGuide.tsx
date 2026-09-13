/**
 * 자기 AWS 계정을 처음 연결하는 사용자를 위한 안내.
 *
 * 순수 정적 콘텐츠다 — API 를 부르지 않는다. 백엔드가 준 확정 카피를 이 저장소의
 * 색·타이포로 옮겼다.
 *
 * 비용 숫자와 보안 문구는 백엔드가 C2 구현 코드로 하나씩 검증한 값이다(SSH 키 미생성 ·
 * SSM SecureString 암호화 · t3.micro 기준 비용 · EIP 미할당이라 terminate 로 청구 정지).
 * 사용자가 이 안내를 읽고 자기 카드로 AWS 계정을 만드므로, 구현이 바뀌면 여기도 함께
 * 고쳐야 한다.
 */

import { useState } from 'react';

const COST_ROWS = [
  { label: '서버(EC2)', sub: '가장 작은 기본형 · 24시간 가동', amount: '월 ~$8–19' },
  { label: '공인 IP 주소', sub: '인터넷에서 접속되게', amount: '월 ~$3.6' },
  { label: '저장소·비밀보관', sub: '빌드 결과물·환경변수', amount: '거의 $0' },
];

/**
 * Qeploy 가 사용자 AWS 계정에서 필요로 하는 최소 권한.
 *
 * 출처는 백엔드 `docs/aws-byoc-permissions.md` 다 — 실제 호출부(Ec2Provisioner ·
 * S3ArtifactStore · SsmParameterStore · Ec2InstanceRoleProvisioner · RdsProvisioner)와
 * 1:1 대조해 확정한 값이다. **구현이 바뀌면 여기도 함께 고쳐야 한다.**
 *
 * 문서 원본은 jsonc 라 주석이 달려 있는데 여기서는 걷어냈다 — AWS 정책 편집기가 주석이
 * 있는 JSON 을 거부해서, 그대로 복사하면 붙여넣기가 실패한다.
 *
 * IAM 리소스가 경로(`role/qeploy/*`)가 아니라 **이름 접두사**(`role/qeploy-instance-*`)인
 * 것은 실수가 아니다. 프로비저너가 생성 전에 존재확인용 `getRole(name)` 을 먼저 부르는데,
 * **아직 없는 역할을 AWS 는 경로 없는 평면 ARN 으로 권한평가한다.** 경로로 좁히면 그
 * 호출이 거부되어 배포가 IAM 단계에서 멈춘다 — 실계정 검증에서 실제로 그렇게 막혔다.
 * 되돌리지 말 것.
 *
 * `SsmPublicAmiRead` 의 리소스에서 계정 자리가 비어 있는 것(`ssm:*::parameter/...`)도
 * 실수가 아니다. 최신 AL2023 AMI 는 **AWS 가 소유한 공개 파라미터**라 계정 세그먼트가
 * 없다 — 거기에 계정을 채우면 매칭되지 않아 AMI 조회가 거부되고 인스턴스를 띄우지
 * 못한다. 이것도 실계정 검증에서 실제로 막혔다.
 *
 * RDS 두 문장(Rds*)도 함께 넣는다. 지금 DB 를 안 쓰더라도 나중에 쓰게 되면 키를 다시
 * 만들어야 하는데, 처음 한 번에 넣어두면 그 일이 없다.
 *
 * `RdsServiceLinkedRole` 은 **RDS 를 처음 쓰는 계정에만** 필요하다. 첫 CreateDBInstance 가
 * 서비스 연결 역할(AWSServiceRoleForRDS)을 자동 생성하는데, 그 권한이 없으면 400 으로
 * 막힌다. 이미 RDS 를 써본 계정은 역할이 있어 이 액션이 호출되지 않는다 — 그래서
 * **테스트 계정에서는 구조적으로 안 걸리고, 온보딩을 보고 처음 키를 만든 사람만 막힌다.**
 * 이 안내가 대상으로 하는 게 바로 그 사람이라 빠뜨리면 안 된다.
 *
 * `ec2:DescribeAddresses` 는 고아 EIP 자동청소 워커가 쓴다. 종료가 실패하거나 배포가
 * 중간에 깨져 연결되지 않은 EIP 가 남으면, 워커가 주기적으로 찾아 회수한다 — 그게 없으면
 * 사용자가 AWS 콘솔을 직접 열어 지워야 하고, 애초에 남았다는 것조차 알 수 없다.
 *
 * `ec2:ReleaseAddress` 는 종료 경로에서만 쓰이지만 빠뜨리면 안 된다. 없으면 서버를 꺼도
 * **고정 IP(EIP)가 유휴 상태로 남아 계속 과금된다** — 인스턴스를 껐으니 청구가 멈췄으리라
 * 여기게 되는데 실제로는 안 멈춘다.
 *
 * 검증 상태(2026-09-03):
 * - **EC2·IAM·SSM·S3 경로는 개인 실계정에서 전 주기 검증 완료.** 역할 자동생성부터
 *   launch·헬스체크·종료 정리(getParametersByPath 로 파라미터 훑어 삭제)까지 이 정책
 *   그대로 돌았다. 그 과정에서 세 개가 모자라 하나씩 채웠다 — 위 두 주석이 그 흔적이다.
 * - **EIP 세 액션도 검증 완료.** allocate → associate → 그 주소로 서빙 → 종료 시 release
 *   까지 실계정에서 돌렸다. release 는 로그뿐 아니라 주소가 실제로 응답하지 않는 것까지
 *   확인했다 — 로그에 released 가 찍혀도 남아 있을 수 있어서다.
 * - **RDS 도 실계정에서 검증했다.** 검증 과정에서 두 가지가 모자랐고 둘 다 채웠다 —
 *   서비스 연결 역할 생성 권한(위 참고), 그리고 BE 쪽 RDS 전용 보안그룹.
 */
const IAM_POLICY_JSON = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Ec2LifecycleReadOnlyDescribe",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances", "ec2:DescribeImages", "ec2:DescribeSubnets",
        "ec2:DescribeVpcs", "ec2:DescribeSecurityGroups", "ec2:DescribeAddresses"
      ],
      "Resource": "*"
    },
    {
      "Sid": "Ec2RunTerminateTagged",
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances", "ec2:TerminateInstances", "ec2:CreateTags",
        "ec2:CreateSecurityGroup", "ec2:AuthorizeSecurityGroupIngress",
        "ec2:AllocateAddress", "ec2:AssociateAddress", "ec2:ReleaseAddress"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassOnlyQeployInstanceRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::*:role/qeploy-instance-*"
    },
    {
      "Sid": "CreateQeployInstanceRoleScoped",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole", "iam:PutRolePolicy", "iam:CreateInstanceProfile",
        "iam:AddRoleToInstanceProfile", "iam:GetRole", "iam:GetInstanceProfile"
      ],
      "Resource": [
        "arn:aws:iam::*:role/qeploy-instance-*",
        "arn:aws:iam::*:instance-profile/qeploy-instance-*"
      ]
    },
    {
      "Sid": "SsmProjectParamsOnly",
      "Effect": "Allow",
      "Action": [
        "ssm:PutParameter", "ssm:GetParameter", "ssm:GetParameters",
        "ssm:GetParametersByPath", "ssm:DeleteParameter", "ssm:DeleteParameters"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/qeploy/*"
    },
    {
      "Sid": "SsmPublicAmiRead",
      "Effect": "Allow",
      "Action": "ssm:GetParameter",
      "Resource": "arn:aws:ssm:*::parameter/aws/service/ami-amazon-linux-latest/*"
    },
    {
      "Sid": "S3ArtifactsOnly",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket", "s3:PutObject", "s3:GetObject",
        "s3:DeleteObject", "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::qeploy-artifacts-*",
        "arn:aws:s3:::qeploy-artifacts-*/*"
      ]
    },
    {
      "Sid": "RdsCreateDeleteQeployScoped",
      "Effect": "Allow",
      "Action": ["rds:CreateDBInstance", "rds:DeleteDBInstance"],
      "Resource": "arn:aws:rds:*:*:db:qeploy-*"
    },
    {
      "Sid": "RdsDescribe",
      "Effect": "Allow",
      "Action": "rds:DescribeDBInstances",
      "Resource": "*"
    },
    {
      "Sid": "RdsServiceLinkedRole",
      "Effect": "Allow",
      "Action": "iam:CreateServiceLinkedRole",
      "Resource": "arn:aws:iam::*:role/aws-service-role/rds.amazonaws.com/AWSServiceRoleForRDS",
      "Condition": { "StringEquals": { "iam:AWSServiceName": "rds.amazonaws.com" } }
    }
  ]
}`;

const STEPS = [
  {
    num: '1',
    title: 'AWS 계정 만들기',
    body: 'AWS는 아마존이 운영하는 클라우드 서비스입니다. aws.amazon.com에서 "계정 만들기"로 가입합니다. 준비물은 이메일, 신용/체크카드(본인 확인용), 휴대폰입니다.',
    points: [
      '이메일과 비밀번호로 가입 → 카드 등록 → 문자로 전화 인증',
      '지원 플랜은 무료(Basic)를 고르면 됩니다',
      '가입만으로는 요금이 나오지 않습니다 — 서버를 켤 때부터입니다',
    ],
    tags: ['약 15분', '카드 필요', '한 번만'],
  },
  {
    num: '2',
    title: '전용 사용자와 키 만들기',
    body: 'AWS 콘솔의 IAM에서 Qeploy 전용 사용자를 하나 만들고, 아래 권한을 붙인 뒤 액세스 키를 발급받습니다. 계정의 주 로그인 정보를 쓰지 않고 이 키만 넘기기 때문에, 언제든 이 키만 지우면 접근이 끊깁니다.',
    points: [
      'IAM → 사용자 → 사용자 생성 → 정책을 직접 연결 → JSON으로 아래 내용을 붙여넣기',
      '만든 사용자에서 "액세스 키 만들기" → 용도는 "AWS 외부에서 실행되는 애플리케이션"을 고릅니다',
      'Secret Access Key는 그 화면을 벗어나면 다시 볼 수 없습니다 — 그 자리에서 복사하세요',
    ],
    tags: ['약 10분', '한 번만', 'IAM 사용'],
    showPolicy: true,
  },
  {
    num: '3',
    title: 'Qeploy에 계정 연결하기',
    body: '설정 → 클라우드 연결에서 방금 만든 값을 입력하면 연결이 끝납니다.',
    points: [
      '표시 이름, 리전, Access Key ID, Secret Access Key를 넣습니다',
      'AWS 계정 ID(12자리)도 함께 넣어야 합니다 — 빌드 결과물을 담을 저장소 이름에 쓰입니다. 콘솔 오른쪽 위 계정 메뉴에서 확인할 수 있습니다',
      '입력하면 Qeploy가 자격을 확인합니다 — 상태가 "연결됨"이 되면 준비 완료입니다',
    ],
    tags: ['약 5분', '한 번만'],
  },
  {
    num: '4',
    title: '배포 요청하고 승인하기',
    body: '이제 준비 끝. 채팅으로 "백엔드 서버로 띄워줘"라고 요청하면, Qeploy가 예상 비용과 함께 확인을 요청합니다. 승인을 누르면 몇 분 뒤 접속 주소가 나옵니다.',
    points: [
      '승인하기 전에는 아무것도 만들어지지 않습니다 — 비용도 발생하지 않습니다',
      '더 이상 필요 없으면 서버 종료로 언제든 멈추고 청구를 끊을 수 있습니다 — 되돌릴 수 없고 서버 안 데이터는 사라지지만, 데이터베이스는 별개라 남습니다',
    ],
    tags: ['몇 분', '매번 승인'],
  },
];

const SAFETY_POINTS = [
  '위 2단계 권한이 Qeploy가 요구하는 전부입니다 — 관리자 권한은 필요 없습니다. 서버를 만들고 끄는 일, 그리고 이름이 qeploy로 시작하는 자원만 다룰 수 있습니다. 당신 계정의 다른 자원에는 닿지 않습니다.',
  '데이터베이스 비밀번호 같은 비밀값은 암호화되어 보관되고, 화면·기록 어디에도 그대로 드러나지 않습니다.',
  '서버에 접속하는 열쇠(SSH)는 아예 만들지 않습니다 — 그만큼 위험도 사라집니다.',
  '언제든 연결을 해제하거나 서버를 종료할 수 있고, 그 순간 우리 접근도 함께 끝납니다.',
];

/**
 * 정책 JSON 을 통째로 보여주고 복사시킨다.
 *
 * 손으로 옮겨 적게 하면 반드시 틀린다 — 그리고 IAM 정책은 한 글자만 틀려도 배포가
 * `IAM_PERMISSION` 으로 막히는데, 사용자는 그게 오타 때문인지 알 방법이 없다.
 */
function PolicyBlock() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(IAM_POLICY_JSON);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // 클립보드를 막아둔 브라우저도 있다. 그때는 아래 본문을 직접 긁어 가면 된다
      setIsCopied(false);
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#e2e8f0]">
      <div className="flex items-center justify-between gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
        <p className="text-[12px] font-semibold text-[#334155]">붙여넣을 권한(JSON)</p>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="h-7 cursor-pointer rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-[12px] font-semibold text-[#334155] hover:bg-[#f1f5f9]"
        >
          {isCopied ? '복사했습니다' : '복사'}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto bg-white px-3 py-2.5 font-mono text-[11px] leading-relaxed text-[#334155]">
        {IAM_POLICY_JSON}
      </pre>
      <p className="border-t border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[12px] leading-relaxed text-[#64748b]">
        데이터베이스(RDS)까지 미리 포함했습니다. 지금 안 쓰더라도 나중에 쓰게 되면 키를 다시
        만들어야 하는데, 한 번에 넣어두면 그 일이 없습니다.
      </p>
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#4c1d95]">
      {children}
    </p>
  );
}

function CloudOnboardingGuide() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f8fafc]">
      <div className="mx-auto w-full max-w-[720px] px-6 py-10">
        <header>
          <Eyebrow>Qeploy 시작하기</Eyebrow>
          <h1 className="mt-3 text-[32px] font-bold leading-[1.15] tracking-tight text-[#0f172a]">
            내 클라우드에 백엔드를 올리기 위한 딱 한 번의 준비
          </h1>
          <p className="mt-4 max-w-[34rem] text-[15px] leading-relaxed text-[#64748b]">
            Qeploy가 당신의 백엔드 서버를 직접 띄우려면, 당신 소유의 AWS 계정 한 개가 필요합니다.
            AWS를 처음 써봐도 괜찮습니다 — 순서대로만 따라오면 됩니다.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-[#f5f3ff] px-3.5 py-1.5 text-[13px] font-medium text-[#4c1d95]">
            <span className="size-2 rounded-full bg-[#16a34a]" aria-hidden />
            IAM·서버 설정을 직접 만질 일은 없습니다
          </p>
        </header>

        <section className="mt-10">
          <Eyebrow>먼저, 왜 필요한가요</Eyebrow>
          <h2 className="mt-2 text-[22px] font-bold tracking-tight text-[#0f172a]">
            서버는 &lsquo;당신 것&rsquo;으로 뜹니다
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#64748b]">
            Qeploy는 당신의 서버를 우리 소유가 아니라{' '}
            <strong className="font-semibold text-[#0f172a]">당신 소유의 AWS 계정</strong>에
            띄웁니다. 그래야 서버·데이터·비용이 온전히 당신의 통제 아래 있고, 나중에 Qeploy를
            떠나더라도 당신 것이 그대로 남습니다.
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-[#64748b]">
            그 대신 딱 한 번,{' '}
            <strong className="font-semibold text-[#0f172a]">
              당신의 AWS 계정을 Qeploy에 연결
            </strong>
            해 주면 됩니다. 그다음부터는 &ldquo;백엔드 올려줘&rdquo;라고 요청하면 Qeploy가 알아서
            빌드하고 서버를 띄웁니다.
          </p>
        </section>

        <div className="mt-8 rounded-2xl border border-[#fcd34d] bg-[#fffbeb] p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#b45309]">
            💳 비용 — 정직하게
          </p>
          <h3 className="mt-1 text-[18px] font-bold tracking-tight text-[#0f172a]">
            매달 커피 몇 잔 값, 그리고 끄면 멈춥니다
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#0f172a]">
            서버가 켜져 있는 동안만 AWS가 당신에게 청구합니다. 코드를{' '}
            <strong className="font-semibold">빌드하는 무거운 작업은 Qeploy가 대신</strong>{' '}
            처리하므로 당신 계정엔 안 찍힙니다.
          </p>

          <dl className="mt-4 border-t border-[#fcd34d]">
            {COST_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 border-b border-[#fde68a] py-2.5"
              >
                <dt className="text-[13px] font-medium text-[#0f172a]">
                  {row.label}
                  <span className="block text-[12px] font-normal text-[#92400e]">{row.sub}</span>
                </dt>
                <dd className="whitespace-nowrap text-[13px] font-semibold tabular-nums text-[#0f172a]">
                  {row.amount}
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 pt-3">
              <dt className="text-[15px] font-bold text-[#0f172a]">대략</dt>
              <dd className="whitespace-nowrap text-[16px] font-bold tabular-nums text-[#b45309]">
                월 $12–23
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-[13px] leading-relaxed text-[#0f172a]">
            첫 12개월은 AWS 프리티어로 더 저렴할 수 있고,{' '}
            <strong className="font-semibold">서버를 종료하면 그 순간부터 청구가 멈춥니다.</strong>{' '}
            만들기 전에 Qeploy가 예상 비용을 보여주고, 당신이 승인해야만 진행합니다.
          </p>
        </div>

        <section className="mt-10">
          <Eyebrow>순서대로</Eyebrow>
          <h2 className="mt-2 text-[22px] font-bold tracking-tight text-[#0f172a]">
            네 단계면 끝납니다
          </h2>

          <ol className="mt-5 flex flex-col gap-4">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5f3ff] text-[18px] font-bold tabular-nums text-[#7c3aed]">
                    {step.num}
                  </span>
                  <h3 className="text-[16px] font-bold text-[#0f172a]">{step.title}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-[#64748b]">{step.body}</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {step.points.map((point) => (
                    <li
                      key={point}
                      className="relative pl-5 text-[13px] leading-relaxed text-[#64748b] before:absolute before:left-0 before:top-[0.6em] before:size-1.5 before:rounded-[2px] before:bg-[#c4b5fd]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
                {'showPolicy' in step && step.showPolicy ? <PolicyBlock /> : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {step.tags.map((tag, index) => (
                    <span
                      key={tag}
                      className={`rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-0.5 text-[12px] font-semibold ${
                        index === 0 ? 'text-[#4c1d95]' : 'text-[#64748b]'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#15803d]">
            🔒 안심하세요 — 우리가 못 하는 것
          </p>
          <h3 className="mt-1 text-[18px] font-bold tracking-tight text-[#0f172a]">
            연결해도 당신 계정은 당신 것
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {SAFETY_POINTS.map((point) => (
              <li
                key={point}
                className="relative pl-6 text-[14px] leading-relaxed text-[#0f172a] before:absolute before:left-0 before:font-bold before:text-[#15803d] before:content-['✓']"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>

        <footer className="mt-10 border-t border-[#e2e8f0] pt-8 pb-4">
          <Eyebrow>막히면</Eyebrow>
          <h2 className="mt-2 text-[22px] font-bold tracking-tight text-[#0f172a]">
            한 곳에서 멈춰도 괜찮습니다
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#64748b]">
            어느 단계든 화면 안내를 그대로 따르면 됩니다. 계정을 만드는 1단계가 가장 낯설 수 있는데,
            그건 당신 명의의 계정이라 우리가 대신 만들어 드릴 수는 없는 부분입니다 — 대신
            준비물(이메일·카드·휴대폰)만 있으면 화면을 따라 충분히 하실 수 있습니다.
          </p>
          <p className="mt-5 text-[13px] leading-relaxed text-[#94a3b8]">
            이 안내는 백엔드(서버형) 배포를 위한 것입니다. 정적 사이트만 올릴 때는 AWS 연결 없이도
            배포됩니다.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default CloudOnboardingGuide;
