import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
                const errorMsg = err.message || 'Không thể tải chi tiết bài quiz. Bài quiz có thể chưa được công bố (published).';
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
            lowerDesc.includes('hãy thử sức')) {
            return 'Bài thi này được thiết kế nhằm mục đích kiểm tra và đánh giá một cách toàn diện kiến thức tích lũy của bạn đối với nội dung môn học. Vui lòng kiểm tra kỹ các thông số đề thi và đọc rõ quy chế phòng thi bên dưới trước khi chính thức bắt đầu làm bài để đạt kết quả tối ưu nhất.';
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
                setError('Không thể tạo phiên làm bài thi. Vui lòng kiểm tra lại quyền truy cập.');
            }
        } catch (err) {
            console.error('Failed to start quiz:', err);
            setError(err.message || 'Không thể bắt đầu thực hiện bài quiz này.');
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
                    <p>Đang tải chi tiết đề thi...</p>
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
                                <h1>Chi Tiết Bài Quiz</h1>
                                <p>Đã xảy ra lỗi trong quá trình hiển thị thông tin bài kiểm tra.</p>
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
                        <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Không tìm thấy bài Quiz</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.5 }}>
                            {error || 'Bài quiz này không tồn tại hoặc chưa được giáo viên kích hoạt.'}
                        </p>
                        <button
                            onClick={handleGoBack}
                            className="stu-btn-save-premium"
                        >
                            Quay lại danh sách quiz
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
                                Chi Tiết Đề Thi
                            </div>
                            <h1>{quiz.title}</h1>
                            <p>Kiểm tra thông số đề thi và đọc kỹ quy chế phòng thi trắc nghiệm trước khi bắt đầu.</p>
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
                                Giới thiệu đề thi
                            </h3>
                            <p className="stu-quiz-desc-premium">
                                {getProfessionalDescription(quiz.description)}
                            </p>
                        </div>

                        {/* Exam Rules Card */}
                        <div className="stu-quiz-rule-card">
                            <h4 className="stu-quiz-rule-title">
                                <FiShield /> Quy chế làm bài trắc nghiệm
                            </h4>
                            <ul className="stu-quiz-rule-list">
                                <li>
                                    <strong>Thời gian đếm ngược:</strong> Thời gian làm bài thi sẽ bắt đầu chạy lùi ngay sau khi bạn nhấn nút "Bắt đầu làm bài".
                                </li>
                                <li>
                                    <strong>Chống gian lận (Anti-Cheat):</strong> Hệ thống ghi nhận các hành vi chuyển Tab trình duyệt hoặc thoát màn hình thi. Vi phạm sẽ khiến hệ thống <strong>tự động nộp bài và khóa bài thi ngay lập tức</strong>.
                                </li>
                                <li>
                                    <strong>Nộp bài tự động:</strong> Khi hết thời gian làm bài giới hạn, hệ thống sẽ tự nộp kết quả của bạn tại thời điểm đó.
                                </li>
                                <li>
                                    <strong>Giới hạn lượt làm:</strong> Bạn được làm bài thi này tối đa <strong>{quiz.max_attempts || 1} lần</strong>. Kết quả điểm số cao nhất sẽ được ghi nhận.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Sidebar info and actions */}
                    <div className="stu-quiz-sidebar-panel">
                        
                        {/* Meta Info Card */}
                        <div className="stu-quiz-meta-card">
                            <h3 className="stu-quiz-meta-title-sidebar">Thông số đề thi</h3>
                            <div className="stu-quiz-meta-vertical-list">
                                
                                {/* Questions Count */}
                                <div className="stu-quiz-meta-row">
                                    <div className="stu-quiz-meta-icon-wrapper purple">
                                        <FiFileText />
                                    </div>
                                    <div className="stu-quiz-meta-info-content">
                                        <span className="stu-quiz-meta-label-side">Số câu hỏi</span>
                                        <span className="stu-quiz-meta-value-side">{quiz.question_count || '0'} câu</span>
                                    </div>
                                </div>

                                {/* Time Limit */}
                                <div className="stu-quiz-meta-row">
                                    <div className="stu-quiz-meta-icon-wrapper pink">
                                        <FiClock />
                                    </div>
                                    <div className="stu-quiz-meta-info-content">
                                        <span className="stu-quiz-meta-label-side">Thời gian</span>
                                        <span className="stu-quiz-meta-value-side">{quiz.time_limit || '30'} phút</span>
                                    </div>
                                </div>

                                {/* Author name */}
                                <div className="stu-quiz-meta-row">
                                    <div className="stu-quiz-meta-icon-wrapper green">
                                        <FiUser />
                                    </div>
                                    <div className="stu-quiz-meta-info-content">
                                        <span className="stu-quiz-meta-label-side">Người ra đề</span>
                                        <span className="stu-quiz-meta-value-side">{quiz.author_name || 'Giáo viên'}</span>
                                    </div>
                                </div>

                                {/* Max attempts */}
                                <div className="stu-quiz-meta-row">
                                    <div className="stu-quiz-meta-icon-wrapper orange">
                                        <FiActivity />
                                    </div>
                                    <div className="stu-quiz-meta-info-content">
                                        <span className="stu-quiz-meta-label-side">Lượt làm bài</span>
                                        <span className="stu-quiz-meta-value-side">Tối đa {quiz.max_attempts || 1} lần</span>
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
                                        Đang tạo phiên...
                                    </>
                                ) : (
                                    <>
                                        <FiPlay /> Bắt đầu làm bài
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={handleGoBack}
                                className="stu-btn-cancel-premium"
                                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '48px', padding: 0 }}
                            >
                                <FiArrowLeft /> Quay lại danh sách
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
