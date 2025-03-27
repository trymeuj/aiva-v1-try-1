import MainLayout from '@/components/layout/MainLayout'
import Hero from '@/components/home/Hero'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import CTA from '@/components/home/CTA'

export default function HomePage() {
  return (
    <MainLayout>
      <div id="homepage" className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Hero />
          <Features />
          <HowItWorks />
          <CTA />
        </div>
      </div>
    </MainLayout>
  )
}