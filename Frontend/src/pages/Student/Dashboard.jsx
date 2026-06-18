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

        </div>
    );
}
