import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import HomePage from '@/components/layout/home/HomePage';

const homeSearchSchema = z.object({
  templateId: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/home')({
  validateSearch: (search) => homeSearchSchema.parse(search),
  component: HomePage,
});
