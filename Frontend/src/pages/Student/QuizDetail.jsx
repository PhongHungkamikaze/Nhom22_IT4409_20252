import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { FiFileText, FiClock, FiUser, FiActivity, FiArrowLeft, FiPlay, FiAlertTriangle } from 'react-icons/fi';
import './Student.css';

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
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
                const errorMsg = err.message || 'Không thể tải chi tiết bài quiz. Bài quiz có thể chưa được publish.';
                setError(errorMsg);
                setQuiz(null);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizDetails();
    }, [id]);

    // START ATTEMPT: Create new attempt (POST /quizzes/{id}/start)
    const handleStartQuiz = async () => {
        try {
            setStarting(true);
            // Call the start endpoint
            const response = await apiService.startQuiz(id);

            const attemptId = response.attempt?.id;
            if (attemptId) {
                // Navigate to TakeQuiz page with attempt ID
                navigate(`/student/take-quiz/${attemptId}`, { state: { quizId: id } });
            } else {
                setError('Không thể tạo phiên làm bài');
            }
        } catch (err) {
            console.error('Failed to start quiz:', err);
            setError(err.message || 'Không thể bắt đầu bài quiz');
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
                <section className="stu-hero">
                    <div className="stu-loading">
                        <div className="stu-spinner"></div>
                        <p>Đang tải chi tiết bài quiz...</p>
                    </div>
                </section>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="student-page">
                <section className="stu-hero">
                    <div className="stu-container">
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            backgroundColor: '#fee2e2',
                            borderRadius: '12px',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <FiAlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                            <h2 style={{ marginTop: 0, color: '#ef4444' }}>Lỗi</h2>
                            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
                                {error || 'Bài quiz không tồn tại hoặc chưa được publish'}
                            </p>
                            <button
                                onClick={() => {
                                    console.log('Error page back button clicked'); // DEBUG
                                    navigate('/student/quizzes');
                                }}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '12px 30px',
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    pointerEvents: 'auto',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                                }}
                            >
                                <FiArrowLeft /> Quay lại danh sách
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="student-page">
            {/* Hero Section */}
            <section className="stu-hero">
                <div className="stu-container">
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        padding: '2.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                        <h1 style={{ marginBottom: '1rem', color: '#fff' }}>{quiz.title}</h1>
                        {quiz.difficulty && (
                            <span className={`stu-difficulty stu-diff-${(quiz.difficulty || '').toLowerCase()}`} style={{ marginLeft: 0 }}>
                                {quiz.difficulty}
                            </span>
                        )}
                        <p style={{ marginTop: '1.5rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6', fontSize: '1.05rem' }}>
                            {quiz.description || 'Hãy thử sức với bài quiz này!'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Quiz Details */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2.5rem'
                    }}>
                        {/* Info Cards */}
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <FiFileText size={28} style={{ color: '#4f46e5', marginBottom: '0.75rem' }} />
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                                {quiz.question_count || '0'}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Số câu hỏi</div>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <FiClock size={28} style={{ color: '#ec4899', marginBottom: '0.75rem' }} />
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                                {quiz.time_limit || '30'}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Phút làm bài</div>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <FiUser size={28} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0.35rem 0' }}>
                                {quiz.author_name || 'Giáo viên'}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Người tạo</div>
                        </div>

                        {quiz.max_attempts && (
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <FiActivity size={28} style={{ color: '#f59e0b', marginBottom: '0.75rem' }} />
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                                    {quiz.max_attempts}
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Lần làm tối đa</div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            border: '1px solid #fecaca'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Start Button */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', pointerEvents: 'auto' }}>
                        <button
                            onClick={handleGoBack}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#e2e8f0',
                                color: '#334155',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: '700',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#cbd5e1'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        >
                            <FiArrowLeft /> Quay lại
                        </button>
                        <button
                            onClick={handleStartQuiz}
                            disabled={starting}
                            style={{
                                padding: '12px 40px',
                                backgroundColor: starting ? '#cbd5e1' : '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: starting ? 'not-allowed' : 'pointer',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: starting ? 'none' : '0 4px 14px rgba(79, 70, 229, 0.25)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { if(!starting) e.currentTarget.style.backgroundColor = '#4338ca'; }}
                            onMouseOut={(e) => { if(!starting) e.currentTarget.style.backgroundColor = '#4f46e5'; }}
                        >
                            {starting ? 'Đang tạo phiên...' : <><FiPlay /> Bắt đầu bài quiz</>}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
