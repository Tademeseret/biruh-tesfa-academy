// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 border-t border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        
        {/* Column 1: Branding & About */}
        <div className="space-y-4">
          <Link to="/" onClick={scrollToTop} className="flex items-center text-xl font-extrabold tracking-wide">
            <img src="/logo.png" alt="Biruh Tesfa Academy Logo" className="h-12 w-12 mr-3 object-contain" />
            <span>
              <span className="text-green-500">{t('nav.schoolName').split(' ')[0]}</span>{' '}
              <span className="text-yellow-500">{t('nav.schoolName').split(' ')[1]}</span>{' '}
              <span className="text-red-500">{t('nav.schoolName').split(' ')[2]}</span>
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-gray-400">
            {t('footer.aboutText')}
          </p>
          <div className="pt-2 text-xs font-semibold text-brand-green">
            🌱 {t('footer.tagline')}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-base border-b border-gray-800 pb-2">
            {t('footer.quickLinks')}
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" onClick={scrollToTop} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>›</span> {t('footer.home')}
              </Link>
            </li>
            <li>
              <Link to="/register" onClick={scrollToTop} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>›</span> {t('footer.register')}
              </Link>
            </li>
            <li>
              <Link to="/portal" onClick={scrollToTop} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>›</span> {t('footer.portal')}
              </Link>
            </li>
            <li>
              <Link to="/admin/login" onClick={scrollToTop} className="hover:text-white transition-colors flex items-center gap-1.5">
                <span>›</span> {t('footer.admin')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Academic Programs & Bank Payment Accounts */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-bold text-base border-b border-gray-800 pb-2 mb-3">
              {t('footer.programs')}
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <span className="text-brand-green font-bold">✓</span> {t('footer.kgProgram')}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-brand-green font-bold">✓</span> {t('footer.primaryProgram')}
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-1">
              💳 {t('footer.bankInfo')}
            </h4>
            <div className="text-xs space-y-1 text-gray-400 bg-gray-800/60 p-2.5 rounded-lg border border-gray-700/50">
              <p className="font-semibold text-gray-200">{t('footer.cbeAccount')}</p>
              <p className="font-semibold text-gray-200">{t('footer.telebirr')}</p>
              <p className="text-[11px] text-gray-400">{t('footer.accountName')}</p>
            </div>
          </div>
        </div>

        {/* Column 4: Contact & Location */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-base border-b border-gray-800 pb-2">
            {t('footer.contactUs')}
          </h3>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-base">📍</span>
              <span>{t('footer.address')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-base">📞</span>
              <span>{t('footer.phone')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-base">✉️</span>
              <span>{t('footer.email')}</span>
            </li>
            <li className="flex items-start gap-2 pt-1">
              <span className="text-base">🕒</span>
              <span>{t('footer.hours')}</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>{t('footer.copyright', { year: currentYear })}</p>
        <button
          type="button"
          onClick={scrollToTop}
          className="hover:text-white transition-colors flex items-center gap-1 bg-gray-800 px-3 py-1.5 rounded-full text-[11px]"
        >
          <span>↑</span> Back to Top
        </button>
      </div>
    </footer>
  );
}
