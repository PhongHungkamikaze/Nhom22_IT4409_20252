import { useTranslation } from 'react-i18next';
import './Footer.css';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Import icon

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Company Info */}
        <div className="footer-section">
          <div className="footer-logo">
            <h3>QuizMaster</h3>
            <p>{t('footer.tagline')}</p>
          </div>
          <div className="social-links">
            {/* 2. Sử dụng như các thẻ đóng mở */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com">
              <FaTwitter />
            </a>
            <a href="https://instagram.com">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com">
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>{t('footer.quick_links')}</h4>
          <ul className="footer-links">
            <li><a href="#home">{t('footer.home')}</a></li>
            <li><a href="#quizzes">{t('footer.quizzes')}</a></li>
            <li><a href="#about">{t('footer.about')}</a></li>
            <li><a href="#contact">{t('footer.contact')}</a></li>
          </ul>
        </div>

        {/* Features */}
        <div className="footer-section">
          <h4>{t('footer.features')}</h4>
          <ul className="footer-links">
            <li><a href="#create-quiz">{t('footer.create_quiz')}</a></li>
            <li><a href="#analytics">{t('footer.analytics')}</a></li>
            <li><a href="#reports">{t('footer.reports')}</a></li>
            <li><a href="#api">API Documentation</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4>{t('footer.support')}</h4>
          <ul className="footer-links">
            <li><a href="#help">{t('footer.help_center')}</a></li>
            <li><a href="#faq">{t('footer.faq')}</a></li>
            <li><a href="#privacy">{t('footer.privacy')}</a></li>
            <li><a href="#terms">{t('footer.terms')}</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>{t('footer.contact_title')}</h4>
          <div className="contact-info">
            <p>📧 support@quizmaster.vn</p>
            <p>📞 (+84) 123 456 789</p>
            <p>📍 Hà Nội, Việt Nam</p>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} QuizMaster. All rights reserved.</p>
          <p>Made with ❤️ by Group 22</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;