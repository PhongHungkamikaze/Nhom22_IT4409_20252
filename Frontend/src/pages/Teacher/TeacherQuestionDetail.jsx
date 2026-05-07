import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import './Teacher.css';
import { useAuth } from '../../context/AuthContext';

export default function TeacherQuestionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await apiService.getQuestion(id);
                setQuestion(data);
            } catch (err) {
                console.error('Failed to load question', err);
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const isAuthor = (() => {
        if (!user || !question) return false;
        const uid = user.id || user.user_id || user.pk;
        if (!uid) return false;
        if (question.author === uid || question.author_id === uid || String(question.author) === String(uid)) return true;
        if (question.author_username && user.username && question.author_username === user.username) return true;
        if (question.author_name && (question.author_name === user.username || question.author_name === `${user.first_name} ${user.last_name}`)) return true;
        return false;
    })();

    const handleDelete = async () => {
        if (!window.confirm('Xác nhận xóa câu hỏi này?')) return;
        try {
            await apiService.deleteQuestion(question.id);
            navigate('/teacher/questions');
        } catch (err) {
            console.error('Failed to delete question', err);
            alert('Không thể xóa câu hỏi. Xem console để biết chi tiết.');
        }
    };

    if (loading) return <div className="admin-container"><div className="admin-card">Loading...</div></div>;
    if (error) return <div className="admin-container"><div className="admin-card">Error: {error}</div></div>;
    if (!question) return <div className="admin-container"><div className="admin-card">Question not found</div></div>;

    return (
        <div className="admin-container">
            <div className="admin-card teacher-quiz-detail">
                <div className="teacher-quiz-main">
                    <div className="teacher-quiz-content">
                        <h2 className="quiz-title">Question Detail</h2>

                        <div className="teacher-quiz-grid">
                            <div className="meta-card">
                                <strong>Type</strong>
                                <div className="meta-value">{question.type}</div>
                            </div>
                            <div className="meta-card">
                                <strong>Author</strong>
                                <div className="meta-value">{question.author_name || question.author || '-'}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                            <h3 style={{ marginBottom: 8 }}>Question Content</h3>
                            <div className="admin-card" style={{ background: '#f8fafc', padding: 16 }}>
                                <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.6 }}>{question.content}</p>
                            </div>
                        </div>

                        {Array.isArray(question.choices) && question.choices.length > 0 && (
                            <div style={{ marginTop: 18 }}>
                                <h3 style={{ marginBottom: 8 }}>Choices</h3>
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 50 }}>#</th>
                                                <th>Content</th>
                                                <th style={{ width: 120 }}>Correct?</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {question.choices.map((c, idx) => (
                                                <tr key={c.id || idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{c.content}</td>
                                                    <td>
                                                        {c.is_correct ? (
                                                            <span className="status-badge status-active">✓ Correct</span>
                                                        ) : (
                                                            <span className="status-badge status-inactive">✗ Wrong</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="teacher-quiz-actions">
                        <div className="action-block">
                            <button className="secondary-btn" onClick={() => navigate("/teacher/questions")}>Back</button>
                        </div>
                        {isAuthor && (
                            <>
                                <div className="action-block">
                                    <Link to={`/teacher/questions/edit/${question.id}`} className="primary-btn">Edit</Link>
                                </div>
                                <div className="action-block">
                                    <button className="text-btn danger" onClick={handleDelete}>Delete</button>
                                </div>
                            </>
                        )}
                        {!isAuthor && (
                            <div className="action-block">
                                <button className="secondary-btn" disabled>Only author can edit</button>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
