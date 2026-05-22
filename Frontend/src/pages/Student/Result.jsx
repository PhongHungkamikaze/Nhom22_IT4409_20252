import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { FiAward, FiSmile, FiMeh, FiAlertCircle, FiFileText, FiClock, FiCheckCircle, FiPieChart, FiBookOpen, FiHome } from 'react-icons/fi';
import './Student.css';

export default function Result() {
    const { attemptId } = useParams();
    const navigate = useNavigate();

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
        if (score >= 8) return { label: 'Xuất sắc!', color: '#10b981', icon: <FiAward size={48} /> };
        if (score >= 7) return { label: 'Tốt', color: '#3b82f6', icon: <FiSmile size={48} /> };
        if (score >= 5) return { label: 'Bình thường', color: '#f59e0b', icon: <FiMeh size={48} /> };
        return { label: 'Cần cải thiện', color: '#ef4444', icon: <FiAlertCircle size={48} /> };
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
                            backgroundColor: '#fee2e2',
                            borderRadius: '12px',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <FiAlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                            <h2 style={{ color: '#ef4444', marginTop: 0 }}>Lỗi</h2>
                            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>{error || 'Không thể tải kết quả'}</p>
                            <button
                                onClick={() => navigate('/student/history')}
                                style={{
                                    marginTop: '1rem',
                                    padding: '10px 20px',
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
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
                        backgroundColor: '#f8fafc',
                        padding: '3rem 2rem',
                        borderRadius: '16px',
                        textAlign: 'center',
                        borderLeft: `6px solid ${resultStatus.color}`,
                        borderTop: '1px solid #e2e8f0',
                        borderRight: '1px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        {/* Score Display */}
                        <div style={{ marginBottom: '2rem', width: '100%' }}>
                            <div style={{
                                color: resultStatus.color,
                                marginBottom: '0.75rem',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                {resultStatus.icon}
                            </div>
                            <h1 style={{
                                fontSize: '2.2rem',
                                marginBottom: '0.5rem',
                                color: '#0f172a',
                                fontWeight: 800
                            }}>
                                {resultStatus.label}
                            </h1>
                            <div style={{
                                fontSize: '1.2rem',
                                color: '#475569'
                            }}>
                                Bạn đạt được <span style={{
                                    fontSize: '2rem',
                                    fontWeight: '900',
                                    color: resultStatus.color
                                }}>
                                    {(attempt.score).toFixed(1)}
                                </span> / 10 điểm
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                            width: '100%',
                            maxWidth: '600px',
                            height: '24px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '12px',
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
                                fontWeight: 'bold',
                                fontSize: '0.85rem'
                            }}>
                                {scorePercentage > 10 && `${scorePercentage.toFixed(0)}%`}
                            </div>
                        </div>

                        <h2 style={{
                            color: resultStatus.color,
                            marginBottom: '1rem',
                            fontSize: '1.25rem',
                            fontWeight: '700'
                        }}>
                            {resultStatus.label === 'Xuất sắc!' && 'Bạn làm rất tốt! Tiếp tục cố gắng!'}
                            {resultStatus.label === 'Tốt' && 'Kết quả tốt! Hãy ôn tập thêm.'}
                            {resultStatus.label === 'Bình thường' && 'Cần ôn tập thêm các phần này.'}
                            {resultStatus.label === 'Cần cải thiện' && 'Hãy ôn tập lại toàn bộ nội dung.'}
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
                        borderRadius: '12px',
                        marginBottom: '2.5rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', color: '#0f172a' }}>
                            <FiFileText style={{ color: '#4f46e5' }} /> Chi tiết bài làm
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Tên bài quiz</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '0.5rem', color: '#0f172a' }}>
                                    {attempt.quiz_title || 'Quiz'}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Thời gian làm bài</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '0.5rem', color: '#0f172a' }}>
                                    {formatDate(attempt.started_at)}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Trạng thái</div>
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '800',
                                    marginTop: '0.5rem',
                                    color: '#10b981',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                }}>
                                    {attempt.status === 'completed' ? (
                                        <>
                                            <FiCheckCircle size={16} /> Hoàn thành
                                        </>
                                    ) : attempt.status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ACTION BUTTONS */}
            <section className="stu-quizzes-section" style={{ padding: '0 0 4rem 0' }}>
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
                                backgroundColor: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        >
                            <FiPieChart /> Lịch sử làm bài
                        </button>
                        <button
                            onClick={() => navigate('/student/quizzes')}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.2)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                        >
                            <FiBookOpen /> Làm bài quiz khác
                        </button>
                        <button
                            onClick={() => navigate('/student')}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        >
                            <FiHome /> Trang chủ
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
