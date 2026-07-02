import React from 'react';
import Symptoms from '../Symptoms';

const WarningSignsPage = () => {
  return (
    <div className="learn-page">
      <Symptoms
        showHeader={true}
        showBackLink={true}
        backTo="/"
        backLabel="Back to home"
        eyebrow="Listen to your body"
      />
    </div>
  );
};

export default WarningSignsPage;