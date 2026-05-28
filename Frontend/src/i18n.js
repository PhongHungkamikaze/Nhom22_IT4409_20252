import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
    en: { translation: en },
    vi: { translation: vi },
};

// Load persisted language from localStorage
const savedLng = localStorage.getItem('i18nextLng') || localStorage.getItem('language') || 'vi';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLng,
        fallbackLng: 'vi',
        interpolation: { escapeValue: false },
    });

export default i18n;
