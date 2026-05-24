import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
        if (score >= 8) {
            return { 
                label: 'Xuất sắc!', 
                color: '#10b981', 
                icon: <FiAward className="stu-result-badge-icon" style={{ color: '#10b981' }} />,
                bgFill: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                message: 'Tuyệt vời! Bạn làm rất tốt. Tiếp tục phát huy nhé!'
            };
        }
        if (score >= 7) {
            return { 
                label: 'Khá tốt', 
                color: '#3b82f6', 
                icon: <FiSmile className="stu-result-badge-icon" style={{ color: '#3b82f6' }} />,
                bgFill: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                message: 'Kết quả khá tốt! Bạn hãy ôn tập thêm để đạt điểm tối đa.'
            };
        }
        if (score >= 5) {
            return { 
                label: 'Đạt yêu cầu', 
                color: '#f59e0b', 
                icon: <FiMeh className="stu-result-badge-icon" style={{ color: '#f59e0b' }} />,
                bgFill: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                message: 'Bạn đã đạt yêu cầu trung bình. Cần cố gắng ôn tập thêm các câu sai.'
            };
        }
        return { 
            label: 'Cần cải thiện', 
            color: '#ef4444', 
            icon: <FiAlertCircle className="stu-result-badge-icon" style={{ color: '#ef4444' }} />,
            bgFill: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            message: 'Điểm số chưa đạt yêu cầu. Hãy ôn lại bài và thử lại ở lượt sau nhé!'
        };
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
                    <p>Đang tải kết quả bài làm...</p>
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
                                <h1>Lỗi hệ thống</h1>
                                <p>Đã xảy ra sự cố trong quá trình tải dữ liệu điểm số của bài quiz này.</p>
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
                        <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Không tìm thấy kết quả</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{error || 'Mã bài thi không tồn tại hoặc đã bị xóa.'}</p>
                        <button
                            onClick={() => navigate('/student/history')}
                            className="stu-btn-save-premium"
                        >
                            Quay lại lịch sử làm bài
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const resultStatus = getResultStatus(attempt.score);

    return (
        <div className="student-page">
            {/* Header Hero Banner */}
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <div className="stu-header-badge">
                                <FiAward className="stu-badge-icon" />
                                Kết Quả Bài Thi
                            </div>
                            <h1>Báo cáo điểm số của bạn</h1>
                            <p>Chúc mừng bạn đã hoàn thành bài thi! Dưới đây là thông tin chi tiết về điểm số của lượt làm bài này.</p>
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
                    <div className="stu-result-subtitle">
                        Bạn đạt được <span className="stu-result-score-highlight" style={{ color: resultStatus.color }}>
                            {(attempt.score || 0).toFixed(1)}
                        </span> / 10 điểm
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

                    {/* Encouraging message */}
                    <p className="stu-result-status-message" style={{ color: resultStatus.color }}>
                        {resultStatus.message}
                    </p>
                </div>

                {/* DETAILS CARD */}
                <div className="stu-result-details-card">
                    <h3 className="stu-result-details-title">
                        <FiFileText style={{ color: '#4f46e5' }} /> Chi tiết lượt làm bài
                    </h3>
                    <div className="stu-result-details-grid">
                        
                        {/* Quiz Title */}
                        <div className="stu-result-detail-box">
                            <div className="stu-result-detail-label">Tên bài thi</div>
                            <div className="stu-result-detail-value">
                                {attempt.quiz_title || 'Bài trắc nghiệm'}
                            </div>
                        </div>

                        {/* Started Time */}
                        <div className="stu-result-detail-box">
                            <div className="stu-result-detail-label">Thời gian bắt đầu</div>
                            <div className="stu-result-detail-value">
                                <FiClock style={{ color: '#94a3b8' }} />
                                {formatDate(attempt.started_at)}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="stu-result-detail-box">
                            <div className="stu-result-detail-label">Trạng thái</div>
                            <div className="stu-result-detail-value" style={{ color: '#10b981' }}>
                                <FiCheckCircle /> 
                                {attempt.status === 'completed' ? 'Đã nộp bài' : attempt.status}
                            </div>
                        </div>

                        {/* Student Account */}
                        <div className="stu-result-detail-box">
                            <div className="stu-result-detail-label">Thí sinh</div>
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
                            <FiPieChart /> Xem lịch sử làm bài
                        </Link>
                        
                        <Link 
                            to="/student/quizzes" 
                            className="stu-btn-action-result stu-btn-action-result-primary"
                        >
                            <FiBookOpen /> Làm bài quiz khác
                        </Link>

                        <Link 
                            to="/student" 
                            className="stu-btn-action-result stu-btn-action-result-success"
                        >
                            <FiHome /> Quay về Trang chủ
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
