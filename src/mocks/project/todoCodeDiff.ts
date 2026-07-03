import type { CodeDiffPayload, DiffFile } from '@/types/codeDiff.type';
import todoCodeDiffPayloadJson from '@/mocks/project/todoCodeDiff.payload.json';

/** dldnsgkr/my-todo-app 초기 커밋 (4258a263) GitHub diff */
export const todoCodeDiffPayload = todoCodeDiffPayloadJson as CodeDiffPayload;

export function getDiffFileByPath(path: string): DiffFile | undefined {
  return todoCodeDiffPayload.files.find(
    (file) => file.filename === path || file.oldPath === path,
  );
}

export function getDiffFilePaths(): string[] {
  return todoCodeDiffPayload.files.map((file) => file.filename);
}
