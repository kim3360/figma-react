import AppHeader from '@/components/common/AppHeader';
import HomeExploreSection from '@/components/layout/home/HomeExploreSection';
import HomePromptHero from '@/components/layout/home/HomePromptHero';

function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <AppHeader />
      <div className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-12 sm:px-6">
        <HomePromptHero />
        <HomeExploreSection />
      </div>
    </div>
  );
}

export default HomePage;
