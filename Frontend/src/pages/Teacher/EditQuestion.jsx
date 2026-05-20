import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import './Teacher.css';

export default function EditQuestion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [error, setError] = useState(null);

    const [content, setContent] = useState('');
    const [type, setType] = useState('multiple');
    const [subjectId, setSubjectId] = useState('');
    const [choices, setChoices] = useState([]);

    useEffect(() => {
        let mounted = true;
        const loadInitialData = async () => {
            try {
                // Fetch subjects first
                const subjectsData = await apiService.getSubjects();
                if (mounted) setSubjects(Array.isArray(subjectsData) ? subjectsData : (subjectsData.results || []));

                // Fetch question
                const data = await apiService.getQuestion(id);
                if (mounted) {
                    setContent(data.content || '');
                    setType(data.type || 'multiple');
                    setSubjectId(data.subject || '');
                    // Ensure choices exist
                    if (data.choices && data.choices.length > 0) {
                        setChoices(data.choices);
                    } else {
                        setChoices([
                            { content: '', is_correct: false },
                            { content: '', is_correct: false }
                        ]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch initial data", err);
                if (mounted) setError(err.message || 'Failed to fetch question details');
            } finally {
                if (mounted) setFetching(false);
            }
        };

        loadInitialData();
        return () => { mounted = false; };
    }, [id]);

    const handleBack = () => {
        navigate('/teacher/questions');
    };

    const handleChoiceChange = (index, field, value) => {
        const newChoices = [...choices];
        newChoices[index][field] = value;
        setChoices(newChoices);
    };

    const addChoice = () => {
        setChoices([...choices, { content: '', is_correct: false }]);
    };

    const removeChoice = (index) => {
        if (choices.length <= 2) return;
        const newChoices = choices.filter((_, i) => i !== index);
        setChoices(newChoices);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!content.trim()) {
            setError("Question content is required");
            return;
        }

        if (!subjectId) {
            setError("Subject is required");
            return;
        }

        const validChoices = choices.filter(c => c.content.trim() !== '');
        if (validChoices.length < 2) {
            setError("At least two choices with content are required");
            return;
        }

        const hasCorrect = validChoices.some(c => c.is_correct);
        if (!hasCorrect) {
            setError("At least one choice must be marked as correct");
            return;
        }

        setLoading(true);
        try {
            await apiService.partialUpdateQuestion(id, {
                type,
                content,
                subject: subjectId,
                choices: validChoices
            });
            toast.success('Cập nhật câu hỏi thành công!');
            navigate('/teacher/questions');
        } catch (err) {
            const errorData = err.response?.data;
            const msg = errorData ? (Object.values(errorData)[0][0] || 'Lỗi khi cập nhật câu hỏi') : (err.message || 'Lỗi khi cập nhật câu hỏi');
            setError(msg);
            toast.error(msg);
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="admin-container teacher-createquiz">
                <QuickSystem />
                <div style={{ padding: '20px' }}>Loading question data...</div>
            </div>
        );
    }

    return (
        <div className="admin-container teacher-createquiz">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Edit Question</h1>
                    <p className="admin-subtitle">Update question details and choices.</p>
                </div>
                <button className="secondary-btn" onClick={() => navigate('/teacher/questions')}>
                    Back to Question Bank
                </button>
            </header>

            <div className="admin-card">
                <form className="create-quiz-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message" style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>{error}</div>}

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Môn học</label>
                        <select
                            className="filter-select"
                            style={{ width: '100%', padding: '10px' }}
                            value={subjectId}
                            onChange={e => setSubjectId(e.target.value)}
                            required
                        >
                            <option value="">Chọn môn học</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Question Type</label>
                        <select
                            className="filter-select"
                            style={{ width: '100%', padding: '10px' }}
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <option value="multiple">Multiple Choice</option>
                            <option value="single">Single Choice</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Question Content</label>
                        <textarea
                            rows="4"
                            placeholder="Enter the question text here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Choices</span>
                            <button type="button" className="text-btn" onClick={addChoice}>+ Add Choice</button>
                        </label>

                        {choices.map((choice, index) => (
                            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={choice.is_correct}
                                    onChange={(e) => handleChoiceChange(index, 'is_correct', e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    title="Mark as correct"
                                />
                                <input
                                    type="text"
                                    placeholder={`Choice ${index + 1}`}
                                    value={choice.content}
                                    onChange={(e) => handleChoiceChange(index, 'content', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="text-btn danger"
                                    onClick={() => removeChoice(index)}
                                    disabled={choices.length <= 2}
                                    style={{ opacity: choices.length <= 2 ? 0.5 : 1, cursor: choices.length <= 2 ? 'not-allowed' : 'pointer' }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>Select the checkbox to indicate the correct answer(s).</p>
                    </div>

                    <div className="form-actions" style={{ marginTop: '24px' }}>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="secondary-btn" onClick={handleBack} disabled={loading}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
