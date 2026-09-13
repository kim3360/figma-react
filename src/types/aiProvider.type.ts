import { z } from 'zod';

/**
 * 서버가 실제로 쓸 수 있는 AI 제공자.
 *
 * **apiKey 가 설정된 것만 담겨 온다** — 못 쓰는 제공자는 목록에 아예 없다. 그래서 화면은
 * 이 목록을 그대로 그리면 되고, "고를 수는 있는데 누르면 실패하는" 항목이 생기지 않는다.
 *
 * 값을 여기 나열하지 않는 이유가 그것이다. 제공자를 늘리는 것은 서버 설정이라, FE 가
 * 목록을 들고 있으면 늘 때마다 배포가 한 번 더 필요해진다.
 */
const aiProviderInfoSchema = z.object({
  /** 제공자 식별자. 이 값을 메시지 요청의 aiProvider 로 보낸다 */
  provider: z.string().prefault(''),
  /** model 을 안 보내면 서버가 쓰는 값 */
  defaultModel: z.string().nullable().prefault(null),
  /** 지정할 수 있는 모델 전체. 지금은 제공자당 하나씩이다 */
  models: z.array(z.string()).prefault([]),
  /**
   * thinking 파라미터를 받는 모델.
   *
   * 비어 있으면 그 제공자는 thinking 을 지원하지 않는다 — 그런데도 보내면 서버가 400 을
   * 낸다. 화면이 먼저 막아야 하는 조합이다.
   */
  thinkingModels: z.array(z.string()).prefault([]),
});

/** GET /agent/ai-providers 응답 */
const getAiProviderListResSchema = z.object({
  providers: z.array(aiProviderInfoSchema).prefault([]),
});

type AiProviderInfo = z.infer<typeof aiProviderInfoSchema>;
type GetAiProviderListResType = z.infer<typeof getAiProviderListResSchema>;

export {
  aiProviderInfoSchema,
  getAiProviderListResSchema,
  type AiProviderInfo,
  type GetAiProviderListResType,
};
