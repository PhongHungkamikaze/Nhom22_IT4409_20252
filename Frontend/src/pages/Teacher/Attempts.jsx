import React, { useState, useEffect } from 'react';
import './Teacher.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import apiService from '../../services/api';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';

export default function Attempts() {
    const { user } = useAuth();
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [attemptPage, setAttemptPage] = useState(1);
    const [attemptTotalCount, setAttemptTotalCount] = useState(0);
    const pageSize = 10;

    const fetchQuizzes = async (page = currentPage) => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm,
                ordering: quizSorting,
                page: page,
                page_size: pageSize,
                author: user?.id
            };
            const data = await apiService.getQuizzes(params);
            if (data.results) {
                setQuizzes(data.results);
                setTotalCount(data.count);
            } else {
                setQuizzes(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
        } catch (err) {
            console.error('Failed to fetch quizzes', err);
            setError('Không thể tải danh sách bài thi');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttempts = async (page = attemptPage) => {
        if (!selectedQuiz) return;
        try {
            setAttemptsLoading(true);
            const params = {
                quiz: selectedQuiz.id,
                search: searchTerm,
                ordering: attemptSorting,
                page: page,
                page_size: pageSize
            };
            const data = await apiService.getAttempts(params);
            if (data.results) {
                setAttempts(data.results);
                setAttemptTotalCount(data.count);
            } else {
                setAttempts(Array.isArray(data) ? data : []);
                setAttemptTotalCount(Array.isArray(data) ? data.length : 0);
            }
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
                setAttemptPage(1);
                fetchAttempts(1);
            } else {
                setCurrentPage(1);
                fetchQuizzes(1);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedQuiz, quizSorting, attemptSorting]);

    const handleQuizPageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchQuizzes(newPage);
    };

    const handleAttemptPageChange = (newPage) => {
        setAttemptPage(newPage);
        fetchAttempts(newPage);
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const attemptTotalPages = Math.ceil(attemptTotalCount / pageSize);

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

                    {totalCount > 0 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handleQuizPageChange}
                            totalCount={totalCount}
                            pageSize={pageSize}
                            itemLabel="bài thi"
                        />
                    )}
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
                                                                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Câu {i + 1}: {ans.question_content}</div>
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

                {attemptTotalCount > 0 && (
                    <Pagination 
                        currentPage={attemptPage}
                        totalPages={attemptTotalPages}
                        onPageChange={handleAttemptPageChange}
                        totalCount={attemptTotalCount}
                        pageSize={pageSize}
                        itemLabel="lượt làm bài"
                    />
                )}
            </div>
        </div>
    );
}
