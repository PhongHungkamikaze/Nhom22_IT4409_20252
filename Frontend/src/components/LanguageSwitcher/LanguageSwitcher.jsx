import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        // Persist user choice
        try {
            localStorage.setItem('i18nextLng', lng);
        } catch (e) {
            // ignore
        }
    };

    return (
        <div className="lang-switcher">
            <button
                onClick={() => changeLanguage('vi')}
                className={`lang-btn ${i18n.language === 'vi' ? 'active' : ''}`}
            >
                VI
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
