import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, getUserDisplayName } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Debug log
  console.log('Header - Auth state:', { user, isAuthenticated, displayName: getUserDisplayName() });

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="header">
      <div className="header-container">

        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">QuizMaster</span>
        </Link>

        {/* Navigation */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/">Trang chủ</Link></li>
            <li><a href="#quizzes">Bài Quiz</a></li>
            <li><a href="#about">Giới thiệu</a></li>
            <li><a href="#contact">Liên hệ</a></li>
          </ul>
        </nav>

        {/* Auth Buttons / User Menu */}
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={toggleUserMenu}
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">Xin chào, {getUserDisplayName()}!</span>
                <span className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-detail">
                      <strong>{user?.username}</strong>
                      {user?.email && <div className="user-email">{user.email}</div>}
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <a href="#profile" className="dropdown-item">
                    <span className="item-icon">👤</span>
                    Thông tin cá nhân
                  </a>
                  <a href="#history" className="dropdown-item">
                    <span className="item-icon">📊</span>
                    Lịch sử làm bài
                  </a>
                  <a href="#settings" className="dropdown-item">
                    <span className="item-icon">⚙️</span>
                    Cài đặt
                  </a>
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <span className="item-icon">🚪</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleLogin}>
                Đăng nhập
              </button>
              <button className="btn-primary" onClick={handleRegister}>
                Đăng ký
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;