import React from 'react';

import Navbar from '../../components/Navbar.jsx';

import Hero from './sections/Hero.jsx';
import FeaturesSection from './sections/FeaturesSection.jsx';
import HowItWorks from './sections/HowItWorks.jsx';
import ExploreSection from './sections/ExploreSection.jsx';
import CommunitySection from './sections/CommunitySection.jsx';
import Footer from '../../components/Footer.jsx';

const LandingPage = () => {
  return (
    <div className="landing-page-view min-h-screen bg-[var(--cream-soft)]">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <ExploreSection />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default LandingPage;