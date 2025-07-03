// app/page.tsx
'use client'

import Header from '../components/Header'; // Client Component
import HeroSection from '../components/HeroSection'; // Client Component
import Features from '../components/Features'; // Client Component
import Testimonials from '../components/Testimonials'; // Client Component
import Pricing from '../components/Pricing'; // Client Component
import Footer from '../components/Footer'; // Client Component


export default function Home() {
  return (
    <>
      
      <main>

      <Header />
        <HeroSection />
        <Features />
        <Testimonials />
        <Pricing />
     
      <Footer />
      </main>
    </>
  );
}