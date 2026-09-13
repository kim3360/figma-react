import { createFileRoute } from '@tanstack/react-router';
import CloudOnboardingGuide from '@/components/layout/onboarding/CloudOnboardingGuide';

export const Route = createFileRoute('/_authenticated/onboarding/cloud')({
  component: CloudOnboardingGuide,
});
