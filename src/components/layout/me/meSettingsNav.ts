import type { LucideIcon } from 'lucide-react';
import {
  Cloud,
  Database,
  HelpCircle,
  LayoutGrid,
  Link2,
  Mail,
  Monitor,
  Plug,
  Star,
  User,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react';

export type MeSettingsSectionId =
  | 'account'
  | 'general'
  | 'billing'
  | 'personalization'
  | 'mail'
  | 'data-control'
  | 'my-computer'
  | 'cloud-browser'
  | 'skills'
  | 'connectors'
  | 'integrations';

export type MeSettingsNavGroupKey = 'account' | 'features';

export type MeSettingsNavItem = {
  id: MeSettingsSectionId;
  icon: LucideIcon;
};

export type MeSettingsNavGroup = {
  groupKey: MeSettingsNavGroupKey;
  items: MeSettingsNavItem[];
};

export const meSettingsNavGroups: MeSettingsNavGroup[] = [
  {
    groupKey: 'account',
    items: [
      { id: 'account', icon: User },
      { id: 'general', icon: SlidersHorizontal },
      { id: 'billing', icon: Star },
      { id: 'personalization', icon: LayoutGrid },
    ],
  },
  {
    groupKey: 'features',
    items: [
      { id: 'mail', icon: Mail },
      { id: 'data-control', icon: Database },
      { id: 'my-computer', icon: Monitor },
      { id: 'cloud-browser', icon: Cloud },
      { id: 'skills', icon: Wand2 },
      { id: 'connectors', icon: Plug },
      { id: 'integrations', icon: Link2 },
    ],
  },
];

export const meSettingsHelpItem = {
  icon: HelpCircle,
};
