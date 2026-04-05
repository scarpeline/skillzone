import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { GamesSection } from "@/components/home/GamesSection";
import { TournamentsSection } from "@/components/home/TournamentsSection";
import { RankingsPreview } from "@/components/home/RankingsPreview";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";
import { motion, useScroll, useSpring } from "framer-motion";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <Layout>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />
      <HeroSection />
      <div className="space-y-10 md:space-y-20">
        <GamesSection />
        <TournamentsSection />
        <RankingsPreview />
        <FeaturesSection />
        <CTASection />
      </div>
    </Layout>
  );
};

export default Index;