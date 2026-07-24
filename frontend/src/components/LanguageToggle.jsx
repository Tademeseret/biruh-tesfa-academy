// components/LanguageToggle.jsx
// A clean two-way toggle between English and Amharic.
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const toggleLanguage = () => {
    i18n.changeLanguage(isAmharic ? 'en' : 'am');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 border border-brand-blue rounded-full px-3 py-1.5 text-sm font-semibold text-brand-blue hover:bg-brand-blue-light transition-colors"
      aria-label="Toggle language"
    >
      <span className={isAmharic ? 'text-gray-400' : 'text-brand-green'}>EN</span>
      <span className="text-gray-300">/</span>
      <span className={isAmharic ? 'text-brand-green' : 'text-gray-400'}>አማ</span>
    </button>
  );
}
