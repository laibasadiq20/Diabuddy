import React from 'react';
import Navbar from '../../../../components/Navbar';
import DiabetesTypes from '../DiabetesTypes';

const DiabetesPage = () => {
  return (
    <div id="top" className="min-h-screen bg-[#F6F3EE]">
      <Navbar />
      <div className="pt-[48px] sm:pt-[56px]">
        <DiabetesTypes showHeader />
      </div>
    </div>
  );
};

export default DiabetesPage;
