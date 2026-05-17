import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';


const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1>Trang không tìm thấy</h1>
          <p>Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          
          <div className="error-illustration">
            <div className="confused-emoji">😕</div>
          </div>

          <div className="action-buttons">
            <Link to="/" className="btn-primary">
              Về trang chủ
            </Link>
            <button onClick={() => window.history.back()} className="btn-secondary">
              Quay lại
            </button>
          </div>

          <div className="helpful-links">
            <h3>Các trang thường dùng:</h3>
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/register">Đăng ký</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

