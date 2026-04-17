import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import './Student.css';

export default function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);

    // READ: Fetch all quizzes from API
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                const data = await apiService.getQuizzes();
                const quizList = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
                setQuizzes(quizList);
                setFilteredQuizzes(quizList);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch quizzes:', err);
                setError('Không thể tải danh sách bài quiz');
                setQuizzes([]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    // Handle search/filter
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredQuizzes(quizzes);
        } else {
            const filtered = quizzes.filter(quiz =>
                quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredQuizzes(filtered);
        }
    }, [searchTerm, quizzes]);

    return (
        <div className="student-page">
            {/* Header */}
            <section className="stu-hero">
                <div className="stu-hero-content">
                    <div className="stu-hero-text">
                        <h1>📚 Danh Sách Bài Quiz</h1>
                        <p>Chọn một bài quiz để bắt đầu thử sức</p>
                    </div>
                </div>
            </section>

            {/* Search Bar */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div className="stu-search-container" style={{ marginBottom: '2rem' }}>
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm bài quiz..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="stu-search-input"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '1rem',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontFamily: 'inherit'
                            }}
                        />
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

                    {/* Loading State */}
                    {loading ? (
                        <div className="stu-loading">
                            <div className="stu-spinner"></div>
                            <p>Đang tải bài quiz...</p>
                        </div>
                    ) : filteredQuizzes.length === 0 ? (
                        <div className="stu-empty">
                            <span className="stu-empty-icon">📭</span>
                            <p>{searchTerm ? 'Không tìm thấy bài quiz nào' : 'Chưa có bài quiz nào khả dụng'}</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1rem', color: '#666' }}>
                                Tìm thấy {filteredQuizzes.length} bài quiz
                            </div>
                            <div className="stu-quizzes-grid">
                                {filteredQuizzes.map(quiz => (
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
                                            {quiz.description || 'Hãy thử sức với bài quiz này!'}
                                        </p>
                                        <div className="stu-quiz-info">
                                            <span>📝 {quiz.questions_count || quiz.question_count || '?'} câu hỏi</span>
                                            <span>⏱️ {quiz.time_limit || quiz.duration || '30'} phút</span>
                                        </div>
                                        <div className="stu-quiz-footer">
                                            <span className="stu-quiz-author">
                                                Bởi: {quiz.author || quiz.teacher_name || quiz.created_by || 'Giáo viên'}
                                            </span>
                                            <Link to={`/student/quizzes/${quiz.id}`} className="stu-quiz-start-btn">
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
