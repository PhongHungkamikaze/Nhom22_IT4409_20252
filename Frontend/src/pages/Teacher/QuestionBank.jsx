import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Teacher.css';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';

export default function QuestionBank() {
    const [searchTerm, setSearchTerm] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const [ordering, setOrdering] = useState('-id');
    const [typeFilter, setTypeFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [subjects, setSubjects] = useState([]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                ordering: ordering,
            };
            if (typeFilter !== 'all') params.type = typeFilter;
            if (subjectFilter !== 'all') params.subject = subjectFilter;
            
            const data = await apiService.getQuestions(params);
            setQuestions(data.results || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch questions', err);
            setError(err.message || 'Fetch failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const data = await apiService.getSubjects();
            setSubjects(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            console.error('Failed to fetch subjects', err);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchQuestions();
        }, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm, typeFilter, subjectFilter, ordering]);

    const isAuthor = (question) => {
        if (!user) return false;
        const uid = user.id || user.user_id || user.pk;
        if (question.author === uid || question.author_id === uid || String(question.author) === String(uid)) return true;
        if (question.author_username && user.username && question.author_username === user.username) return true;
        if (question.author_name && (question.author_name === user.username || question.author_name === `${user.first_name} ${user.last_name}`)) return true;
        return false;
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm('Xác nhận xóa câu hỏi này?')) return;
        try {
            await apiService.deleteQuestion(questionId);
            setQuestions(prev => prev.filter(q => q.id !== questionId));
        } catch (err) {
            console.error('Failed to delete question', err);
            alert('Không thể xóa câu hỏi. Xem console để biết chi tiết.');
        }
    };

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Question Bank</h1>
                    <p className="admin-subtitle">Organize and manage the repository of your exam questions.</p>
                </div>
                <Link to="/teacher/questions/add" style={{textDecoration: 'none'}}>
                    <button className="primary-btn">
                        <span className="btn-icon">📝</span> Add Question
                    </button>
                </Link>
            </header>


            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search keywords or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="all">Tất cả loại câu</option>
                            <option value="single">Một lựa chọn</option>
                            <option value="multiple">Nhiều lựa chọn</option>
                        </select>
                        <select className="filter-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                            <option value="all">Tất cả môn học</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <select className="filter-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                            <option value="-id">Mới nhất</option>
                            <option value="id">Cũ nhất</option>
                            <option value="content">Nội dung A-Z</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Question Prompt</th>
                                <th>Author</th>
                                <th>Type</th>
                                <th>Choices</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6">Loading questions...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" style={{ color: 'red' }}>Error: {error}</td></tr>
                            ) : questions.length > 0 ? (
                                questions.map(q => {
                                    const questionIsAuthor = isAuthor(q);
                                    const authorDisplay = q.author_name || q.author || '-';
                                    return (
                                        <tr key={q.id}>
                                            <td>
                                                <div className="question-text">{q.content}</div>
                                            </td>
                                            <td>{authorDisplay}</td>
                                            <td>{q.type}</td>
                                            <td>
                                                <ul className="choice-list">
                                                    {(q.choices || []).map(c => (
                                                        <li key={c.id} className="choice-item">{c.content}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>
                                                <div className="action-group">
                                                    <Link to={`/teacher/questions/${q.id}`} className="text-btn">Detail</Link>
                                                    {questionIsAuthor && (
                                                        <>
                                                            <Link to={`/teacher/questions/edit/${q.id}`} style={{textDecoration: 'none'}}>
                                                                <button className="text-btn">Edit</button>
                                                            </Link>
                                                            <button className="text-btn danger" onClick={() => handleDelete(q.id)}>Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="6">No questions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span className="pagination-info">Showing {questions.length} questions</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
