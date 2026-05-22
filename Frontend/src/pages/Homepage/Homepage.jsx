import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { FiBookOpen, FiActivity, FiClock } from 'react-icons/fi';
import './Homepage.css';

const Homepage = () => {
  const [stats, setStats] = useState({
    total_quizzes: 0,
    total_users: 0,
    completed_attempts: 0
  });

  useEffect(() => {
    // Fetch stats from API
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use fallback data
      setStats({
        totalQuizzes: 150,
        totalUsers: 2500,
        completedTests: 8750
      });
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Nền tảng thi trực tuyến <span className="highlight">hàng đầu</span></h1>
            <p>Trải nghiệm làm bài thi trực tuyến mượt mà, đánh giá năng lực chính xác và kết quả tức thì</p>
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
              <div className="stat-label">Bài quiz</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.total_users}+</div>
              <div className="stat-label">Người dùng</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.completed_attempts}+</div>
              <div className="stat-label">Bài thi hoàn thành</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true"></span>
              <div className="feature-content">
                <h3>Nhanh chóng</h3>
                <p>Giao diện tối ưu, tải nhanh, trải nghiệm mượt mà</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true"></span>
              <div className="feature-content">
                <h3>Bảo mật</h3>
                <p>Dữ liệu được mã hóa và bảo vệ tuyệt đối</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true"></span>
              <div className="feature-content">
                <h3>Phân tích chi tiết</h3>
                <p>Báo cáo kết quả chi tiết và thống kê tiến bộ</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon" aria-hidden="true"></span>
              <div className="feature-content">
                <h3>Đa dạng</h3>
                <p>Nhiều loại câu hỏi và định dạng bài thi</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;