import type { Metadata } from 'next'

import { HeroSection } from "@/components/marketing/HeroSection"
import { StatsBar } from "@/components/marketing/StatsBar"
import { FeatureGrid } from "@/components/marketing/FeatureGrid"
import { SubjectCoverage } from "@/components/marketing/SubjectCoverage"
import { TestimonialCarousel } from "@/components/marketing/TestimonialCarousel"
import { PricingSection } from "@/components/marketing/PricingSection"
import { CTASection } from "@/components/marketing/CTASection"

export const metadata: Metadata = {
  title: 'AkalLoksewa — Nepal\'s Most Powerful Loksewa Preparation Platform',
  description: '75,000+ questions across 17 subjects. Smart ingestor. Deep analytics. Join 50,000+ aspirants preparing for Nepal\'s Public Service Commission exams.',
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeatureGrid />
      <SubjectCoverage />
      <TestimonialCarousel />
      <PricingSection />
      <CTASection />
    </>
  )
}
