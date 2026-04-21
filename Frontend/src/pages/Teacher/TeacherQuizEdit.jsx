import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './Teacher.css';
import { useAuth } from '../../context/AuthContext';

export default function TeacherQuizEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [newQContent, setNewQContent] = useState('');
    const [newQChoices, setNewQChoices] = useState('');
    const [addingQuestion, setAddingQuestion] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await apiService.getQuiz(id);
                setQuiz(data);
                // prefer questions included on quiz payload, otherwise try fetching quiz questions endpoint
                const initialQuestions = data.questions || [];
                if (initialQuestions && initialQuestions.length > 0) {
                    setQuestions(initialQuestions);
                } else {
                    // try fetching /quizzes/:id/questions/ which some backends expose
                    try {
                        const qRes = await apiService.request(`/quizzes/${id}/questions/`);
                        const qList = Array.isArray(qRes) ? qRes : (qRes.results || qRes);
                        setQuestions(qList || []);
                    } catch (qErr) {
                        // no questions endpoint or failed - fallback to empty
                        console.debug('No separate questions endpoint or failed to fetch questions', qErr);
                        setQuestions([]);
                    }
                }
                setTitle(data.title || '');
                setDescription(data.description || '');
                setTimeLimit(data.time_limit ? String(data.time_limit) : (data.duration ? String(data.duration) : ''));
                setIsPublished(Boolean(data.is_published));
            } catch (err) {
                console.error('Failed to load quiz', err);
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title required'); return; }
        setSaving(true); setError(null);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                time_limit: Number(timeLimit) || 0,
                is_published: Boolean(isPublished),
            };
            await apiService.updateQuiz(id, payload);
            navigate(`/teacher/quizzes/${id}`);
        } catch (err) {
            console.error('Save failed', err);
            setError(err.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    if (loading) return <div className="admin-container"><div className="admin-card">Loading...</div></div>;
    if (error) return <div className="admin-container"><div className="admin-card">Error: {error}</div></div>;
    if (!quiz) return <div className="admin-container"><div className="admin-card">Quiz not found</div></div>;

    // simple author check
    const uid = user && (user.id || user.user_id || user.pk);
    const isAuthor = uid && (quiz.author === uid || quiz.author_id === uid || String(quiz.author) === String(uid) || (quiz.author_username && user.username && quiz.author_username === user.username));
    if (!isAuthor) {
        return (
            <div className="admin-container">
                <div className="admin-card">
                    <h2>Not allowed</h2>
                    <p>You are not the author of this quiz.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-card teacher-quiz-edit">
                <h2>Edit Quiz</h2>

                <form onSubmit={handleSave} className="create-quiz-form">
                    <table className="table edit-table">
                        <tbody>
                            <tr>
                                <td style={{ width: '200px', fontWeight: 600 }}>Title</td>
                                <td>
                                    <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ verticalAlign: 'top', fontWeight: 600 }}>Description</td>
                                <td>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} style={{ width: '100%' }} />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Time limit (minutes)</td>
                                <td>
                                    <input type="number" min={0} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Published</td>
                                <td>
                                    <label>
                                        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />{' '}
                                        Publish this quiz
                                    </label>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                        <button type="button" className="secondary-btn" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
                    </div>
                </form>

                <section style={{ marginTop: 20 }}>
                    <h3>Questions</h3>
                    <div style={{ marginBottom: 12 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Choices</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map(q => {
                                    const qId = q.id || q.pk || q.question_id;
                                    const qContent = q.content || q.question || q.title || '';
                                    const qChoices = q.choices || q.choice_set || q.answers || [];
                                    return (
                                        <tr key={qId || Math.random()}>
                                            <td>{qContent}</td>
                                            <td>
                                                <ul>
                                                    {(Array.isArray(qChoices) ? qChoices : []).map((c, idx) => (
                                                        <li key={c.id || c.pk || idx}>{c.content || c.text || c.choice || String(c)}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="action-group">
                                                <button className="text-btn danger" onClick={async () => {
                                                    if (!window.confirm('Xác nhận xóa câu hỏi này?')) return;
                                                    try {
                                                        if (apiService && typeof apiService.deleteQuestion === 'function') {
                                                            await apiService.deleteQuestion(qId);
                                                            // refresh list after delete to keep consistent with backend
                                                            try {
                                                                const refreshed = await (async () => {
                                                                    const maybe = await apiService.request(`/quizzes/${id}/questions/`);
                                                                    return Array.isArray(maybe) ? maybe : (maybe.results || maybe);
                                                                })();
                                                                setQuestions(refreshed || []);
                                                            } catch (rerr) {
                                                                // fallback to optimistic removal
                                                                setQuestions(prev => prev.filter(x => (x.id || x.pk || x.question_id) !== qId));
                                                            }
                                                        } else {
                                                            console.warn('apiService.deleteQuestion not available');
                                                        }
                                                    } catch (err) {
                                                        console.error('Failed to delete question', err);
                                                        alert('Không thể xóa câu hỏi. Xem console để biết chi tiết.');
                                                    }
                                                }}>Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {questions.length === 0 && (
                                    <tr><td colSpan="3">No questions yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <h4>Add new question</h4>
                        <div className="form-group">
                            <label>Question content</label>
                            <input type="text" value={newQContent} onChange={(e) => setNewQContent(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Choices (one per line)</label>
                            <textarea value={newQChoices} onChange={(e) => setNewQChoices(e.target.value)} rows={4} />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="primary-btn" disabled={addingQuestion} onClick={async () => {
                                if (!newQContent.trim()) { alert('Question content required'); return; }
                                setAddingQuestion(true);
                                const choices = newQChoices.split('\n').map(s => s.trim()).filter(Boolean).map(c => ({ content: c }));
                                const payload = {
                                    quiz: quiz.id,
                                    type: 'single',
                                    content: newQContent.trim(),
                                    choices,
                                };
                                try {
                                    const created = await apiService.createQuestion(payload);
                                    // Try to refresh authoritative list from backend if possible
                                    try {
                                        const maybe = await apiService.request(`/quizzes/${id}/questions/`);
                                        const refreshed = Array.isArray(maybe) ? maybe : (maybe.results || maybe);
                                        if (refreshed && refreshed.length >= 0) {
                                            setQuestions(refreshed || []);
                                        } else if (created && (created.id || created.pk)) {
                                            setQuestions(prev => [...prev, created]);
                                        }
                                    } catch (rfErr) {
                                        // fallback: append created or a minimal object
                                        const q = created && (created.id || created.pk) ? created : { id: created && (created.id || created.pk) || Math.random(), content: payload.content, choices: choices.map((c, idx) => ({ id: idx + 1, content: c.content })) };
                                        setQuestions(prev => [...prev, q]);
                                    }
                                    setNewQContent(''); setNewQChoices('');
                                } catch (err) {
                                    console.error('Failed to create question', err);
                                    alert('Không thể thêm câu hỏi. Xem console để biết chi tiết.');
                                } finally {
                                    setAddingQuestion(false);
                                }
                            }}>{addingQuestion ? 'Adding...' : 'Add question'}</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
