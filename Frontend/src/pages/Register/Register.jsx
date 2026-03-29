import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      setError('Mật khẩu xác nhận không khớp!');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
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
      alert('Đăng ký thành công! Hãy đăng nhập để tiếp tục.');
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.username) {
          setError('Tên đăng nhập đã tồn tại!');
        } else if (errorData.email) {
          setError('Email đã được sử dụng!');
        } else {
          setError('Có lỗi xảy ra! Vui lòng thử lại.');
        }
      } else {
        setError('Không thể kết nối đến server!');
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
              <h2>Đăng ký thành công!</h2>
              <p>Tài khoản của bạn đã được tạo thành công.</p>
              <Link to="/login" className="login-btn">
                Đăng nhập ngay
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
            <h2>Đăng ký</h2>
            <p>Tạo tài khoản để bắt đầu hành trình học tập!</p>
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
                <label htmlFor="first_name">Họ</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Nhập họ"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Tên</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Nhập tên"
                  required
                />
              </div>
            </div>

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
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập địa chỉ email"
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
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox">
                <input type="checkbox" required />
                <span>Tôi đồng ý với <a href="#terms">Điều khoản sử dụng</a></span>
              </label>
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? '🔄 Đang đăng ký...' : 'Tạo tài khoản'}
            </button>
          </form>

          {/* Footer */}
          <div className="register-footer">
            <p>
              Đã có tài khoản?
              <Link to="/login" className="login-link"> Đăng nhập</Link>
            </p>
          </div>

          {/* Social Register */}
          <div className="social-register">
            <div className="divider">
              <span>Hoặc đăng ký với</span>
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