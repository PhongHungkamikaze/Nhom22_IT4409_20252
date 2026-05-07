import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Teacher.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';

export default function MyQuizzes() {
    const [searchTerm, setSearchTerm] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiService.getQuizzes();
                setQuizzes(data.results);
            } catch (err) {
                console.error('Failed to fetch quizzes', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredQuizzes = quizzes.filter(q => {
        const title = (q.title || '').toLowerCase();
        const code = ((q.code || q.slug || '') + '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return title.includes(term) || code.includes(term);
    });

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">My Quizzes</h1>
                    <p className="admin-subtitle">Create, manage, and monitor your quiz exams.</p>
                </div>
                <Link to="/teacher/quizzes/create" className="primary-btn">
                    <span className="btn-icon">✨</span> Create New Quiz
                </Link>
            </header>


            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by title or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select">
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Author</th>
                                <th>Created At</th>
                                <th>Time Limit (min)</th>
                                <th>Published</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8">Loading quizzes...</td></tr>
                            ) : filteredQuizzes.length > 0 ? (
                                filteredQuizzes.map(quiz => {
                                    const authorName = quiz.author_name || quiz.author || quiz.teacher_name || '';
                                    // determine if current user is the author
                                    const isAuthor = (() => {
                                        if (!user) return false;
                                        const uid = user.id || user.user_id || user.pk;
                                        // check common fields on quiz
                                        if (quiz.author === uid || quiz.author_id === uid || String(quiz.author) === String(uid)) return true;
                                        if (quiz.author_username && user.username && quiz.author_username === user.username) return true;
                                        if (quiz.author_name && (quiz.author_name === `${user.first_name} ${user.last_name}` || quiz.author_name === user.username)) return true;
                                        return false;
                                    })();

                                    return (
                                        <tr key={quiz.id}>
                                            <td>{quiz.id}</td>
                                            <td>{quiz.title}</td>
                                            <td>{quiz.subject_name || '-'}</td>
                                            <td>{authorName}</td>
                                            <td>{quiz.created_at}</td>
                                            <td>{quiz.time_limit}</td>
                                            <td>
                                                {quiz.is_published ? "Đã xuất bản" : "Chưa xuất bản"}
                                            </td>
                                            <td className="action-group">
                                                {isAuthor ? (
                                                    <>
                                                        <Link to={`/teacher/quizzes/${quiz.id}`} className="text-btn">Detail</Link>
                                                        <Link to={`/teacher/quizzes/edit/${quiz.id}`} className="text-btn">Edit</Link>
                                                        <button
                                                            className="text-btn danger"
                                                            onClick={async () => {
                                                                if (!window.confirm('Xác nhận xóa quiz này?')) return;
                                                                try {
                                                                    await apiService.deleteQuiz(quiz.id);
                                                                    setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
                                                                } catch (err) {
                                                                    console.error('Failed to delete quiz', err);
                                                                    alert('Không thể xóa quiz. Xem console để biết chi tiết.');
                                                                }
                                                            }}
                                                        >Delete</button>
                                                    </>
                                                ) : (
                                                    <Link to={`/teacher/quizzes/${quiz.id}`} className="text-btn">Detail</Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="8">No quizzes found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="pagination-info">Showing {filteredQuizzes.length} quizzes</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
