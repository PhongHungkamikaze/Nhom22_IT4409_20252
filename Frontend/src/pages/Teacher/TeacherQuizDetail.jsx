import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import './Teacher.css';
import { useAuth } from '../../context/AuthContext';

export default function TeacherQuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await apiService.getQuiz(id);
                setQuiz(data);
            } catch (err) {
                console.error('Failed to load quiz', err);
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const isAuthor = (() => {
        if (!user || !quiz) return false;
        const uid = user.id || user.user_id || user.pk;
        if (!uid) return false;
        if (quiz.author === uid || quiz.author_id === uid || String(quiz.author) === String(uid)) return true;
        if (quiz.author_username && user.username && quiz.author_username === user.username) return true;
        return false;
    })();

    if (loading) return <div className="admin-container"><div className="admin-card">Loading...</div></div>;
    if (error) return <div className="admin-container"><div className="admin-card">Error: {error}</div></div>;
    if (!quiz) return <div className="admin-container"><div className="admin-card">Quiz not found</div></div>;

    return (
        <div className="admin-container">
            <div className="admin-card teacher-quiz-detail">
                <div className="teacher-quiz-main">
                    <div className="teacher-quiz-content">
                        <h2 className="quiz-title">{quiz.title}</h2>
                        <p className="quiz-desc">{quiz.description}</p>

                        <div className="teacher-quiz-grid">
                            <div className="meta-card">
                                <strong>Time limit</strong>
                                <div className="meta-value">{quiz.time_limit ?? quiz.duration ?? '—'}</div>
                            </div>
                            <div className="meta-card">
                                <strong>Questions</strong>
                                <div className="meta-value">{quiz.questions_count ?? quiz.question_count ?? '—'}</div>
                            </div>
                            <div className="meta-card">
                                <strong>Author</strong>
                                <div className="meta-value">{quiz.author_name ?? quiz.author ?? quiz.teacher_name ?? '—'}</div>
                            </div>
                        </div>
                        {/* Questions list (if available) */}
                        {Array.isArray(quiz.questions) && quiz.questions.length > 0 && (
                            <div style={{ marginTop: 18 }}>
                                <h3 style={{ marginBottom: 8 }}>Questions</h3>
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Question</th>
                                                <th>Choices</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quiz.questions.map((q, idx) => (
                                                <tr key={q.id || idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{q.content}</td>
                                                    <td>
                                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                                            {(q.choices || []).map(c => (
                                                                <li key={c.id}>{c.content}</li>
                                                            ))}
                                                        </ul>
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
                            <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
                        </div>
                        <div className="action-block">
                            {isAuthor ? (
                                <Link to={`/teacher/quizzes/edit/${quiz.id}`} className="primary-btn">Edit</Link>
                            ) : (
                                <button className="secondary-btn" disabled>Only author can edit</button>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
