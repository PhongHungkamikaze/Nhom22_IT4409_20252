import React, { useState, useEffect } from 'react';
import './Teacher.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import apiService from '../../services/api';

export default function Attempts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attemptsLoading, setAttemptsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(null);

    const [quizSorting, setQuizSorting] = useState('-id');
    const [attemptSorting, setAttemptSorting] = useState('-started_at');

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const params = { search: searchTerm, ordering: quizSorting };
            const data = await apiService.getQuizzes(params);
            setQuizzes(data.results || []);
        } catch (err) {
            console.error('Failed to fetch quizzes', err);
            setError('Không thể tải danh sách bài thi');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttempts = async () => {
        if (!selectedQuiz) return;
        try {
            setAttemptsLoading(true);
            const params = { 
                quiz: selectedQuiz.id,
                search: searchTerm,
                ordering: attemptSorting
            };
            const data = await apiService.getAttempts(params);
            setAttempts(data.results || []);
        } catch (err) {
            console.error('Failed to fetch attempts', err);
            setError('Không thể tải kết quả bài làm');
        } finally {
            setAttemptsLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (selectedQuiz) {
                fetchAttempts();
            } else {
                fetchQuizzes();
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedQuiz, quizSorting, attemptSorting]);

    // --- QUIZ SELECTION VIEW ---
    if (!selectedQuiz) {
        return (
            <div className="admin-container">
                <QuickSystem />
                <header className="admin-header">
                    <div>
                        <h1 className="admin-title">Quản lý bài làm</h1>
                        <p className="admin-subtitle">Chọn một bài quiz để xem danh sách kết quả của học sinh.</p>
                    </div>
                </header>

                <div className="admin-card">
                    <div className="table-controls">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài quiz..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <select className="filter-select" value={quizSorting} onChange={(e) => setQuizSorting(e.target.value)}>
                                <option value="-id">Mới nhất</option>
                                <option value="id">Cũ nhất</option>
                                <option value="title">Tiêu đề A-Z</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên bài Quiz</th>
                                    <th>Môn học</th>
                                    <th>Số bài làm</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5">Đang tải danh sách bài quiz...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan="5" style={{ color: 'red' }}>Lỗi: {error}</td></tr>
                                ) : quizzes.length > 0 ? (
                                    quizzes.map(quiz => (
                                        <tr key={quiz.id}>
                                            <td>{quiz.id}</td>
                                            <td><strong>{quiz.title}</strong></td>
                                            <td>{quiz.subject_name || '-'}</td>
                                            <td>{quiz.attempts_count || '-'}</td>
                                            <td>
                                                <button 
                                                    className="text-btn" 
                                                    onClick={() => setSelectedQuiz(quiz)}
                                                >
                                                    Xem danh sách bài làm →
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5">Không tìm thấy bài quiz nào.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- ATTEMPTS LIST VIEW (FOR SELECTED QUIZ) ---
    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <button className="text-btn" onClick={() => { setSelectedQuiz(null); setAttempts([]); }}>
                            ← Quay lại danh sách Quiz
                        </button>
                    </div>
                    <h1 className="admin-title">Bài làm: {selectedQuiz.title}</h1>
                    <p className="admin-subtitle">Xem chi tiết kết quả của các học sinh đã tham gia bài quiz này.</p>
                </div>
            </header>

            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm học sinh..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select" value={attemptSorting} onChange={(e) => setAttemptSorting(e.target.value)}>
                            <option value="-started_at">Mới nhất</option>
                            <option value="started_at">Cũ nhất</option>
                            <option value="-score">Điểm cao nhất</option>
                            <option value="score">Điểm thấp nhất</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Học sinh</th>
                                <th>Thời gian nộp</th>
                                <th>Điểm số</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attemptsLoading ? (
                                <tr><td colSpan="5">Đang tải danh sách bài làm...</td></tr>
                            ) : attempts.length > 0 ? (
                                attempts.map((attempt, idx) => (
                                    <React.Fragment key={`${attempt.id}-${idx}`}>
                                        <tr>
                                            <td>
                                                <div className="user-name-cell">
                                                    <div className="avatar" style={{ background: attempt.status === 'graded' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                                        {(attempt.username || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{attempt.username || `Học sinh #${attempt.user}`}</span>
                                                </div>
                                            </td>
                                            <td>{attempt.started_at}</td>
                                            <td>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {attempt.score ?? '-'} / 10
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${attempt.status && attempt.status.toLowerCase() === 'graded' ? 'active' : 'upcoming'}`}>
                                                    {attempt.status || 'Hoàn thành'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-group">
                                                    <button className="text-btn" onClick={() => setExpanded(expanded === idx ? null : idx)}>
                                                        {expanded === idx ? 'Ẩn chi tiết' : 'Xem câu trả lời'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expanded === idx && (
                                            <tr>
                                                <td colSpan={5} style={{ background: '#fafafa' }}>
                                                    <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', margin: '0.5rem' }}>
                                                        <h4 style={{ marginBottom: '1rem' }}>Chi tiết câu trả lời</h4>
                                                        {attempt.answers && attempt.answers.length > 0 ? (
                                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                                {attempt.answers.map((ans, i) => (
                                                                    <div key={i} style={{ padding: '1rem', background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Câu {i+1}: {ans.question_content}</div>
                                                                        <div style={{ color: '#666' }}>
                                                                            <span style={{ fontWeight: 600 }}>Lựa chọn:</span> {(ans.selected_choices || []).join(', ') || '—'}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div style={{ color: '#999', fontStyle: 'italic' }}>Không có dữ liệu câu trả lời.</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr><td colSpan="5">Chưa có bài làm nào cho quiz này.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
