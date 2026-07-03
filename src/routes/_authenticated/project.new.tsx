import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import ProjectCreatePage from '@/components/layout/project/ProjectCreatePage';
import { DEFAULT_TEMPLATE_ID, getHomeTemplateById } from '@/mocks/home/homeTemplates';
import type { ProjectStartType } from '@/lib/userProjects';

const projectNewSearchSchema = z.object({
  type: z.enum(['landing', 'portfolio', 'blank']).default('landing'),
  templateId: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/project/new')({
  validateSearch: (search) => {
    const parsed = projectNewSearchSchema.parse(search);
    const templateId = parsed.templateId ?? DEFAULT_TEMPLATE_ID;
    const resolvedTemplate = getHomeTemplateById(templateId);

    return {
      type: parsed.type as ProjectStartType,
      templateId: resolvedTemplate?.id ?? DEFAULT_TEMPLATE_ID,
    };
  },
  component: ProjectCreatePage,
});
