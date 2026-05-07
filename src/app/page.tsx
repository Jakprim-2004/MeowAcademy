import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import TestimonialsSection from "@/components/TestimonialsSection";
import PaymentSlipsSection from "@/components/PaymentSlipsSection";
import FAQSection from "@/components/FAQSection";
import MeowSound from "@/components/MeowSound";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MeowSound />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <PaymentSlipsSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
