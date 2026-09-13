import { useTranslation } from 'react-i18next';
import MeAccountSettingsPanel from '@/components/layout/me/MeAccountSettingsPanel';
import MeCloudConnectionsPanel from '@/components/layout/me/MeCloudConnectionsPanel';
import MeGeneralSettingsPanel from '@/components/layout/me/MeGeneralSettingsPanel';
import MeSettingsPlaceholderPanel from '@/components/layout/me/MeSettingsPlaceholderPanel';
import type { MeSettingsSectionId } from '@/components/layout/me/meSettingsNav';

type MeSettingsContentPanelProps = {
  activeSection: MeSettingsSectionId;
};

function MeSettingsContentPanel({ activeSection }: MeSettingsContentPanelProps) {
  const { t } = useTranslation();
  const title = t(`me.nav.items.${activeSection}`);

  let panel = <MeSettingsPlaceholderPanel title={title} />;

  if (activeSection === 'account') {
    panel = <MeAccountSettingsPanel />;
  } else if (activeSection === 'general') {
    panel = <MeGeneralSettingsPanel />;
  } else if (activeSection === 'cloud-browser') {
    panel = <MeCloudConnectionsPanel />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[22px] font-bold tracking-tight text-[#0f172a]">{title}</h2>
      {panel}
    </div>
  );
}

export default MeSettingsContentPanel;
