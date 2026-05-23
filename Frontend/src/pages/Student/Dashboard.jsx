import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { FiPlay, FiActivity, FiBookOpen, FiHelpCircle, FiClock, FiPieChart } from 'react-icons/fi';
import './Student.css';

export default function Dashboard() {
    const { getUserDisplayName } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [stats, setStats] = useState({ completedCount: 0, averageScore: '--' });
    const [loading, setLoading] = useState(true);

    const displayName = getUserDisplayName() || 'Bạn';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [quizzesData, attemptsData] = await Promise.all([
                    apiService.getQuizzes(),
                    apiService.getAttempts ? apiService.getAttempts() : apiService.request('/attempts/'),
                ]);

                const quizList = Array.isArray(quizzesData.results)
                    ? quizzesData.results
                    : Array.isArray(quizzesData) ? quizzesData : [];
                setQuizzes(quizList);

                const attemptList = Array.isArray(attemptsData.results)
                    ? attemptsData.results
                    : Array.isArray(attemptsData) ? attemptsData : [];

                const completedAttempts = attemptList.filter(a => a.status === 'completed');
                const completedCount = completedAttempts.length;

                const scores = completedAttempts.map(a => Number(a.score)).filter(s => !isNaN(s));
                const averageScore = scores.length > 0
                    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                    : '--';

                setStats({
                    completedCount,
                    averageScore
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="student-page">
            {/* ===== Hero Section ===== */}
            <section className="stu-hero">
                <div className="stu-hero-content">
                    <div className="stu-hero-text">
                        <h1>Xin chào, <span className="stu-highlight">{displayName}</span>!</h1>
                        <p>Sẵn sàng chinh phục kiến thức mới? Hãy chọn một bài quiz và bắt đầu ngay thôi!</p>
                        <div className="stu-hero-buttons">
                            <Link to="/student/quizzes" className="stu-btn-primary">
                                <FiPlay className="stu-btn-icon" /> Làm bài ngay
                            </Link>
                            <Link to="/student/history" className="stu-btn-secondary">
                                <FiActivity className="stu-btn-icon" /> Xem lịch sử
                            </Link>
                        </div>
                    </div>
                    <div className="stu-hero-visual">
                        <div className="stu-floating-cards">
                            <div className="stu-card-floating stu-card-floating-1">
                                <FiActivity className="stu-card-floating-icon" /> Dashboard
                            </div>
                            <div className="stu-card-floating stu-card-floating-2">
                                <FiBookOpen className="stu-card-floating-icon" /> Quiz
                            </div>
                            <div className="stu-card-floating stu-card-floating-3">
                                <FiClock className="stu-card-floating-icon" /> Results
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Stats Section ===== */}
            <section className="stu-stats">
                <div className="stu-container">
                    <div className="stu-stats-grid">
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{quizzes.length}</div>
                            <div className="stu-stat-label">Bài quiz khả dụng</div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{stats.completedCount}</div>
                            <div className="stu-stat-label">Đã hoàn thành</div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{stats.averageScore}</div>
                            <div className="stu-stat-label">Điểm trung bình</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Available Quizzes ===== */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div className="stu-section-header">
                        <h2 className="stu-section-title">Bài quiz dành cho bạn</h2>
                        <Link to="/student/quizzes" className="stu-view-all">Xem tất cả →</Link>
                    </div>

                    {loading ? (
                        <div className="stu-loading">
                            <div className="stu-spinner"></div>
                            <p>Đang tải bài quiz...</p>
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="stu-empty">
                            <div className="stu-empty-icon-wrap">
                                <FiBookOpen size={40} className="stu-empty-icon" />
                            </div>
                            <p>Chưa có bài quiz nào. Hãy quay lại sau nhé!</p>
                        </div>
                    ) : (
                        <div className="stu-quizzes-grid">
                            {quizzes.slice(0, 6).map(quiz => (
                                <div key={quiz.id} className="stu-quiz-card">
                                    <div className="stu-quiz-header">
                                        <h3>{quiz.title}</h3>
                                        {quiz.difficulty && (
                                            <span className={`stu-difficulty stu-diff-${(quiz.difficulty || '').toLowerCase()}`}>
                                                {quiz.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <p className="stu-quiz-desc">
                                        {quiz.description || 'Hãy thử sức với bài quiz này!'}
                                    </p>
                                    <div className="stu-quiz-info">
                                        <span>
                                            <FiHelpCircle className="stu-quiz-info-icon" /> {quiz.questions_count || quiz.question_count || '?'} câu hỏi
                                        </span>
                                        <span>
                                            <FiClock className="stu-quiz-info-icon" /> {quiz.time_limit || quiz.duration || '30'} phút
                                        </span>
                                    </div>
                                    <div className="stu-quiz-footer">
                                        <span className="stu-quiz-author">
                                            Bởi: {quiz.author || quiz.teacher_name || quiz.created_by || 'Giáo viên'}
                                        </span>
                                        <Link to={`/student/quizzes/${quiz.id}`} className="stu-quiz-start-btn">
                                            Bắt đầu
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== Quick Navigation ===== */}
            <section className="stu-nav-section">
                <div className="stu-container">
                    <h2 className="stu-section-title">Truy cập nhanh</h2>
                    <div className="stu-nav-grid">
                        <Link to="/student/quizzes" className="stu-nav-card">
                            <div className="stu-nav-icon-wrap">
                                <FiBookOpen className="stu-nav-icon" />
                            </div>
                            <h3>Danh sách Quiz</h3>
                            <p>Xem tất cả bài quiz có sẵn</p>
                        </Link>
                        <Link to="/student/history" className="stu-nav-card">
                            <div className="stu-nav-icon-wrap">
                                <FiPieChart className="stu-nav-icon" />
                            </div>
                            <h3>Lịch sử làm bài</h3>
                            <p>Xem kết quả các bài đã làm</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
