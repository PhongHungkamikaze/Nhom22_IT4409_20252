import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('register_page.error_password_mismatch'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('register_page.error_password_short'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password
      };

      await apiService.register(registrationData);
      setSuccess(true);
      alert(t('register_page.register_success_alert'));
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.username) {
          setError(t('register_page.error_username_exists'));
        } else if (errorData.email) {
          setError(t('register_page.error_email_exists'));
        } else {
          setError(t('register_page.error_generic'));
        }
      } else {
        setError(t('register_page.error_connection'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-card">
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h2>{t('register_page.success_title')}</h2>
              <p>{t('register_page.success_desc')}</p>
              <Link to="/login" className="login-btn">
                {t('register_page.login_now')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <div className="logo">📚 QuizMaster</div>
            <h2>{t('register_page.title')}</h2>
            <p>{t('register_page.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">{t('register_page.first_name')}</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder={t('register_page.first_name_placeholder')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">{t('register_page.last_name')}</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder={t('register_page.last_name_placeholder')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">{t('register_page.username_label')}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('register_page.username_placeholder')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('register_page.email_label')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('register_page.email_placeholder')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('register_page.password_label')}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('register_page.password_placeholder')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('register_page.confirm_password')}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('register_page.confirm_password_placeholder')}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox">
                <input type="checkbox" required />
                <span>{t('register_page.agree_terms')} <a href="#terms">{t('register_page.terms_link')}</a></span>
              </label>
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? `🔄 ${t('register_page.registering')}` : t('register_page.create_account')}
            </button>
          </form>

          {/* Footer */}
          <div className="register-footer">
            <p>
              {t('register_page.have_account')}
              <Link to="/login" className="login-link"> {t('register_page.login_link')}</Link>
            </p>
          </div>

          {/* Social Register */}
          <div className="social-register">
            <div className="divider">
              <span>{t('register_page.or_register_with')}</span>
            </div>
            <div className="social-buttons">
              <button className="social-btn google">
                📧 Google
              </button>
              <button className="social-btn facebook">
                📘 Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;