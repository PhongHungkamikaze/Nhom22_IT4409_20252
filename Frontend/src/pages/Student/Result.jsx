import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    FiAward,
    FiSmile,
    FiMeh,
    FiAlertCircle,
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiPieChart,
    FiBookOpen,
    FiHome,
    FiUser
} from 'react-icons/fi';
import './Student.css';

export default function Result() {
    const { attemptId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // READ: Fetch attempt result details
    useEffect(() => {
        const fetchResult = async () => {
            try {
                setLoading(true);
                const data = await apiService.getAttempt(attemptId);
                setAttempt(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch result:', err);
                setError(t('student_result.error_load'));
                setAttempt(null);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId]);

    // Calculate score percentage
    const scorePercentage = attempt ? (attempt.score / 10) * 100 : 0;

    // Determine result status
    const getResultStatus = (status, score) => {
        if (status !== 'completed') {
            return { 
                label: t('student_result.submitted'), 
                color: '#6366f1', 
                icon: <FiCheckCircle className="stu-result-badge-icon" style={{ color: '#6366f1' }} />,
                bgFill: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                message: t('student_result.subtitle')
            };
        }

        if (score >= 8) {
            return { 
                label: t('student_result.excellent'), 
                color: '#10b981', 
                icon: <FiAward className="stu-result-badge-icon" style={{ color: '#10b981' }} />,
                bgFill: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                message: t('student_result.excellent_msg')
            };
        }
        if (score >= 7) {
            return { 
                label: t('student_result.good'), 
                color: '#3b82f6', 
                icon: <FiSmile className="stu-result-badge-icon" style={{ color: '#3b82f6' }} />,
                bgFill: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                message: t('student_result.good_msg')
            };
        }
        if (score >= 5) {
            return { 
                label: t('student_result.pass'), 
                color: '#f59e0b', 
                icon: <FiMeh className="stu-result-badge-icon" style={{ color: '#f59e0b' }} />,
                bgFill: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                message: t('student_result.pass_msg')
            };
        }
        return { 
            label: t('student_result.fail'), 
            color: '#ef4444', 
            icon: <FiAlertCircle className="stu-result-badge-icon" style={{ color: '#ef4444' }} />,
            bgFill: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            message: t('student_result.fail_msg')
        };
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
                    <p>{t('student_result.loading')}</p>
                </section>
            </div>
        );
    }

    if (error || !attempt) {
        return (
            <div className="student-page">
                <div className="stu-dashboard-header">
                    <div className="stu-container">
                        <div className="stu-welcome-row">
                            <div className="stu-welcome-left">
                                <h1>{t('student_result.error_title')}</h1>
                                <p>{t('student_result.error_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stu-container" style={{ marginTop: '2rem' }}>
                    <div style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        border: '1px solid #fee2e2',
                        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        <FiAlertCircle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                        <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 800 }}>{t('student_result.not_found')}</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{error || t('student_result.not_found_desc')}</p>
                        <button
                            onClick={() => navigate('/student/history')}
                            className="stu-btn-save-premium"
                        >
                            {t('student_result.back_to_history')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const resultStatus = getResultStatus(attempt.status, attempt.score);

    return (
        <div className="student-page">
            {/* Header Hero Banner */}
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <div className="stu-header-badge">
                                <FiAward className="stu-badge-icon" />
                                {t('student_result.badge')}
                            </div>
                            <h1>{t('student_result.title')}</h1>
                            <p>{t('student_result.subtitle')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stu-result-container">
                {/* RESULT PANEL */}
                <div className="stu-result-panel" style={{ borderLeft: `6px solid ${resultStatus.color}` }}>

                    {/* Status Icon */}
                    {resultStatus.icon}

                    {/* Result Label */}
                    <h2 className="stu-result-title">{resultStatus.label}</h2>

                    {/* Score display */}
                    {attempt.status === 'completed' && (
                        <>
                            <div className="stu-result-subtitle">
                                {t('student_result.score_text')} <span className="stu-result-score-highlight" style={{ color: resultStatus.color }}>
                                    {(attempt.score || 0).toFixed(1)}
                                </span> {t('student_result.score_unit')}
                            </div>

                            {/* Progress track */}
                            <div className="stu-result-progress-track">
                                <div
                                    className="stu-result-progress-fill"
                                    style={{
                                        width: `${scorePercentage}%`,
                                        background: resultStatus.bgFill
                                    }}
                                >
                                    {scorePercentage >= 15 && `${scorePercentage.toFixed(0)}%`}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Encouraging message */}
                    <p className="stu-result-status-message" style={{ color: resultStatus.color }}>
                        {resultStatus.message}
                    </p>
                </div>

                {/* DETAILS CARD */}
                <div className="stu-result-details-card">
                    <h3 className="stu-result-details-title">
                        <FiFileText style={{ color: '#4f46e5' }} /> {t('student_result.details_title')}
                    </h3>
                    <div className="stu-result-details-grid">

                        {/* Quiz Title */}
                        <div className="stu-result-detail-box">
                            <div className="stu-result-detail-label">{t('student_result.quiz_name')}</div>
                            <div className="stu-result-detail-value">
                                {attempt.quiz_title || t('student_result.default_quiz_name')}
                            </div>
                        </div>

                        {/* Started Time */}
                        <div className="stu-result-detail-box">
                            <div className="stu-result-detail-label">{t('student_result.start_time')}</div>
                            <div className="stu-result-detail-value">
                                <FiClock style={{ color: '#94a3b8' }} />
                                {formatDate(attempt.started_at)}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="stu-result-detail-box">
                            <div className="stu-result-detail-label">{t('student_result.status')}</div>
                            <div className="stu-result-detail-value" style={{ color: '#10b981' }}>
                                <FiCheckCircle />
                                {attempt.status === 'completed' ? t('student_result.submitted') : attempt.status}
                            </div>
                        </div>

                        {/* Student Account */}
                        <div className="stu-result-detail-box">
                            <div className="stu-result-detail-label">{t('student_result.candidate')}</div>
                            <div className="stu-result-detail-value">
                                <FiUser style={{ color: '#94a3b8' }} />
                                {attempt.username || user?.username}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="stu-result-actions-container">
                    <div className="stu-result-actions-row">
                        <Link
                            to="/student/history"
                            className="stu-btn-action-result stu-btn-action-result-secondary"
                        >
                            <FiPieChart /> {t('student_result.view_history')}
                        </Link>

                        <Link
                            to="/student/quizzes"
                            className="stu-btn-action-result stu-btn-action-result-primary"
                        >
                            <FiBookOpen /> {t('student_result.try_another')}
                        </Link>

                        <Link
                            to="/student"
                            className="stu-btn-action-result stu-btn-action-result-success"
                        >
                            <FiHome /> {t('student_result.go_home')}
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
