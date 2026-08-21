import React, { lazy, Suspense } from 'react';

import Navbar from '../../components/Navbar.jsx';

import Hero from './sections/Hero.jsx';
import HowItWorks from './sections/HowItWorks.jsx';
import ExploreSection from './sections/ExploreSection.jsx';
import SecuritySection from './sections/SecuritySection.jsx';
import FAQSection from './sections/FAQSection.jsx';
import CommunitySection from './sections/CommunitySection.jsx';
import Footer from '../../components/Footer.jsx';

// Charts (recharts) stay out of the first paint
const FeaturesSection = lazy(() => import('./sections/FeaturesSection.jsx'));

const LandingPage = () => {
  return (
    <div className="landing-page-view min-h-screen bg-[var(--cream-soft)] overflow-x-hidden">
      <Navbar />
      <Hero />
      <div className="mt-10 sm:mt-14 lg:mt-16">
        <Suspense fallback={<div style={{ minHeight: 320 }} aria-hidden />}>
          <FeaturesSection />
        </Suspense>
      </div>
      <div className="mt-10 sm:mt-14 lg:mt-16">
        <HowItWorks />
      </div>
      <div className="mt-10 sm:mt-14 lg:mt-16">
        <ExploreSection />
      </div>
      <div className="mt-10 sm:mt-14 lg:mt-16">
        <SecuritySection />
      </div>
      <div className="mt-10 sm:mt-14 lg:mt-16">
        <FAQSection />
      </div>
      <div className="mt-10 sm:mt-14 lg:mt-16">
        <CommunitySection />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;