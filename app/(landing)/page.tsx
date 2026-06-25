import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import HeroSection from "./hero-section";
import FeaturesOne from "./features-one";
import HowItWorks from "./how-it-works";
import Showcase from "./showcase";
import FAQs from "./faqs";
import CallToAction from "./call-to-action";
import Footer from "./footer";
import CustomClerkPricing from "@/components/custom-clerk-pricing";

// MenuMatch's friendly, rounded brand typeface (matches the app theme).
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MenuMatch — Plan every meal, share one living menu",
  description:
    "Build your menu library, schedule meals across the day and week, and share a public page that always shows what's being served right now.",
};

export default function Home() {
  return (
    <div className={quicksand.className}>
      <HeroSection />
      <FeaturesOne />
      <HowItWorks />
      <Showcase />
      <section id="pricing" className="scroll-mt-24 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-12 max-w-2xl space-y-4 text-center">
            <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
              Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Simple plans that grow with your kitchen.
            </h2>
          </div>
          <CustomClerkPricing />
        </div>
      </section>
      <FAQs />
      <CallToAction />
      <Footer />
    </div>
  );
}
