import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import {
  FiBookOpen,
  FiActivity,
  FiClock,
  FiZap,
  FiLock,
  FiBarChart2,
  FiShield,
  FiArrowRight,
  FiUser,
  FiEdit
} from 'react-icons/fi';
import './Homepage.css';

const Homepage = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total_quizzes: 0,
    total_users: 0,
    completed_attempts: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use fallback data with snake_case keys matching the database API output
      setStats({
        total_quizzes: 150,
        total_users: 2500,
        completed_attempts: 8750
      });
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/student';
    switch (user.role) {
      case 'teacher':
        return '/teacher';
      case 'admin':
        return '/admin';
      default:
        return '/student';
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{t('homepage.hero_title')} <span className="highlight">{t('homepage.hero_highlight')}</span></h1>
            <p>{t('homepage.hero_desc')}</p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to={getDashboardPath()} className="btn-hero-primary">
                  {t('homepage.go_dashboard')} <FiArrowRight style={{ marginLeft: '8.5px', verticalAlign: 'middle' }} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-hero-primary">
                    {t('homepage.register_now')} <FiArrowRight style={{ marginLeft: '8.5px', verticalAlign: 'middle' }} />
                  </Link>
                  <Link to="/login" className="btn-hero-secondary">
                    {t('login')}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-cards">
              <div className="card card-1">
                <FiActivity className="card-icon" /> Dashboard
              </div>
              <div className="card card-2">
                <FiBookOpen className="card-icon" /> Quiz
              </div>
              <div className="card card-3">
                <FiClock className="card-icon" /> Results
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.total_quizzes}+</div>
              <div className="stat-label">{t('homepage.stat_quizzes')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.total_users}+</div>
              <div className="stat-label">{t('homepage.stat_users')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.completed_attempts}+</div>
              <div className="stat-label">{t('homepage.stat_completed')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences Section */}
      <section className="audiences">
        <div className="container">
          <h2 className="section-title">{t('homepage.audience_title')}</h2>
          <div className="audiences-grid">
            <div className="audience-card">
              <div className="audience-icon-wrapper purple">
                <FiUser />
              </div>
              <h3>{t('homepage.audience_student')}</h3>
              <p>{t('homepage.audience_student_desc')}</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon-wrapper orange">
                <FiEdit />
              </div>
              <h3>{t('homepage.audience_teacher')}</h3>
              <p>{t('homepage.audience_teacher_desc')}</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon-wrapper green">
                <FiShield />
              </div>
              <h3>{t('homepage.audience_admin')}</h3>
              <p>{t('homepage.audience_admin_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow">
        <div className="container">
          <h2 className="section-title">{t('homepage.workflow_title')}</h2>
          <div className="workflow-grid">
            <div className="workflow-step">
              <div className="workflow-number">01</div>
              <h3>{t('homepage.step1_title')}</h3>
              <p>{t('homepage.step1_desc')}</p>
            </div>
            <div className="workflow-step">
              <div className="workflow-number">02</div>
              <h3>{t('homepage.step2_title')}</h3>
              <p>{t('homepage.step2_desc')}</p>
            </div>
            <div className="workflow-step">
              <div className="workflow-number">03</div>
              <h3>{t('homepage.step3_title')}</h3>
              <p>{t('homepage.step3_desc')}</p>
            </div>
            <div className="workflow-step">
              <div className="workflow-number">04</div>
              <h3>{t('homepage.step4_title')}</h3>
              <p>{t('homepage.step4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">{t('homepage.features_title')}</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-item-icon-wrap">
                <FiZap />
              </div>
              <div className="feature-content">
                <h3>{t('homepage.feature_fast')}</h3>
                <p>{t('homepage.feature_fast_desc')}</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-item-icon-wrap">
                <FiLock />
              </div>
              <div className="feature-content">
                <h3>{t('homepage.feature_secure')}</h3>
                <p>{t('homepage.feature_secure_desc')}</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-item-icon-wrap">
                <FiBarChart2 />
              </div>
              <div className="feature-content">
                <h3>{t('homepage.feature_analytics')}</h3>
                <p>{t('homepage.feature_analytics_desc')}</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-item-icon-wrap">
                <FiShield />
              </div>
              <div className="feature-content">
                <h3>{t('homepage.feature_anticheat')}</h3>
                <p>{t('homepage.feature_anticheat_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;