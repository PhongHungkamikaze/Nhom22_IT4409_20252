import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';

export default function Questions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [ordering, setOrdering] = useState('-id');
    const [typeFilter, setTypeFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [teacherFilter, setTeacherFilter] = useState('all');
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                ordering: ordering,
            };
            if (typeFilter !== 'all') params.type = typeFilter;
            if (subjectFilter !== 'all') params.subject = subjectFilter;
            if (teacherFilter !== 'all') params.author = teacherFilter;

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

    const fetchFilters = async () => {
        try {
            const [subjData, teachData] = await Promise.all([
                apiService.getSubjects(),
                apiService.getUsers({ role: 'teacher' })
            ]);
            setSubjects(Array.isArray(subjData) ? subjData : (subjData.results || []));
            setTeachers(Array.isArray(teachData) ? teachData : (teachData.results || []));
        } catch (err) {
            console.error('Failed to fetch filters', err);
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchQuestions();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, typeFilter, subjectFilter, teacherFilter, ordering]);

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa câu hỏi này?')) return;
        try {
            await apiService.deleteQuestion(id);
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (err) {
            console.error('Delete question failed', err);
            alert('Không thể xóa câu hỏi.');
        }
    };

    const typeLabel = (t) => t === 'single' ? 'Một lựa chọn' : t === 'multiple' ? 'Nhiều lựa chọn' : t;
    const typeColor = (t) => t === 'single' ? 'qb-badge--single' : 'qb-badge--multiple';

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Ngân hàng câu hỏi</h1>
                    <p className="admin-subtitle">Quản lý kho câu hỏi hệ thống.</p>
                </div>
            </header>

            <div className="admin-card">
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm từ khóa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="all">Tất cả loại</option>
                            <option value="single">Một lựa chọn</option>
                            <option value="multiple">Nhiều lựa chọn</option>
                        </select>
                        <select className="filter-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                            <option value="all">Tất cả môn học</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <select className="filter-select" value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)}>
                            <option value="all">Tất cả giáo viên</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.username}</option>
                            ))}
                        </select>
                        <select className="filter-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                            <option value="-id">Mới nhất</option>
                            <option value="id">Cũ nhất</option>
                            <option value="content">Nội dung A-Z</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="qb-state">
                        <div className="qb-spinner" />
                        <p>Đang tải câu hỏi...</p>
                    </div>
                ) : error ? (
                    <div className="qb-state qb-state--error">❌ {error}</div>
                ) : questions.length === 0 ? (
                    <div className="qb-state">
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                        <p>Không tìm thấy câu hỏi nào.</p>
                    </div>
                ) : (
                    <div className="qb-list">
                        {questions.map((q, idx) => {
                            const correctChoices = (q.choices || []).filter(c => c.is_correct);
                            const wrongChoices = (q.choices || []).filter(c => !c.is_correct);
                            return (
                                <div className="qb-card" key={q.id}>
                                    {/* Left accent bar */}
                                    <div className={`qb-card__accent ${typeColor(q.type)}`} />

                                    <div className="qb-card__body">
                                        {/* Top row */}
                                        <div className="qb-card__top">
                                            <div className="qb-card__meta">
                                                <span className="qb-index">#{idx + 1}</span>
                                                <span className={`qb-badge ${typeColor(q.type)}`}>
                                                    {q.type === 'single' ? '◉' : '☑'} {typeLabel(q.type)}
                                                </span>
                                                {q.subject_name && (
                                                    <span className="qb-subject">📖 {q.subject_name}</span>
                                                )}
                                            </div>
                                            <div className="qb-card__actions">
                                                <Link to={`/admin/questions/${q.id}`} className="qb-btn qb-btn--detail">
                                                    Chi tiết
                                                </Link>
                                                <button className="qb-btn qb-btn--delete" onClick={() => handleDelete(q.id)}>
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>

                                        {/* Question content */}
                                        <p className="qb-card__content">{q.content}</p>

                                        {/* Choices */}
                                        {q.choices && q.choices.length > 0 && (
                                            <div className="qb-choices">
                                                {q.choices.map((c, ci) => (
                                                    <div
                                                        key={c.id}
                                                        className={`qb-choice ${c.is_correct ? 'qb-choice--correct' : 'qb-choice--wrong'}`}
                                                    >
                                                        <span className="qb-choice__letter">
                                                            {String.fromCharCode(65 + ci)}
                                                        </span>
                                                        <span className="qb-choice__text">{c.content}</span>
                                                        {c.is_correct && <span className="qb-choice__tick">✓</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="qb-card__footer">
                                            <span className="qb-author">
                                                👤 {q.author_name || q.author_username || 'Ẩn danh'}
                                            </span>
                                            <span className="qb-stats">
                                                <span className="qb-stat qb-stat--correct">✓ {correctChoices.length} đúng</span>
                                                <span className="qb-stat qb-stat--wrong">✗ {wrongChoices.length} sai</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="pagination">
                    <span className="pagination-info">Hiển thị {questions.length} câu hỏi</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
