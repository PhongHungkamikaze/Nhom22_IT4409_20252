import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import { 
    FiFileText, 
    FiClock, 
    FiUser, 
    FiActivity, 
    FiArrowLeft, 
    FiPlay, 
    FiAlertTriangle, 
    FiBookOpen, 
    FiShield 
} from 'react-icons/fi';
import './Student.css';

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState(null);

    // READ: Fetch quiz details and questions
    useEffect(() => {
        const fetchQuizDetails = async () => {
            try {
                setLoading(true);
                console.log('Fetching quiz with id:', id); // DEBUG
                const quizData = await apiService.getQuiz(id);
                console.log('Quiz data received:', quizData); // DEBUG
                setQuiz(quizData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch quiz:', err);
                const errorMsg = err.message || t('student_quiz_detail.error_load');
                setError(errorMsg);
                setQuiz(null);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizDetails();
    }, [id]);

    // Intercept plain placeholder description with professional text
    const getProfessionalDescription = (desc) => {
        const lowerDesc = (desc || '').toLowerCase().trim();
        if (!lowerDesc || 
            lowerDesc === 'hãy thử sức với bài quiz này!' || 
            lowerDesc === 'hãy thử sức với bài quiz này đi' ||
            lowerDesc === 'hãy thử sức với bài quiz này' ||
            lowerDesc === 'try this quiz!' ||
            lowerDesc.includes('hãy thử sức')) {
            return t('student_quiz_detail.default_desc');
        }
        return desc;
    };

    // START ATTEMPT: Create new attempt (POST /quizzes/{id}/start)
    const handleStartQuiz = async () => {
        try {
            setStarting(true);
            const response = await apiService.startQuiz(id);

            const attemptId = response.attempt?.id;
            if (attemptId) {
                // Navigate to TakeQuiz page with attempt ID
                navigate(`/student/take-quiz/${attemptId}`, { state: { quizId: id } });
            } else {
                setError(t('student_quiz_detail.error_create_session'));
            }
        } catch (err) {
            console.error('Failed to start quiz:', err);
            setError(err.message || t('student_quiz_detail.error_start'));
        } finally {
            setStarting(false);
        }
    };

    // NAVIGATION: Go back to list
    const handleGoBack = () => {
        navigate('/student/quizzes/');
    };

    if (loading) {
        return (
            <div className="student-page">
                <section className="stu-loading">
                    <div className="stu-spinner"></div>
                    <p>{t('student_quiz_detail.loading')}</p>
                </section>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="student-page">
                <div className="stu-dashboard-header">
                    <div className="stu-container">
                        <div className="stu-welcome-row">
                            <div className="stu-welcome-left">
                                <h1>{t('student_quiz_detail.error_title')}</h1>
                                <p>{t('student_quiz_detail.error_desc')}</p>
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
                        <FiAlertTriangle size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                        <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 800 }}>{t('student_quiz_detail.not_found')}</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.5 }}>
                            {error || t('student_quiz_detail.not_found_desc')}
                        </p>
                        <button
                            onClick={handleGoBack}
                            className="stu-btn-save-premium"
                        >
                            {t('student_quiz_detail.back_to_list')}
                        </button>
                    </div>
                </div>
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
                                <FiBookOpen className="stu-badge-icon" />
                                {t('student_quiz_detail.badge')}
                            </div>
                            <h1>{quiz.title}</h1>
                            <p>{t('student_quiz_detail.check_info')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="stu-quiz-detail-container" style={{ marginTop: '2rem' }}>
                <div className="stu-quiz-detail-grid">
                    
                    {/* Left Column: Title, Description, and Exam Rules */}
                    <div className="stu-quiz-info-panel">
                        <div className="stu-quiz-info-header">
                            <h2 className="stu-quiz-title-main">{quiz.title}</h2>
                            {quiz.difficulty && (
                                <span className={`stu-difficulty stu-diff-${(quiz.difficulty || '').toLowerCase()}`} style={{ marginLeft: 0 }}>
                                    {quiz.difficulty}
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#1e293b' }}>
                                {t('student_quiz_detail.intro_title')}
                            </h3>
                            <p className="stu-quiz-desc-premium">
                                {getProfessionalDescription(quiz.description)}
                            </p>
                        </div>

                        {/* Exam Rules Card */}
                        <div className="stu-quiz-rule-card">
                            <h4 className="stu-quiz-rule-title">
                                <FiShield /> {t('student_quiz_detail.rules_title')}
                            </h4>
                            <ul className="stu-quiz-rule-list">
                                <li>
                                    <strong>{t('student_quiz_detail.rule_timer')}</strong> {t('student_quiz_detail.rule_timer_desc')}
                                </li>
                                <li>
                                    <strong>{t('student_quiz_detail.rule_anticheat')}</strong> {t('student_quiz_detail.rule_anticheat_desc')} <strong>{t('student_quiz_detail.rule_anticheat_action')}</strong>.
                                </li>
                                <li>
                                    <strong>{t('student_quiz_detail.rule_autosubmit')}</strong> {t('student_quiz_detail.rule_autosubmit_desc')}
                                </li>
                                <li>
                                    <strong>{t('student_quiz_detail.rule_max_attempts')}</strong> {t('student_quiz_detail.rule_max_attempts_desc')} <strong>{t('student_quiz_detail.rule_max_attempts_times', { count: quiz.max_attempts || 1 })}</strong>. {t('student_quiz_detail.rule_max_attempts_note')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Sidebar info and actions */}
                    <div className="stu-quiz-sidebar-panel">
                        
                        {/* Meta Info Card */}
                        <div className="stu-quiz-meta-card">
                            <h3 className="stu-quiz-meta-title-sidebar">{t('student_quiz_detail.meta_title')}</h3>
                            <div className="stu-quiz-meta-vertical-list">
                                
                                {/* Questions Count */}
                                <div className="stu-quiz-meta-row">
                                    <div className="stu-quiz-meta-icon-wrapper purple">
                                        <FiFileText />
                                    </div>
                                    <div className="stu-quiz-meta-info-content">
                                        <span className="stu-quiz-meta-label-side">{t('student_quiz_detail.question_count')}</span>
                                        <span className="stu-quiz-meta-value-side">{quiz.question_count || '0'} {t('student_quiz_detail.questions_unit')}</span>
                                    </div>
                                </div>

                                {/* Time Limit */}
                                <div className="stu-quiz-meta-row">
                                    <div className="stu-quiz-meta-icon-wrapper pink">
                                        <FiClock />
                                    </div>
                                    <div className="stu-quiz-meta-info-content">
                                        <span className="stu-quiz-meta-label-side">{t('student_quiz_detail.time_limit')}</span>
                                        <span className="stu-quiz-meta-value-side">{quiz.time_limit || '30'} {t('student_quiz_detail.minutes')}</span>
                                    </div>
                                </div>

                                {/* Author name */}
                                <div className="stu-quiz-meta-row">
                                    <div className="stu-quiz-meta-icon-wrapper green">
                                        <FiUser />
                                    </div>
                                    <div className="stu-quiz-meta-info-content">
                                        <span className="stu-quiz-meta-label-side">{t('student_quiz_detail.author')}</span>
                                        <span className="stu-quiz-meta-value-side">{quiz.author_name || t('student_quiz_detail.default_author')}</span>
                                    </div>
                                </div>

                                {/* Max attempts */}
                                <div className="stu-quiz-meta-row">
                                    <div className="stu-quiz-meta-icon-wrapper orange">
                                        <FiActivity />
                                    </div>
                                    <div className="stu-quiz-meta-info-content">
                                        <span className="stu-quiz-meta-label-side">{t('student_quiz_detail.max_attempts')}</span>
                                        <span className="stu-quiz-meta-value-side">{t('student_quiz_detail.max_attempts_value', { count: quiz.max_attempts || 1 })}</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Actions Card */}
                        <div className="stu-quiz-action-card">
                            <button
                                onClick={handleStartQuiz}
                                disabled={starting}
                                className="stu-btn-save-premium"
                                style={{ width: '100%', justifyContent: 'center', height: '48px', padding: 0 }}
                            >
                                {starting ? (
                                    <>
                                        <span className="stu-loading-spinner-btn"></span>
                                        {t('student_quiz_detail.creating_session')}
                                    </>
                                ) : (
                                    <>
                                        <FiPlay /> {t('student_quiz_detail.start_quiz')}
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={handleGoBack}
                                className="stu-btn-cancel-premium"
                                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '48px', padding: 0 }}
                            >
                                <FiArrowLeft /> {t('student_quiz_detail.back_to_list_btn')}
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
