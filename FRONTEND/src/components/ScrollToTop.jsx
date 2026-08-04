import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router doesn't reset scroll position between route changes.
 * Mount this once inside <Router>, above <Routes>, so every navigation
 * (including clicks on links deep in a page, like the footer) starts
 * the next page at the top instead of wherever the previous scroll
 * position happened to be.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }, [pathname]);

  return null;
};

export default ScrollToTop;