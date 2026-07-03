import type { PreviewVariant } from '@/types/project-card.type';

type ProjectTemplateFields = {
  templateType: string | null;
  startMode: string | null;
};

export function hasProjectTemplate(project: ProjectTemplateFields): boolean {
  if (project.templateType?.trim()) return true;
  return project.startMode === 'template';
}

export function templateTypeToPreviewVariant(templateType: string | null): PreviewVariant {
  const normalized = templateType?.trim().toLowerCase() ?? '';

  if (normalized.includes('portfolio')) return 'portfolio';
  if (normalized.includes('business')) return 'business';
  return 'landing';
}
