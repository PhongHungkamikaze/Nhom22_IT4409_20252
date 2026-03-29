import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import './Homepage.css';

const Homepage = () => {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalUsers: 0,
    completedTests: 0
  });

  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats and quizzes from API
    Promise.all([
      fetchStats(),
      fetchFeaturedQuizzes()
    ]).finally(() => setLoading(false));
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

  const fetchFeaturedQuizzes = async () => {
    try {
      const data = await apiService.getQuizzes(); // Gọi API thật
      setFeaturedQuizzes(data); // Cập nhật state để React vẽ lại giao diện
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quiz:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Dễ': return '#4CAF50';
      case 'Trung bình': return '#FF9800';
      case 'Khó': return '#F44336';
      default: return '#2196F3';
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
            <div className="hero-buttons">
              <button className="btn-hero-primary">Bắt đầu làm bài</button>
              <button className="btn-hero-secondary">Tạo bài quiz</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-cards">
              <div className="card card-1">📊 Dashboard</div>
              <div className="card card-2">🎯 Quiz</div>
              <div className="card card-3">⭐ Results</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.totalQuizzes}+</div>
              <div className="stat-label">Bài quiz</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalUsers}+</div>
              <div className="stat-label">Người dùng</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.completedTests}+</div>
              <div className="stat-label">Bài thi hoàn thành</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="featured-quizzes">
        <div className="container">
          <h2 className="section-title">Bài quiz nổi bật</h2>
          <div className="quizzes-grid">
            {featuredQuizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                  <span
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                  >
                    {quiz.difficulty}
                  </span>
                </div>
                <p className="quiz-description">{quiz.description}</p>
                <div className="quiz-details">
                  <div className="quiz-info">
                    <span>📝 {quiz.questions_count} câu hỏi</span>
                    <span>⏱️ {quiz.time_limit} phút</span>
                  </div>
                  <div className="quiz-author">Bởi: {quiz.author}</div>
                </div>
                <button className="quiz-start-btn">Bắt đầu làm bài</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Nhanh chóng</h3>
              <p>Giao diện tối ưu, tải nhanh, trải nghiệm mượt mà</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Bảo mật</h3>
              <p>Dữ liệu được mã hóa và bảo vệ tuyệt đối</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Phân tích chi tiết</h3>
              <p>Báo cáo kết quả chi tiết và thống kê tiến bộ</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Đa dạng</h3>
              <p>Nhiều loại câu hỏi và định dạng bài thi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;