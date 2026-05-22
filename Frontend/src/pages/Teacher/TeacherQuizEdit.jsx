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
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [loadingAvailable, setLoadingAvailable] = useState(false);
    const [addingExisting, setAddingExisting] = useState(false);

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
                        const qRes = await apiService.getQuizQuestions(id);
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
                // load question bank (all questions) to allow selecting from bank
                try {
                    const allQs = await apiService.getQuestions();
                    const list = Array.isArray(allQs) ? allQs : (allQs.results || allQs);
                    const existingIds = (data.questions || []).map(x => x.id || x.pk).filter(Boolean);
                    const available = (list || []).filter(q => !existingIds.includes(q.id || q.pk));
                    // attach is_ready flag used by the UI
                    setAvailableQuestions((available || []).map(q => ({ ...q, is_ready: false })));
                } catch (e) {
                    console.debug('Could not load question bank', e);
                }
            } catch (err) {
                console.error('Failed to load quiz', err);
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const reloadAvailable = async () => {
        setLoadingAvailable(true);
        try {
            const allQs = await apiService.getQuestions();
            const list = Array.isArray(allQs) ? allQs : (allQs.results || allQs);
            const existingIds = (questions || []).map(x => x.id || x.pk).filter(Boolean);
            const available = (list || []).filter(q => !existingIds.includes(q.id || q.pk));
            setAvailableQuestions((available || []).map(q => ({ ...q, is_ready: false })));
        } catch (err) {
            console.error('Failed to load available questions', err);
        } finally { setLoadingAvailable(false); }
    };

    const toggleAvailableReady = (qId) => {
        setAvailableQuestions(prev => prev.map(q => {
            const id = q.id || q.pk || q.question_id;
            if (String(id) === String(qId)) return { ...q, is_ready: !q.is_ready };
            return q;
        }));
    };

    const handleAddSelected = async () => {
        const selected = availableQuestions.filter(q => q.is_ready);
        if (!selected || selected.length === 0) return alert('Vui lòng chọn ít nhất một câu hỏi để thêm.');
        setAddingExisting(true);
        try {
            const existingIds = questions.map(q => q.id || q.pk || q.question_id).filter(Boolean);
            const selectedIds = selected.map(q => q.id || q.pk || q.question_id).filter(Boolean);
            const newQuestionIds = [...existingIds, ...selectedIds];

            await apiService.partialUpdateQuiz(id, { question_ids: newQuestionIds });

            setQuestions(prev => [...prev, ...selected.map(q => ({ ...q }))]);
            setAvailableQuestions(prev => prev.filter(q => !q.is_ready));
        } catch (err) {
            console.error('Failed to add selected questions', err);
            alert('Không thể thêm câu hỏi đã chọn. Xem console để biết chi tiết.');
        } finally {
            setAddingExisting(false);
        }
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        if (!title.trim()) { setError('Title required'); return; }
        setSaving(true); setError(null);
        try {
            const questionIds = questions.map(q => q.id || q.pk || q.question_id).filter(Boolean);
            const payload = {
                title: title.trim(),
                description: description.trim(),
                time_limit: Number(timeLimit) || 0,
                is_published: Boolean(isPublished),
                question_ids: questionIds,
            };
            await apiService.partialUpdateQuiz(id, payload);
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
                                            <td>
                                                <div className="action-group">
                                                    <button className="text-btn danger" onClick={async () => {
                                                        if (!window.confirm('Xác nhận xóa câu hỏi này khỏi quiz?')) return;
                                                        try {
                                                            const newQuestionIds = questions
                                                                .filter(x => (x.id || x.pk || x.question_id) !== qId)
                                                                .map(x => x.id || x.pk || x.question_id)
                                                                .filter(Boolean)
                                                                .map(x => Number(x));

                                                            await apiService.partialUpdateQuiz(id, { question_ids: newQuestionIds });

                                                            setQuestions(prev => prev.filter(x => (x.id || x.pk || x.question_id) !== qId));
                                                            const removedQ = questions.find(x => (x.id || x.pk || x.question_id) === qId);
                                                            if (removedQ) {
                                                                setAvailableQuestions(prev => [...prev, { ...removedQ, is_ready: false }]);
                                                            }
                                                        } catch (err) {
                                                            console.error('Failed to delete question from quiz', err);
                                                            alert('Không thể xóa câu hỏi. Xem console để biết chi tiết.');
                                                        }
                                                    }}>Delete</button>
                                                </div>
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


                </section>

                <section style={{ marginTop: 20 }}>
                    <h3>Available questions (Question bank)</h3>
                    <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="secondary-btn" type="button" onClick={reloadAvailable} disabled={loadingAvailable}>Reload</button>
                        <button className="primary-btn" type="button" onClick={handleAddSelected} disabled={addingExisting || availableQuestions.filter(q => q.is_ready).length === 0}>{addingExisting ? 'Adding...' : 'Add selected'}</button>
                        {loadingAvailable && <span style={{ marginLeft: 8 }}>Loading available questions...</span>}
                    </div>

                    <div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>Select</th>
                                    <th>Question</th>
                                    <th>Choices</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableQuestions.map(q => {
                                    const qId = q.id || q.pk || q.question_id;
                                    const qContent = q.content || q.question || q.title || '';
                                    const qChoices = q.choices || q.choice_set || q.answers || [];
                                    return (
                                        <tr key={qId || Math.random()}>
                                            <td>
                                                <input type="checkbox" checked={Boolean(q.is_ready)} onChange={() => toggleAvailableReady(qId)} />
                                            </td>
                                            <td>{qContent}</td>
                                            <td>
                                                <ul>
                                                    {(Array.isArray(qChoices) ? qChoices : []).map((c, idx) => (
                                                        <li key={c.id || c.pk || idx}>{c.content || c.text || c.choice || String(c)}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>
                                                <div className="action-group">
                                                    <button className="text-btn" onClick={() => {
                                                        setAvailableQuestions(prev => prev.map(item => {
                                                            const id = item.id || item.pk || item.question_id;
                                                            if (String(id) === String(qId)) return { ...item, is_ready: true };
                                                            return item;
                                                        }));
                                                        setTimeout(() => handleAddSelected(), 50);
                                                    }}>Add</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {availableQuestions.length === 0 && (
                                    <tr><td colSpan="4">No available questions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
                    <button className="primary-btn" type="button" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save all'}</button>
                    <button type="button" className="secondary-btn" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
