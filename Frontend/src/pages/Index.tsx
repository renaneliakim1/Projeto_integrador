import Hero from "@/components/Hero";
import GamePreview from "@/components/GamePreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <GamePreview />
      </main>
    </div>
  );
};

export default Index;
