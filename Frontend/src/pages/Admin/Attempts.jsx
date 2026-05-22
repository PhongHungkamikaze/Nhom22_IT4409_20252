import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';

export default function Attempts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attemptsLoading, setAttemptsLoading] = useState(false);
    const [error, setError] = useState(null);

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
                        <h1 className="admin-title">Quản lý kết quả bài thi</h1>
                        <p className="admin-subtitle">Chọn một bài thi để xem chi tiết các lượt làm bài của thí sinh.</p>
                    </div>
                </header>

                <div className="admin-card">
                    <div className="table-controls">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài thi..."
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
                                    <th>Tên bài thi</th>
                                    <th>Tác giả</th>
                                    <th>Số bài nộp</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5">Đang tải danh sách bài thi...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan="5" style={{ color: 'red' }}>Lỗi: {error}</td></tr>
                                ) : quizzes.length > 0 ? (
                                    quizzes.map(quiz => (
                                        <tr key={quiz.id}>
                                            <td>{quiz.id}</td>
                                            <td><strong>{quiz.title}</strong></td>
                                            <td>{quiz.author_name || quiz.teacher_name || '-'}</td>
                                            <td>{quiz.attempts_count || '-'}</td>
                                            <td>
                                                <button 
                                                    className="text-btn" 
                                                    onClick={() => setSelectedQuiz(quiz)}
                                                >
                                                    Xem kết quả thí sinh →
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5">Không tìm thấy bài thi nào.</td></tr>
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
                            ← Quay lại danh sách bài thi
                        </button>
                    </div>
                    <h1 className="admin-title">Kết quả: {selectedQuiz.title}</h1>
                    <p className="admin-subtitle">Danh sách thí sinh đã tham gia và kết quả chi tiết.</p>
                </div>
            </header>

            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm thí sinh..."
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
                                <th>ID</th>
                                <th>Thí sinh</th>
                                <th>Thời điểm nộp</th>
                                <th>Điểm số</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attemptsLoading ? (
                                <tr><td colSpan="6">Đang tải kết quả bài làm...</td></tr>
                            ) : attempts.length > 0 ? (
                                attempts.map(attempt => (
                                    <tr key={attempt.id}>
                                        <td>{attempt.id}</td>
                                        <td>
                                            <div className="user-name-cell">
                                                <div className="avatar">
                                                    {(attempt.user?.username || attempt.username || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <span>{attempt.user?.username || attempt.username}</span>
                                            </div>
                                        </td>
                                        <td>{attempt.started_at || attempt.created_at || '-'}</td>
                                        <td><strong>{attempt.score ?? '-'} / 10</strong></td>
                                        <td>
                                            <span className={`status-badge status-${(attempt.status || 'pending').toLowerCase()}`}>
                                                {attempt.status || 'Completed'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-group">
                                                <button className="text-btn">Xem chi tiết</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6">Chưa có thí sinh nào làm bài này.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
