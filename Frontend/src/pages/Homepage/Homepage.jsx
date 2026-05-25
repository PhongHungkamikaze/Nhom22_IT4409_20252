import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
            <h1>Nền tảng thi trực tuyến <span className="highlight">hàng đầu</span></h1>
            <p>Trải nghiệm làm bài thi trực tuyến mượt mà, đánh giá năng lực chính xác và kết quả tức thì với hệ thống QuizMaster.</p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to={getDashboardPath()} className="btn-hero-primary">
                  Đến Bảng điều khiển <FiArrowRight style={{ marginLeft: '8.5px', verticalAlign: 'middle' }} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-hero-primary">
                    Đăng ký ngay <FiArrowRight style={{ marginLeft: '8.5px', verticalAlign: 'middle' }} />
                  </Link>
                  <Link to="/login" className="btn-hero-secondary">
                    Đăng nhập
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

      {/* Audiences Section */}
      <section className="audiences">
        <div className="container">
          <h2 className="section-title">Đối tượng phục vụ</h2>
          <div className="audiences-grid">
            <div className="audience-card">
              <div className="audience-icon-wrapper purple">
                <FiUser />
              </div>
              <h3>Học viên</h3>
              <p>Tham gia làm bài thi thử trực tuyến, tự ôn tập kiến thức, quản lý kết quả điểm số và lịch sử hoạt động để nâng cao năng lực học tập một cách chủ động.</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon-wrapper orange">
                <FiEdit />
              </div>
              <h3>Giáo viên</h3>
              <p>Quản lý ngân hàng câu hỏi đa dạng, soạn đề thi trắc nghiệm linh hoạt, tự động chấm điểm và theo dõi chi tiết bảng điểm của từng học sinh.</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon-wrapper green">
                <FiShield />
              </div>
              <h3>Quản trị viên</h3>
              <p>Quản trị hệ thống toàn diện, kiểm duyệt tài khoản, đảm bảo hệ thống bảo mật ổn định và an toàn với hệ thống chống gian lận thông minh.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow">
        <div className="container">
          <h2 className="section-title">Quy trình hoạt động</h2>
          <div className="workflow-grid">
            <div className="workflow-step">
              <div className="workflow-number">01</div>
              <h3>Đăng ký tài khoản</h3>
              <p>Tạo tài khoản học tập hoặc giảng dạy cá nhân chỉ trong vài bước đơn giản.</p>
            </div>
            <div className="workflow-step">
              <div className="workflow-number">02</div>
              <h3>Chọn / Thiết lập đề thi</h3>
              <p>Học viên lựa chọn bài quiz; giáo viên biên soạn đề từ ngân hàng câu hỏi sẵn có.</p>
            </div>
            <div className="workflow-step">
              <div className="workflow-number">03</div>
              <h3>Làm bài thi trực tuyến</h3>
              <p>Làm bài thi với giao diện thông minh, tự động tính giờ và cảnh báo gian lận.</p>
            </div>
            <div className="workflow-step">
              <div className="workflow-number">04</div>
              <h3>Nhận kết quả tức thì</h3>
              <p>Nhận điểm số ngay sau khi nộp kèm báo cáo giải thích chi tiết từng câu trả lời.</p>
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
              <div className="feature-item-icon-wrap">
                <FiZap />
              </div>
              <div className="feature-content">
                <h3>Nhanh chóng</h3>
                <p>Giao diện tối ưu, phản hồi tức thì, trải nghiệm làm bài mượt mà không bị gián đoạn.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-item-icon-wrap">
                <FiLock />
              </div>
              <div className="feature-content">
                <h3>Bảo mật thông tin</h3>
                <p>Dữ liệu bài làm và thông tin cá nhân của người dùng được bảo vệ tuyệt đối.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-item-icon-wrap">
                <FiBarChart2 />
              </div>
              <div className="feature-content">
                <h3>Phân tích chi tiết</h3>
                <p>Báo cáo phổ điểm trực quan, thống kê điểm số và theo dõi biểu đồ tiến độ làm bài.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-item-icon-wrap">
                <FiShield />
              </div>
              <div className="feature-content">
                <h3>Giám sát chống gian lận</h3>
                <p>Công nghệ giám sát thông minh kết nối liên tục, tự động phát hiện hành vi thoát màn hình.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;