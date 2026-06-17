import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import './Teacher.css';

export default function CreateQuiz() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('0');
    const [maxAttempts, setMaxAttempts] = useState('1');
    const [subjectId, setSubjectId] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoadingSubjects(true);
            try {
                const response = await apiService.getSubjects();
                // Depending on API response structure, it might be response.results or response
                const subjectsData = response.results || response;
                setSubjects(subjectsData);
                if (subjectsData.length > 0) {
                    setSubjectId(subjectsData[0].id);
                }
            } catch (err) {
                console.error('Failed to fetch subjects', err);
                toast.error('Không thể tải danh sách môn học');
            } finally {
                setLoadingSubjects(false);
            }
        };
        fetchSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Tiêu đề không được để trống');
            return;
        }
        if (!subjectId) {
            toast.error('Vui lòng chọn môn học');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                time_limit: Number(timeLimit) || 0,
                max_attempts: Number(maxAttempts) || 1,
                subject: subjectId,
            };
            await apiService.createQuiz(payload);
            toast.success('Tạo bài thi thành công!');
            // on success navigate back to quiz list
            navigate('/teacher/quizzes');
        } catch (err) {
            console.error('Create quiz failed', err);
            const msg = err.message || 'Lỗi khi tạo bài thi';
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-container teacher-createquiz">
            <div className="admin-card">
                <h2>Create Quiz</h2>
                <form className="create-quiz-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter quiz title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Subject</label>
                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            disabled={loadingSubjects}
                            required
                        >
                            <option value="">Select a subject</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                            rows={4}
                        />
                    </div>

                    <div className="form-group">
                        <label>Time limit (Minutes)</label>
                        <input
                            type="number"
                            min={0}
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Max attempts</label>
                        <input
                            type="number"
                            min={1}
                            value={maxAttempts}
                            onChange={(e) => setMaxAttempts(e.target.value)}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions">
                        <button type="submit" className="primary-btn" disabled={submitting || loadingSubjects}>
                            {submitting ? 'Creating...' : 'Create Quiz'}
                        </button>
                        <button type="button" className="secondary-btn" onClick={() => navigate(-1)} disabled={submitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
