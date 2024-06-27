import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import eng from '@/common/locales/eng';
import vie from '@/common/locales/vie';

const resources = {
  eng: {
    translation: eng,
  },
  vie: {
    translation: vie,
  },
};

if (typeof window !== 'undefined') {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'eng',
      debug: true,
      interpolation: {
        escapeValue: false,
      },
    });
}

export default i18n;
