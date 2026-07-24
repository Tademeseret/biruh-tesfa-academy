// components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm w-full">
      <nav className="w-full flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 py-2.5 sm:py-4">
        {/* Branding Logo & Title */}
        <Link to="/" onClick={closeMenu} className="flex items-center text-sm sm:text-xl md:text-2xl font-extrabold tracking-tight shrink min-w-0 mr-2">
          <img src="/logo.png" alt="Biruh Tesfa Academy Logo" className="h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 mr-2 sm:mr-3 object-contain shrink-0" />
          <span className="truncate flex flex-wrap gap-1 leading-tight">
            {t('nav.schoolName', 'Biruh Tesfa Academy').split(' ').map((word, idx) => {
              const colors = ['#16a34a', '#ca8a04', '#dc2626'];
              return (
                <span key={idx} style={{ color: colors[idx % colors.length] }}>
                  {word}
                </span>
              );
            })}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-base font-semibold shrink-0">
          <Link to="/" className="text-brand-blue hover:text-brand-green transition-colors">{t('nav.home')}</Link>
          <Link to="/register" className="text-brand-blue hover:text-brand-green transition-colors">{t('nav.register')}</Link>
          <Link to="/portal" className="text-brand-blue hover:text-brand-green transition-colors">{t('nav.portal')}</Link>
          <Link to="/admin/login" className="text-brand-blue hover:text-brand-green transition-colors">{t('nav.admin')}</Link>
          <LanguageToggle />
        </div>

        {/* Mobile Right Controls: Language Switcher & Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-lg text-brand-blue hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold text-brand-blue hover:bg-brand-green/10 hover:text-brand-green transition-colors"
          >
            <span>🏠</span> {t('nav.home')}
          </Link>
          <Link
            to="/register"
            onClick={closeMenu}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold text-brand-blue hover:bg-brand-green/10 hover:text-brand-green transition-colors"
          >
            <span>📝</span> {t('nav.register')}
          </Link>
          <Link
            to="/portal"
            onClick={closeMenu}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold text-brand-blue hover:bg-brand-green/10 hover:text-brand-green transition-colors"
          >
            <span>🎓</span> {t('nav.portal')}
          </Link>
          <Link
            to="/admin/login"
            onClick={closeMenu}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold text-brand-blue hover:bg-brand-green/10 hover:text-brand-green transition-colors"
          >
            <span>🔐</span> {t('nav.admin')}
          </Link>
        </div>
      )}
    </header>
  );
}
