import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

        // Redirect to homepage
        navigate('/');
        alert('Đăng nhập thành công!');
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
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
            <h2>Đăng nhập</h2>
            <p>Chào mừng bạn quay lại!</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#forgot" className="forgot-link">Quên mật khẩu?</a>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? '🔄 Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>
              Chưa có tài khoản?
              <Link to="/register" className="signup-link"> Đăng ký ngay</Link>
            </p>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <div className="divider">
              <span>Hoặc đăng nhập với</span>
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

export default Login;