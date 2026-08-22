import React from 'react';
import Navbar from '../../../../components/Navbar';
import DiabetesTypes from '../DiabetesTypes';

const DiabetesPage = () => {
  return (
    <div id="top" className="min-h-screen bg-[#F6F3EE] flex flex-col">
      <Navbar />
      <div className="pt-20 sm:pt-24 lg:pt-28 flex-1">
        <DiabetesTypes showHeader />
      </div>
    </div>
  );
};

export default DiabetesPage;
