import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData);
      console.log('Login response:', response); // Debug log

      // Check if response has access token
      if (response.access) {
        // User data từ backend (đã có từ CustomTokenObtainPairSerializer)
        const userData = response.user;

        console.log('User data for login:', userData); // Debug log

        // Use AuthContext to save login state (lưu cả access và refresh token)
        login(userData, response.access, response.refresh);

        // Redirect according to role
        const role = (userData && userData.role) ? String(userData.role).toLowerCase() : '';
        let redirectTo = '/';
        if (role === 'admin') redirectTo = '/admin';
        else if (role === 'teacher') redirectTo = '/teacher';
        else if (role === 'student') redirectTo = '/student';

        toast.success(t('login_page.login_success'));
        navigate(redirectTo);
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      setError(t('login_page.login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo">📚 QuizMaster</div>
            <h2>{t('login_page.title')}</h2>
            <p>{t('login_page.welcome_back')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">{t('login_page.username_label')}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('login_page.username_placeholder')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('login_page.password_label')}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('login_page.password_placeholder')}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox">
                <input type="checkbox" />
                <span>{t('login_page.remember_me')}</span>
              </label>
              <a href="#forgot" className="forgot-link">{t('login_page.forgot_password')}</a>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? `🔄 ${t('login_page.logging_in')}` : t('login_page.login_btn')}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>
              {t('login_page.no_account')}
              <Link to="/register" className="signup-link"> {t('login_page.register_link')}</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;