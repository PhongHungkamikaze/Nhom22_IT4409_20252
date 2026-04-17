import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Student.css';

export default function Result() {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // READ: Fetch attempt result details
    useEffect(() => {
        const fetchResult = async () => {
            try {
                setLoading(true);
                const data = await apiService.request(`/attempts/${attemptId}/`);
                setAttempt(data);

                // Extract answers
                if (data.answers && Array.isArray(data.answers)) {
                    setAnswers(data.answers);
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch result:', err);
                setError('Không thể tải kết quả bài quiz');
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
    const getResultStatus = (score) => {
        if (score >= 8) return { label: 'Xuất sắc!', color: '#28a745', icon: '🎉' };
        if (score >= 7) return { label: 'Tốt', color: '#17a2b8', icon: '😊' };
        if (score >= 5) return { label: 'Bình thường', color: '#ffc107', icon: '😐' };
        return { label: 'Cần cải thiện', color: '#dc3545', icon: '📈' };
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
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
                    <p>Đang tải kết quả...</p>
                </section>
            </div>
        );
    }

    if (error || !attempt) {
        return (
            <div className="student-page">
                <section className="stu-hero">
                    <div className="stu-container">
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            backgroundColor: '#fee',
                            borderRadius: '8px'
                        }}>
                            <h2>⚠️ {error || 'Không thể tải kết quả'}</h2>
                            <button
                                onClick={() => navigate('/student/history')}
                                style={{
                                    marginTop: '1rem',
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Quay lại lịch sử
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const resultStatus = getResultStatus(attempt.score);

    return (
        <div className="student-page">
            {/* RESULT CARD */}
            <section className="stu-hero">
                <div className="stu-container">
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '3rem 2rem',
                        borderRadius: '12px',
                        textAlign: 'center',
                        borderLeft: `5px solid ${resultStatus.color}`
                    }}>
                        {/* Score Display */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{
                                fontSize: '4rem',
                                fontWeight: 'bold',
                                color: resultStatus.color,
                                marginBottom: '0.5rem'
                            }}>
                                {resultStatus.icon}
                            </div>
                            <h1 style={{
                                fontSize: '2.5rem',
                                marginBottom: '0.5rem',
                                color: '#333'
                            }}>
                                {resultStatus.label}
                            </h1>
                            <div style={{
                                fontSize: '1.3rem',
                                color: '#666'
                            }}>
                                Bạn đạt được <span style={{
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    color: resultStatus.color
                                }}>
                                    {(attempt.score).toFixed(1)}
                                </span> / 10 điểm
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                            width: '100%',
                            height: '30px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${scorePercentage}%`,
                                backgroundColor: resultStatus.color,
                                transition: 'width 0.6s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {scorePercentage > 10 && `${scorePercentage.toFixed(0)}%`}
                            </div>
                        </div>

                        <h2 style={{
                            color: resultStatus.color,
                            marginBottom: '2rem'
                        }}>
                            {resultStatus.label === 'Xuất sắc!' && '🌟 Bạn làm rất tốt! Tiếp tục cố gắng!'}
                            {resultStatus.label === 'Tốt' && '👍 Kết quả tốt! Hãy ôn tập thêm.'}
                            {resultStatus.label === 'Bình thường' && '📚 Cần ôn tập thêm các phần này.'}
                            {resultStatus.label === 'Cần cải thiện' && '💪 Hãy ôn tập lại toàn bộ nội dung.'}
                        </h2>
                    </div>
                </div>
            </section>

            {/* DETAILS SECTION */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    {/* Quiz Info */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        marginBottom: '2rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>📋 Chi tiết bài làm</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem'
                        }}>
                            <div>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>Tên bài quiz</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    {attempt.quiz_title || 'Quiz'}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>Thời gian làm bài</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    {formatDate(attempt.started_at)}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>Trạng thái</div>
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    marginTop: '0.5rem',
                                    color: '#28a745',
                                    textTransform: 'capitalize'
                                }}>
                                    {attempt.status === 'completed' ? '✓ Hoàn thành' : attempt.status}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Answer Review */}
                    {answers.length > 0 && (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>🎯 Câu trả lời của bạn</h2>
                            <div style={{
                                display: 'grid',
                                gap: '1rem'
                            }}>
                                {answers.map((answer, idx) => (
                                    <div
                                        key={answer.id}
                                        style={{
                                            padding: '1.5rem',
                                            backgroundColor: answer.is_correct ? '#f0fff4' : '#fff0f0',
                                            borderLeft: `4px solid ${answer.is_correct ? '#28a745' : '#dc3545'}`,
                                            borderRadius: '6px'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'start',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div style={{
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                color: '#333'
                                            }}>
                                                Câu {idx + 1}: {answer.question_text}
                                            </div>
                                            <span style={{
                                                padding: '4px 12px',
                                                backgroundColor: answer.is_correct ? '#28a745' : '#dc3545',
                                                color: 'white',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {answer.is_correct ? '✓ Đúng' : '✗ Sai'}
                                            </span>
                                        </div>
                                        {answer.selected_choices_text && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                color: '#666',
                                                fontSize: '0.95rem'
                                            }}>
                                                <strong>Câu trả lời của bạn:</strong> {answer.selected_choices_text}
                                            </div>
                                        )}
                                        {answer.correct_choices_text && answer.is_correct === false && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                color: '#28a745',
                                                fontSize: '0.95rem',
                                                fontStyle: 'italic'
                                            }}>
                                                <strong>Đáp án đúng:</strong> {answer.correct_choices_text}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ACTION BUTTONS */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => navigate('/student/history')}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            📊 Lịch sử làm bài
                        </button>
                        <button
                            onClick={() => navigate('/student/quizzes')}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            📚 Làm bài quiz khác
                        </button>
                        <button
                            onClick={() => navigate('/student')}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            🏠 Trang chủ
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
