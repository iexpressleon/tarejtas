import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector = ({ variant = 'default' }) => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              language === lang.code
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            aria-label={`Switch to ${lang.label}`}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            language === lang.code
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-white/80 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-indigo-200'
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          <span className="text-lg">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
