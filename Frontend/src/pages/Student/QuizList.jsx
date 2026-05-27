import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import { FiBookOpen, FiHelpCircle, FiClock, FiInbox, FiSearch, FiAward, FiEdit3 } from 'react-icons/fi';
import './Student.css';
import Pagination from '../../components/common/Pagination';

export default function QuizList() {
    const { t } = useTranslation();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState('-created_at');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 9;

    const fetchQuizzes = async (page = currentPage) => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm,
                ordering: ordering,
                page: page,
                page_size: 9,
            };
            const data = await apiService.getQuizzes(params);
            const quizList = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
            setQuizzes(quizList);
            setTotalCount(data.count || quizList.length);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch quizzes:', err);
            setError(t('student_quiz_list.error_load'));
            setQuizzes([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchQuizzes(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, ordering]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchQuizzes(newPage);
    };

    return (
        <div className="student-page">
            {/* Header */}
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <div className="stu-header-badge">
                                <FiAward className="stu-badge-icon" />
                                <span>{t('student_quiz_list.badge')}</span>
                            </div>
                            <h1 className="stu-header-title">
                                <FiBookOpen className="stu-title-icon" />
                                {t('student_quiz_list.title')}
                            </h1>
                            <p className="stu-header-subtitle">
                                {t('student_quiz_list.subtitle')}
                            </p>
                        </div>
                        <div className="stu-welcome-quote-card">
                            <FiEdit3 className="stu-quote-icon" />
                            <div className="stu-quote-content">
                                <h4>{t('student_quiz_list.quote_title')}</h4>
                                <p>{t('student_quiz_list.quote_text')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div className="stu-search-container-wrap" style={{ marginBottom: '2rem', position: 'relative' }}>
                        <FiSearch style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                            fontSize: '1.2rem'
                        }} />
                        <input
                            type="text"
                            placeholder={t('student_quiz_list.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="stu-search-input"
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                fontSize: '1rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                fontFamily: 'inherit',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            border: '1px solid #fecaca'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="stu-loading">
                            <div className="stu-spinner"></div>
                            <p>{t('student_quiz_list.loading')}</p>
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="stu-empty">
                            <div className="stu-empty-icon-wrap">
                                <FiInbox size={40} className="stu-empty-icon" />
                            </div>
                            <p>{searchTerm ? t('student_quiz_list.no_results') : t('student_quiz_list.no_quizzes')}</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                                {t('pagination.found_count', { count: totalCount })}
                            </div>
                            <div className="stu-quizzes-grid">
                                {quizzes.map(quiz => (
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
                                                {t('student_dashboard.view_details')}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {Math.ceil(totalCount / pageSize) > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(totalCount / pageSize)}
                                    onPageChange={handlePageChange}
                                    totalCount={totalCount}
                                    pageSize={pageSize}
                                    itemLabel="bài quiz"
                                />
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
