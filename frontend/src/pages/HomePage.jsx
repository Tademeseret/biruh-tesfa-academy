// pages/HomePage.jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AnnouncementBoard from '../components/AnnouncementBoard';
import Gallery from '../components/Gallery';

/* Reusable hook: adds 'visible' class when element enters viewport */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function HomePage() {
  const { t } = useTranslation();
  const aboutRef = useScrollReveal();

  return (
    <div className="w-full overflow-x-hidden">
      {/* Scroll-reveal animation styles */}
      <style>{`
        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .section-badge {
          display: inline-block;
          background: #15803D;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 16px;
          border-radius: 2px;
          margin-bottom: 12px;
        }
      `}</style>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat min-h-[440px] sm:min-h-[520px] md:min-h-[600px] flex items-center border-b-4 border-brand-green"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/75 md:bg-white/40 backdrop-blur-xs"></div>
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24 md:py-36 text-center z-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-green mb-3 sm:mb-4 leading-tight tracking-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-brand-blue font-medium max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
            <Link
              to="/register"
              className="btn-primary w-full sm:w-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center text-sm sm:text-base py-3 px-6"
            >
              {t('home.ctaRegister')}
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-8 sm:py-16 px-3 sm:px-6">
        <div ref={aboutRef} className="reveal max-w-6xl mx-auto">
          <span className="section-badge">{t('home.aboutTitle')}</span>
          <div className="bg-white border border-gray-200 shadow-md p-4 sm:p-8 border-l-4 border-l-brand-green rounded-xl">
            <h2 className="text-lg sm:text-2xl font-extrabold text-brand-green mb-3 sm:mb-4">{t('home.aboutTitle')}</h2>
            <p className="text-gray-700 leading-relaxed text-xs sm:text-base max-w-4xl">{t('home.aboutBody')}</p>
          </div>
        </div>
      </section>

      <AnnouncementBoard />
      <Gallery />
    </div>
  );
}
