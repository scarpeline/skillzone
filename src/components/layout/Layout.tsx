import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-hero-gradient">
      <Header />
      <main className="flex-1 pt-16 md:pt-20 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
