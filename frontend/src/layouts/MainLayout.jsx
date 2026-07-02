import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="main-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="main-content" style={{ flexGrow: 1, paddingTop: '76px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
