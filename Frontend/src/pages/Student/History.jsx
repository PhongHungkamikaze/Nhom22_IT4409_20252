import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome,
    FiBookOpen,
    FiActivity,
    FiAward,
    FiCheckCircle,
    FiClock,
    FiEye,
    FiCalendar,
    FiFileText
} from 'react-icons/fi';
import Pagination from '../../components/common/Pagination';
import './Student.css';

export default function History() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState('-started_at');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const fetchAttempts = async (page = currentPage) => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm,
                ordering: sorting,
                page: page,
                page_size: pageSize,
                status: filter === 'all' ? undefined : filter
            };
            const data = await apiService.getAttempts(params);
            if (data.results) {
                setAttempts(data.results);
                setTotalCount(data.count);
            } else {
                setAttempts(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch attempts:', err);
            setError('Không thể tải lịch sử làm bài');
            setAttempts([]);
        } finally {
            setLoading(false);
        }
    };

    // READ: Fetch all attempts
    useEffect(() => {
        const fetchAttempts = async (page = 1) => {
            try {
                setLoading(true);

                const data = await apiService.getAttempts();

                const attemptList = Array.isArray(data.results)
                    ? data.results
                    : Array.isArray(data)
                        ? data
                        : [];

                setAttempts(attemptList);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch attempts:', err);

                setError(t('student_history.error_load'));
                setAttempts([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchAttempts(1);
        }, 500);

        return () => clearTimeout(timeoutId);

    }, [searchTerm, sorting, filter]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchAttempts(newPage);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return { label: t('student_history.status_completed'), className: 'is-completed' };
            case 'processing':
                return { label: t('student_history.status_processing'), className: 'is-processing' };
            case 'ongoing':
                return { label: t('student_history.status_ongoing'), className: 'is-ongoing' };
            default:
                return { label: status || t('student_history.status_unknown'), className: 'is-unknown' };
        }
    };

    // Score styling class helper
    const getScoreClass = (score) => {
        const numScore = parseFloat(score);
        if (isNaN(numScore)) return 'stu-score-low';
        if (numScore >= 8.0) return 'stu-score-high';
        if (numScore >= 5.0) return 'stu-score-medium';
        return 'stu-score-low';
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="student-page">
                <section className="stu-loading">
                    <div className="stu-spinner"></div>
                    <p>{t('student_history.loading')}</p>
                </section>
            </div>
        );
    }

    return (
        <div className="student-page">
            {/* Header Hero Banner */}
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <div className="stu-header-badge">
                                <FiActivity className="stu-badge-icon" />
                                {t('student_history.badge')}
                            </div>
                            <h1>{t('student_history.title')}</h1>
                            <p>{t('student_history.subtitle')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard Row */}
            <section className="stu-stats" style={{ padding: '2rem 0' }}>
                <div className="stu-container">
                    <div className="stu-stats-grid">
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">{totalCount}</div>
                            <div className="stu-stat-label">
                                {filter === 'all' ? t('student_history.total_attempts') : filter === 'completed' ? t('student_history.completed') : t('student_history.in_progress')}
                            </div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">
                                {attempts.filter(a => a.status === 'completed').length > 0
                                    ? (
                                        (attempts.filter(a => a.status === 'completed').reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0) / attempts.filter(a => a.status === 'completed').length).toFixed(1)
                                    )
                                    : '0.0'}
                            </div>
                            <div className="stu-stat-label">{t('student_history.average_score')}</div>
                        </div>
                        <div className="stu-stat-item">
                            <div className="stu-stat-number">
                                {attempts.filter(a => a.status === 'completed' && parseFloat(a.score) >= 5.0).length}
                            </div>
                            <div className="stu-stat-label">{t('student_history.passed_count')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter & Content Section */}
            <section className="stu-quizzes-section" style={{ paddingTop: '1.5rem' }}>
                <div className="stu-container">

                    {/* Segmented Controls Filters */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <div className="stu-history-filters-premium">
                            {['all', 'completed', 'ongoing'].map(filterOption => (
                                <button
                                    key={filterOption}
                                    onClick={() => setFilter(filterOption)}
                                    className={`stu-filter-btn-premium${filter === filterOption ? ' active' : ''}`}
                                >
                                    {filterOption === 'all' && t('student_history.filter_all')}
                                    {filterOption === 'completed' && t('student_history.filter_completed')}
                                    {filterOption === 'ongoing' && t('student_history.filter_ongoing')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="stu-alert stu-alert-error">
                            {error}
                        </div>
                    )}

                    {/* Attempts Table/List Card */}
                    {attempts.length === 0 ? (
                        <div className="stu-empty" style={{ background: '#ffffff', borderRadius: '20px', padding: '4rem 2rem', border: '1px solid #eef2f6' }}>
                            <div className="stu-empty-icon-wrap">
                                <FiFileText size={40} className="stu-empty-icon" />
                            </div>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>
                                {filter === 'all'
                                    ? t('student_history.no_attempts_all')
                                    : filter === 'completed'
                                        ? t('student_history.no_attempts_completed')
                                        : t('student_history.no_attempts_ongoing')}
                            </p>
                            <Link to="/student/quizzes" className="stu-quiz-start-btn" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                                {t('student_history.start_quiz_now')}
                            </Link>
                        </div>
                    ) : (
                        <div className="stu-history-card-premium">

                            {/* Mobile-friendly list for smaller screens */}
                            <div className="stu-history-list-mobile">
                                {attempts.map((attempt) => {
                                    const statusBadge = getStatusBadge(attempt.status);
                                    return (
                                        <div key={attempt.id} className="stu-history-item-mobile">
                                            <div className="stu-history-item-mobile-header">
                                                <div className="stu-history-item-mobile-title">
                                                    {attempt.quiz_title || attempt.quiz}
                                                </div>
                                                <span className={`stu-status-badge ${statusBadge.className}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                            <div className="stu-history-item-mobile-meta">
                                                <FiCalendar style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                {formatDate(attempt.started_at)}
                                            </div>
                                            <div className="stu-history-item-mobile-footer">
                                                <div>
                                                    {attempt.status === 'completed' && (
                                                        <span className={`stu-score-premium ${getScoreClass(attempt.score)}`}>
                                                            {attempt.score?.toFixed(1) || '0.0'} / 10
                                                        </span>
                                                    )}
                                                </div>
                                                {attempt.status === 'completed' ? (
                                                    <Link to={`/student/result/${attempt.id}`} className="stu-history-btn-detail">
                                                        <FiEye /> {t('student_history.result')}
                                                    </Link>
                                                ) : (
                                                    <span className="is-muted" style={{ fontSize: '0.9rem' }}>{t('student_history.not_submitted')}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Table for larger screens */}
                            <div className="stu-history-table-wrap">
                                <table className="stu-history-table-premium">
                                    <thead>
                                        <tr>
                                            <th>{t('student_history.table_quiz')}</th>
                                            <th>{t('student_history.table_time')}</th>
                                            <th style={{ textAlign: 'center' }}>{t('student_history.table_status')}</th>
                                            <th style={{ textAlign: 'center' }}>{t('student_history.table_score')}</th>
                                            <th style={{ textAlign: 'center' }}>{t('student_history.table_action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attempts.map((attempt) => {
                                            const statusBadge = getStatusBadge(attempt.status);
                                            return (
                                                <tr key={attempt.id}>
                                                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                                                        {attempt.quiz_title || attempt.quiz}
                                                    </td>
                                                    <td style={{ color: '#64748b' }}>
                                                        {formatDate(attempt.started_at)}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`stu-status-badge ${statusBadge.className}`}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {attempt.status === 'completed' ? (
                                                            <span className={`stu-score-premium ${getScoreClass(attempt.score)}`}>
                                                                {attempt.score !== undefined ? (Number(attempt.score).toFixed(1)) : '0.0'} / 10
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>-</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {attempt.status === 'completed' ? (
                                                            <Link
                                                                to={`/student/result/${attempt.id}`}
                                                                className="stu-history-btn-detail"
                                                            >
                                                                <FiEye /> {t('student_history.view_result')}
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                to={`/student/quizzes/${attempt.quiz}/take`}
                                                                className="stu-history-btn-detail"
                                                                style={{ color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)' }}
                                                            >
                                                                <FiClock /> {t('student_history.continue')}
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalCount > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    totalCount={totalCount}
                                    pageSize={pageSize}
                                    itemLabel="lượt làm bài"
                                />
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Navigation Footer */}
            <section className="stu-nav-section">
                <div className="stu-container">
                    <div className="stu-nav-grid">
                        <Link to="/student" className="stu-nav-card">
                            <div className="stu-nav-icon-wrap">
                                <FiHome className="stu-nav-icon" />
                            </div>
                            <h3>{t('student_history.nav_home')}</h3>
                            <p>{t('student_history.nav_home_desc')}</p>
                        </Link>
                        <Link to="/student/quizzes" className="stu-nav-card">
                            <div className="stu-nav-icon-wrap">
                                <FiBookOpen className="stu-nav-icon" />
                            </div>
                            <h3>{t('student_history.nav_quizzes')}</h3>
                            <p>{t('student_history.nav_quizzes_desc')}</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
