import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { GamesSection } from "@/components/home/GamesSection";
import { TournamentsSection } from "@/components/home/TournamentsSection";
import { RankingsPreview } from "@/components/home/RankingsPreview";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <GamesSection />
      <TournamentsSection />
      <RankingsPreview />
      <FeaturesSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
