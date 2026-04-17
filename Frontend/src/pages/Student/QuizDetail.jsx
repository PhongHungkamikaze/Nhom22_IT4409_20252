import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Student.css';

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
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
            const response = await apiService.request(`/quizzes/${id}/start/`, {
                method: 'POST',
            });
            
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
                            backgroundColor: '#fee',
                            borderRadius: '8px',
                            borderLeft: '4px solid #dc3545'
                        }}>
                            <h2 style={{ marginTop: 0, color: '#dc3545' }}>⚠️ Lỗi</h2>
                            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                                {error || 'Bài quiz không tồn tại hoặc chưa được publish'}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1.5rem' }}>
                                Lưu ý: Bạn chỉ có thể xem các bài quiz đã được giáo viên publish.
                            </p>
                            <button
                                onClick={() => {
                                    console.log('Error page back button clicked'); // DEBUG
                                    navigate('/student/quizzes');
                                }}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '12px 30px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    pointerEvents: 'auto'
                                }}
                            >
                                ← Quay lại danh sách
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
                        backgroundColor: '#f8f9fa',
                        padding: '2rem',
                        borderRadius: '12px',
                        borderLeft: '5px solid #007bff'
                    }}>
                        <h1 style={{ marginBottom: '1rem' }}>{quiz.title}</h1>
                        {quiz.difficulty && (
                            <span style={{
                                padding: '5px 12px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                marginRight: '1rem'
                            }}>
                                {quiz.difficulty}
                            </span>
                        )}
                        <p style={{ marginTop: '1rem', color: '#666', lineHeight: '1.6' }}>
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
                        marginBottom: '2rem'
                    }}>
                        {/* Info Cards */}
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f0f7ff',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                                {quiz.questions_count || quiz.question_count || '?'}
                            </div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Số câu hỏi</div>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#fff0f7',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏱️</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d946a6' }}>
                                {quiz.time_limit || quiz.duration || '30'}
                            </div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Phút</div>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f0fff4',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#059669' }}>
                                {quiz.author || quiz.teacher_name || 'Giáo viên'}
                            </div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Người tạo</div>
                        </div>

                        {quiz.max_attempts && (
                            <div style={{
                                padding: '1.5rem',
                                backgroundColor: '#fef3c7',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>
                                    {quiz.max_attempts}
                                </div>
                                <div style={{ color: '#666', marginTop: '0.5rem' }}>Lần làm tối đa</div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fee',
                            color: '#c33',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Start Button */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', pointerEvents: 'auto' }}>
                        <button
                            onClick={() => {
                                console.log('Back button clicked'); // Debug log
                                navigate('/student/quizzes');
                            }}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#e0e0e0',
                                color: '#333',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                pointerEvents: 'auto'
                            }}
                        >
                            ← Quay lại
                        </button>
                        <button
                            onClick={handleStartQuiz}
                            disabled={starting}
                            style={{
                                padding: '12px 40px',
                                backgroundColor: starting ? '#ccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: starting ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {starting ? '⏳ Đang tạo phiên...' : '🚀 Bắt đầu bài quiz'}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
