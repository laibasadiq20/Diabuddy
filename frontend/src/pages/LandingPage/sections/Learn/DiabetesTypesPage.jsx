import React from 'react';
import Navbar from '../../../../components/Navbar';
import DiabetesTypes from '../DiabetesTypes';

const DiabetesPage = () => {
  return (
    <div id="top" className="min-h-screen bg-[#F6F3EE]">
      <Navbar />

      {/* pt-[76px] offsets the fixed navbar so the hero isn't hidden underneath it */}
      <div className="pt-[76px]">
        <DiabetesTypes showHeader />
      </div>
    </div>
  );
};

export default DiabetesPage;