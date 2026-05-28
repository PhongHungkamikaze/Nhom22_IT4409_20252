import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import { FiPlay, FiActivity, FiBookOpen, FiHelpCircle, FiClock, FiPieChart } from 'react-icons/fi';
import './Student.css';

export default function Dashboard() {
    const { getUserDisplayName } = useAuth();
    const { t } = useTranslation();
    const [quizzes, setQuizzes] = useState([]);
    const [stats, setStats] = useState({ completedCount: 0, averageScore: '--' });
    const [loading, setLoading] = useState(true);

    const displayName = getUserDisplayName() || t('student_profile.default_name');

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
            {/* ===== Compact Welcome Header ===== */}
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <h1>{t('student_dashboard.hello', { name: displayName })}</h1>
                            <p>{t('student_dashboard.today_desc')}</p>
                        </div>
                        <div className="stu-welcome-actions">
                            <Link to="/student/quizzes" className="stu-btn-primary-clean">
                                <FiPlay className="stu-btn-icon" /> {t('student_dashboard.start_quiz')}
                            </Link>
                            <Link to="/student/history" className="stu-btn-secondary-clean">
                                <FiActivity className="stu-btn-icon" /> {t('student_dashboard.history')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Stats Section ===== */}
            <section className="stu-stats">
                <div className="stu-container">
                    <div className="stu-stats-grid">
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{quizzes.length}</div>
                            <div className="stu-stat-label">{t('student_dashboard.available_quizzes')}</div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{stats.completedCount}</div>
                            <div className="stu-stat-label">{t('student_dashboard.completed')}</div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{stats.averageScore}</div>
                            <div className="stu-stat-label">{t('student_dashboard.average_score')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Available Quizzes ===== */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div className="stu-section-header">
                        <h2 className="stu-section-title">{t('student_dashboard.quizzes_for_you')}</h2>
                        <Link to="/student/quizzes" className="stu-view-all">{t('student_dashboard.view_all')}</Link>
                    </div>

                    {loading ? (
                        <div className="stu-loading">
                            <div className="stu-spinner"></div>
                            <p>{t('student_dashboard.loading_quizzes')}</p>
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="stu-empty">
                            <div className="stu-empty-icon-wrap">
                                <FiBookOpen size={40} className="stu-empty-icon" />
                            </div>
                            <p>{t('student_dashboard.no_quizzes')}</p>
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
                                        {quiz.description || t('student_dashboard.default_desc')}
                                    </p>
                                    <div className="stu-quiz-info">
                                        <span>
                                            <FiHelpCircle className="stu-quiz-info-icon" /> {quiz.questions_count || quiz.question_count || '?'} {t('student_dashboard.questions_count')}
                                        </span>
                                        <span>
                                            <FiClock className="stu-quiz-info-icon" /> {quiz.time_limit || quiz.duration || '30'} {t('student_dashboard.minutes')}
                                        </span>
                                    </div>
                                    <div className="stu-quiz-footer">
                                        <span className="stu-quiz-author">
                                            {t('student_dashboard.by_author', { name: quiz.author || quiz.teacher_name || quiz.created_by || t('student_dashboard.default_author') })}
                                        </span>
                                        <Link to={`/student/quizzes/${quiz.id}`} className="stu-quiz-start-btn">
                                            {t('student_dashboard.start')}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
