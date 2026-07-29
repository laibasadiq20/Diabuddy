import React, { lazy, Suspense } from 'react';

import Navbar from '../../components/Navbar.jsx';

import Hero from './sections/Hero.jsx';
import HowItWorks from './sections/HowItWorks.jsx';
import ExploreSection from './sections/ExploreSection.jsx';
import CommunitySection from './sections/CommunitySection.jsx';
import Footer from '../../components/Footer.jsx';

// Charts (recharts) stay out of the first paint
const FeaturesSection = lazy(() => import('./sections/FeaturesSection.jsx'));

const LandingPage = () => {
  return (
    <div className="landing-page-view min-h-screen bg-[var(--cream-soft)]">
      <Navbar />
      <Hero />
      <Suspense fallback={<div style={{ minHeight: 320 }} aria-hidden />}>
        <FeaturesSection />
      </Suspense>
      <HowItWorks />
      <ExploreSection />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default LandingPage;