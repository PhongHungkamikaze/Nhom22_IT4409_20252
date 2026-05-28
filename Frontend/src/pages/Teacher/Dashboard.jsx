import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import './Teacher.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [stats, setStats]     = useState(null);
    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [quizData, attemptData] = await Promise.all([
                    apiService.getQuizzes(),
                    apiService.getAttempts ? apiService.getAttempts() : apiService.request('/attempts/'),
                ]);

                const quizzes  = Array.isArray(quizData)         ? quizData         : (quizData.results  || []);
                const attempts = Array.isArray(attemptData)      ? attemptData      : (attemptData.results || []);

                // Tính stats từ dữ liệu thật
                const completedAttempts = attempts.filter(a => a.status === 'completed');
                const scores = completedAttempts.map(a => Number(a.score)).filter(s => !isNaN(s));
                const avgScore = scores.length > 0
                    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10)
                    : null;

                // Unique students
                const uniqueStudents = new Set(attempts.map(a => a.user || a.user_id)).size;

                setStats({
                    totalQuizzes:   quizzes.length,
                    totalStudents:  uniqueStudents,
                    totalAttempts:  attempts.length,
                    avgScore:       avgScore !== null ? `${avgScore}%` : '—',
                });

                setRecentQuizzes(quizzes.slice(0, 5));
                setRecentAttempts(attempts.slice(0, 5));
            } catch (err) {
                console.error('Dashboard fetch failed:', err);
                setStats({ totalQuizzes: 0, totalStudents: 0, totalAttempts: 0, avgScore: '—' });
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const statCards = stats ? [
        {
            label: t('teacher_dashboard.my_quizzes'),
            value: stats.totalQuizzes,
            icon: '📝',
            color: 'blue',
            link: '/teacher/quizzes',
            hint: t('teacher_dashboard.view_all_quizzes'),
        },
        {
            label: t('teacher_dashboard.students_joined'),
            value: stats.totalStudents,
            icon: '👨‍🎓',
            color: 'green',
            link: '/teacher/attempts',
            hint: t('teacher_dashboard.view_list'),
        },
        {
            label: t('teacher_dashboard.total_attempts'),
            value: stats.totalAttempts,
            icon: '🎯',
            color: 'purple',
            link: '/teacher/attempts',
            hint: t('teacher_dashboard.view_details'),
        },
        {
            label: t('teacher_dashboard.avg_score'),
            value: stats.avgScore,
            icon: '⭐',
            color: 'orange',
            link: '/teacher/attempts',
            hint: t('teacher_dashboard.view_attempts_link'),
        },
    ] : [];

    const statusLabel = (s) => {
        const map = {
            completed: t('teacher_dashboard.status_completed'),
            ongoing: t('teacher_dashboard.status_ongoing'),
            processing: t('teacher_dashboard.status_processing'),
            error: t('teacher_dashboard.status_error')
        };
        return map[s] || s;
    };
    const statusClass = (s) => {
        const map = { completed: 'status-completed', ongoing: 'status-upcoming', processing: 'status-pending', error: 'status-inactive' };
        return map[s] || '';
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">{t('teacher_dashboard.title')}</h1>
                    <p className="admin-subtitle">{t('teacher_dashboard.subtitle')}</p>
                </div>
                <div className="header-buttons-group">
                    <Link to="/teacher/quizzes/create" style={{ textDecoration: 'none' }}>
                        <button className="primary-btn">➕ {t('teacher_dashboard.create_quiz')}</button>
                    </Link>
                    <Link to="/teacher/questions/add" style={{ textDecoration: 'none' }}>
                        <button className="primary-btn">📝 {t('teacher_dashboard.add_question')}</button>
                    </Link>
                </div>
            </header>

            <QuickSystem />

            {/* Stat cards */}
            <div className="stats-container" style={{ marginBottom: 24 }}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="stat-card" style={{ opacity: 0.4 }}>
                            <div className="stat-icon">⏳</div>
                            <div className="stat-info"><h3>—</h3><p>{t('teacher_dashboard.loading')}</p></div>
                        </div>
                    ))
                ) : statCards.map((s, i) => (
                    <div
                        key={i}
                        className={`stat-card stat-${s.color} db-stat-clickable`}
                        onClick={() => navigate(s.link)}
                        title={s.hint}
                    >
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-info">
                            <h3>{s.value}</h3>
                            <p>{s.label}</p>
                        </div>
                        <div className="db-stat-arrow">→</div>
                    </div>
                ))}
            </div>

            {/* Two-column: recent quizzes + recent attempts */}
            <div className="db-grid">
                {/* Recent quizzes */}
                <div className="admin-card db-panel">
                    <div className="db-panel__header">
                        <h3 className="db-panel__title">📚 {t('teacher_dashboard.recent_quizzes')}</h3>
                        <Link to="/teacher/quizzes" className="db-panel__link">{t('teacher_dashboard.view_all')}</Link>
                    </div>
                    {loading ? (
                        <div className="db-loading">{t('teacher_dashboard.loading')}</div>
                    ) : recentQuizzes.length === 0 ? (
                        <div className="db-empty">{t('teacher_dashboard.no_quizzes')}</div>
                    ) : (
                        <div className="db-quiz-list">
                            {recentQuizzes.map(q => (
                                <div
                                    key={q.id}
                                    className="db-quiz-item"
                                    onClick={() => navigate(`/teacher/quizzes/${q.id}`)}
                                >
                                    <div className="db-quiz-item__info">
                                        <span className="db-quiz-item__title">{q.title}</span>
                                        <span className="db-quiz-item__meta">
                                            {q.questions_count ?? (q.questions?.length ?? 0)} {t('teacher_dashboard.questions_count')}
                                            {q.time_limit ? ` · ${q.time_limit} ${t('teacher_dashboard.minutes')}` : ''}
                                        </span>
                                    </div>
                                    <div className="db-quiz-item__right">
                                        <span className={`status-badge ${q.is_published ? 'status-completed' : 'status-draft'}`}>
                                            {q.is_published ? 'Published' : 'Draft'}
                                        </span>
                                        <Link
                                            to={`/teacher/quizzes/${q.id}/stats`}
                                            className="db-stats-link"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            📊
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent attempts */}
                <div className="admin-card db-panel">
                    <div className="db-panel__header">
                        <h3 className="db-panel__title">🎯 {t('teacher_dashboard.recent_attempts')}</h3>
                        <Link to="/teacher/attempts" className="db-panel__link">{t('teacher_dashboard.view_all')}</Link>
                    </div>
                    {loading ? (
                        <div className="db-loading">{t('teacher_dashboard.loading')}</div>
                    ) : recentAttempts.length === 0 ? (
                        <div className="db-empty">{t('teacher_dashboard.no_attempts')}</div>
                    ) : (
                        <div className="db-attempt-list">
                            {recentAttempts.map(a => (
                                <div key={a.id} className="db-attempt-item">
                                    <div className="db-attempt-item__info">
                                        <span className="db-attempt-item__user">
                                            👤 {a.user_name || a.username || `User #${a.user}`}
                                        </span>
                                        <span className="db-attempt-item__quiz">
                                            {a.quiz_title || `Quiz #${a.quiz}`}
                                        </span>
                                    </div>
                                    <div className="db-attempt-item__right">
                                        <span className={`status-badge ${statusClass(a.status)}`}>
                                            {statusLabel(a.status)}
                                        </span>
                                        {a.score != null && (
                                            <span className="db-attempt-item__score">{a.score}đ</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}