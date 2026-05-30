import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  FiUser, FiLogOut, FiSettings, FiChevronDown,
  FiPieChart, FiHome, FiLayout, FiBookOpen,
  FiBell, FiClock, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, getUserDisplayName } = useAuth();
  const { notifications, unreadCount, markAllRead, markAsRead } = useNotifications();
  const { t } = useTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const roleBasePath = useMemo(() => {
    if (!user) return '/student';
    switch (user.role) {
      case 'teacher': return '/teacher';
      case 'admin': return '/admin';
      default: return '/student';
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    setIsNotifOpen(false);
  };

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
      if (isNotifOpen && !event.target.closest('.notif-container')) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isNotifOpen]);

  const formatNotifTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">

        {/* Logo */}
        {/* Logo Section */}
        <Link to="/" className="logo">
          <div className="logo-badge">Q</div>
          <span className="logo-text">Quiz<span>Master</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                <FiHome className="nav-icon" /> {t('home')}
              </Link>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <Link
                    to={roleBasePath}
                    className={location.pathname === roleBasePath ? 'active' : ''}
                  >
                    <FiLayout className="nav-icon" /> {t('my_page')}
                  </Link>
                </li>
                <li>
                  <Link
                    to={`${roleBasePath}/quizzes`}
                    className={location.pathname.includes('/quizzes') ? 'active' : ''}
                  >
                    <FiBookOpen className="nav-icon" /> {t('quizzes')}
                  </Link>
                </li>
                {user?.role === 'student' && (
                  <>
                    <li>
                      <Link
                        to="/student/class-groups"
                        className={location.pathname.includes('/class-groups') ? 'active' : ''}
                      >
                        <FiLayout className="nav-icon" /> Lớp học
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/student/history"
                        className={location.pathname === '/student/history' ? 'active' : ''}
                      >
                        <FiClock className="nav-icon" /> Lịch sử
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </nav>

        {/* Right Section */}
        <div className="header-right">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="notif-container">
                <button
                  className={`notif-btn ${isNotifOpen ? 'active' : ''}`}
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <FiBell />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>

                {isNotifOpen && (
                  <div className="notif-dropdown animate-in">
                    <div className="notif-header">
                      <h3>{t('notifications')}</h3>
                      <button onClick={markAllRead}>{t('mark_read') || 'Đánh dấu đã đọc'}</button>
                    </div>

                    <div className="notif-list">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <div className="notif-icon">
                              {n.type === 'EXAM_VIOLATION'
                                ? <FiInfo style={{ color: '#ef4444' }} />
                                : <FiBell />}
                              {n.type === 'EXAM_VIOLATION' ? <FiInfo style={{ color: '#ef4444' }} /> : <FiBell />}
                            </div>
                            <div className="notif-content">
                              <p className="notif-title">{n.title}</p>
                              <p className="notif-desc">{n.content}</p>
                              <span className="notif-time">
                                <FiClock /> {formatNotifTime(n.created_at)}
                              </span>
                            </div>
                            {!n.is_read && <div className="unread-dot"></div>}
                          </div>
                        ))
                      ) : (
                        <div className="notif-empty">
                          <FiBell size={40} />
                          <p>{t('no_notifications')}</p>
                        </div>
                      )}
                    </div>

                    <Link to={`${roleBasePath}/notifications`} className="notif-footer">
                      {t('notifications')}
                    </Link>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="user-menu">
                <button
                  className={`user-profile-btn ${isUserMenuOpen ? 'active' : ''}`}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="avatar-wrapper"><FiUser /></div>
                  <div className="user-brief">
                    <span className="welcome-text">{t('welcome')}</span>
                    <span className="display-name">{getUserDisplayName()}</span>
                  </div>
                  <FiChevronDown className={`chevron ${isUserMenuOpen ? 'open' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown animate-in">
                    <div className="dropdown-header">
                      <p className="full-name">{user?.username}</p>
                      <p className="user-role-badge">{user?.role?.toUpperCase()}</p>
                    </div>

                    <div className="dropdown-section">
                      <Link to={`${roleBasePath}/profile`} className="dropdown-item">
                        <FiUser /> {t('profile')}
                      </Link>
                      <Link to={roleBasePath} className="dropdown-item">
                        <FiLayout /> {t('dashboard')}
                      </Link>

                      {/* Student links */}
                      {user?.role === 'student' && (
                        <>
                          <Link to="/student/history" className="dropdown-item">
                            <FiPieChart /> {t('history')}
                          </Link>
                          <Link to="/student/settings" className="dropdown-item">
                            <FiSettings /> {t('settings')}
                          </Link>
                        </>
                      )}

                      {/* Teacher links */}
                      {user?.role === 'teacher' && (
                        <>
                          <Link to="/teacher/quizzes" className="dropdown-item">
                            <FiBookOpen /> {t('quizzes')} {t('of_me') || ''}
                          </Link>
                          <Link to="/teacher/questions" className="dropdown-item">
                            <FiPieChart /> {t('question_bank')}
                          </Link>
                          <Link to="/teacher/attempts" className="dropdown-item">
                            <FiCheckCircle /> {t('view_attempts')}
                          </Link>
                        </>
                      )}

                      {/* Admin links */}
                      {user?.role === 'admin' && (
                        <>
                          <Link to="/admin/users" className="dropdown-item">
                            <FiUser /> {t('manage_users')}
                          </Link>
                          <Link to="/admin/quizzes" className="dropdown-item">
                            <FiBookOpen /> {t('manage_quizzes')}
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="dropdown-footer">
                      <button onClick={handleLogout} className="logout-button">
                        <FiLogOut /> {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-group">
              <Link to="/login" className="login-link">{t('login')}</Link>
              <Link to="/register" className="register-btn">{t('get_started')}</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`mobile-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;