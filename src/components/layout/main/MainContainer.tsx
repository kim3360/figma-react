import HeaderContainer from '@/components/layout/header/HeaderContainer';
import HeroSection from './HeroSection';
import HighlightSection from './HighlightSection';
import PainPointsSection from './PainPointsSection';
import RoleSpecificUsage from './RoleSpecificUsage';
import ServiceIntro from './ServiceIntro';
import OutputShowcase from './OutputShowcase';
import UserReviews from './UserReviews';
import ServiceStats from './ServiceStats';
import ProcessSection from './ProcessSection';
import StartNowSection from './StartNowSection';
import PricingSection from './PricingSection';
import Footer from '../footer/Footer';

function MainContainer() {
  return (
    <main className="w-[1440px] mx-auto flex flex-col">
      <HeaderContainer />
      <HeroSection />
      <HighlightSection />
      <PainPointsSection />
      <RoleSpecificUsage />
      <ServiceIntro />
      <OutputShowcase />
      <UserReviews />
      <ServiceStats />
      <ProcessSection />
      <StartNowSection />
      <PricingSection />
      <Footer />
    </main>
  );
}

export default MainContainer;
