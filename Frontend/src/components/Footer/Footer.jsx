import './Footer.css';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Import icon

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Company Info */}
        <div className="footer-section">
          <div className="footer-logo">
            <h3>QuizMaster</h3>
            <p>Nền tảng thi trực tuyến hàng đầu Việt Nam</p>
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
          <h4>Liên kết nhanh</h4>
          <ul className="footer-links">
            <li><a href="#home">Trang chủ</a></li>
            <li><a href="#quizzes">Bài quiz</a></li>
            <li><a href="#about">Giới thiệu</a></li>
            <li><a href="#contact">Liên hệ</a></li>
          </ul>
        </div>

        {/* Features */}
        <div className="footer-section">
          <h4>Tính năng</h4>
          <ul className="footer-links">
            <li><a href="#create-quiz">Tạo bài quiz</a></li>
            <li><a href="#analytics">Thống kê chi tiết</a></li>
            <li><a href="#reports">Báo cáo kết quả</a></li>
            <li><a href="#api">API Documentation</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4>Hỗ trợ</h4>
          <ul className="footer-links">
            <li><a href="#help">Trung tâm trợ giúp</a></li>
            <li><a href="#faq">Câu hỏi thường gặp</a></li>
            <li><a href="#privacy">Chính sách bảo mật</a></li>
            <li><a href="#terms">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Liên hệ</h4>
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