import { todoCodeDiffPayload } from '@/mocks/project/todoCodeDiff';
import type { DiffFile } from '@/types/codeDiff.type';

export type CodeExplorerFileNode = {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  changeCount?: number;
  children?: CodeExplorerFileNode[];
};

function fileNode(path: string, changeCount: number): CodeExplorerFileNode {
  const name = path.split('/').pop() ?? path;
  return {
    id: path.replace(/\//g, '-'),
    name,
    path,
    type: 'file',
    changeCount,
  };
}

function buildTreeFromDiffFiles(files: DiffFile[]): CodeExplorerFileNode[] {
  const root: CodeExplorerFileNode[] = [];
  const folderMap = new Map<string, CodeExplorerFileNode>();

  const ensureFolder = (folderPath: string): CodeExplorerFileNode => {
    const existing = folderMap.get(folderPath);
    if (existing) return existing;

    const name = folderPath.split('/').pop() ?? folderPath;
    const node: CodeExplorerFileNode = {
      id: folderPath.replace(/\//g, '-'),
      name,
      path: folderPath,
      type: 'folder',
      children: [],
    };

    folderMap.set(folderPath, node);

    const parentPath = folderPath.includes('/')
      ? folderPath.slice(0, folderPath.lastIndexOf('/'))
      : '';

    if (parentPath) {
      const parent = ensureFolder(parentPath);
      parent.children = parent.children ?? [];
      parent.children.push(node);
      parent.changeCount = (parent.changeCount ?? 0) + 0;
    } else {
      root.push(node);
    }

    return node;
  };

  for (const file of files) {
    const changeCount = file.additions + file.deletions;
    const parts = file.filename.split('/');

    if (parts.length === 1) {
      root.push(fileNode(file.filename, changeCount));
      continue;
    }

    const folderPath = parts.slice(0, -1).join('/');
    const folder = ensureFolder(folderPath);
    folder.children = folder.children ?? [];
    folder.children.push(fileNode(file.filename, changeCount));
    folder.changeCount = (folder.changeCount ?? 0) + changeCount;
  }

  const rollUpFolderCounts = (nodes: CodeExplorerFileNode[]): void => {
    for (const node of nodes) {
      if (node.type === 'folder' && node.children) {
        rollUpFolderCounts(node.children);
        if (node.changeCount == null) {
          node.changeCount = node.children.reduce((sum, child) => sum + (child.changeCount ?? 0), 0);
        }
      }
    }
  };

  rollUpFolderCounts(root);
  return root;
}

export const codeExplorerTree = buildTreeFromDiffFiles(todoCodeDiffPayload.files);

export const DEFAULT_CODE_FILE_PATH = 'src/App.jsx';

export const codeDiffSummary = todoCodeDiffPayload.summary;
