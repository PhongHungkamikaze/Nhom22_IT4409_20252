import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Teacher.css';
import '../Admin/Admin.css';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';

export default function QuestionBank() {
    const [searchTerm, setSearchTerm] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const [ordering, setOrdering] = useState('-id');
    const [typeFilter, setTypeFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState([]);
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const subjectDropdownRef = useRef(null);
    const [teacherFilter, setTeacherFilter] = useState([]);
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
    const teacherDropdownRef = useRef(null);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const fetchQuestions = async (page = currentPage) => {
        try {
            setLoading(true);
            const params = {
                search: searchTerm,
                ordering: ordering,
                page: page,
                page_size: pageSize
            };
            if (typeFilter !== 'all') params.type = typeFilter;
            if (subjectFilter.length > 0) params.subject__in = subjectFilter.join(',');
            if (teacherFilter.length > 0) params.author__in = teacherFilter.join(',');
            const data = await apiService.getQuestions(params);
            console.log("data >>>", data)
            if (data.results) {
                setQuestions(data.results);
                setTotalCount(data.count);
            } else {
                setQuestions(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
            setError(null);
        } catch (err) {
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

    useEffect(() => { fetchFilters(); }, []);

    // click‑outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
                setIsSubjectDropdownOpen(false);
            }
            if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target)) {
                setIsTeacherDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const subjectFilterString = subjectFilter.join(',');
    const teacherFilterString = teacherFilter.join(',');
    useEffect(() => {
        const t = setTimeout(() => {
            setCurrentPage(1);
            fetchQuestions(1);
        }, 500);
        return () => clearTimeout(t);
    }, [searchTerm, typeFilter, subjectFilterString, teacherFilterString, ordering]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchQuestions(newPage);
    };

    const isAuthor = (q) => {
        if (!user) return false;
        const uid = user.id || user.user_id || user.pk;
        if (q.author === uid || q.author_id === uid || String(q.author) === String(uid)) return true;
        if (q.author_username && user.username && q.author_username === user.username) return true;
        if (q.author_name && (q.author_name === user.username || q.author_name === `${user.first_name} ${user.last_name}`)) return true;
        return false;
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa câu hỏi này?')) return;
        try {
            await apiService.deleteQuestion(id);
            setQuestions(prev => prev.filter(q => q.id !== id));
            setTotalCount(prev => prev - 1);
        } catch {
            alert('Không thể xóa câu hỏi.');
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    const typeLabel = (t) => t === 'single' ? 'Một lựa chọn' : t === 'multiple' ? 'Nhiều lựa chọn' : t;
    const typeColor = (t) => t === 'single' ? 'qb-badge--single' : 'qb-badge--multiple';

    return (
        <div className="admin-container">
            <QuickSystem />

            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Question Bank</h1>
                    <p className="admin-subtitle">Organize and manage the repository of your exam questions.</p>
                </div>
                <div className="header-buttons-group">
                    <Link to="/teacher/questions/import" style={{ textDecoration: 'none' }}>
                        <button className="primary-btn">📚 Nhập &amp; Tạo Câu Hỏi</button>
                    </Link>
                    <Link to="/teacher/questions/add" style={{ textDecoration: 'none' }}>
                        <button className="primary-btn">📝 Thêm Câu Hỏi</button>
                    </Link>
                </div>
            </header>

            <div className="admin-card">
                {/* Controls */}
                <div className="table-controls">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="all">Tất cả loại câu</option>
                            <option value="single">Một lựa chọn</option>
                            <option value="multiple">Nhiều lựa chọn</option>
                        </select>
                        <div className={`multi-select-container ${isSubjectDropdownOpen ? 'open' : ''}`} ref={subjectDropdownRef}>
                            <div
                                className="filter-select multi-select-trigger"
                                onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                            >
                                <span>{subjectFilter.length === 0 ? 'Tất cả môn học' : `Môn học (${subjectFilter.length})`}</span>
                                <span className="multi-select-arrow">▼</span>
                            </div>
                            {isSubjectDropdownOpen && (
                                <div className="multi-select-dropdown">
                                    <div className="multi-select-option" onClick={() => setSubjectFilter([])}>
                                        <input type="checkbox" checked={subjectFilter.length === 0} onChange={() => { }} />
                                        <span>Tất cả môn học</span>
                                    </div>
                                    {subjects.map(s => {
                                        const isChecked = subjectFilter.includes(s.id);
                                        return (
                                            <div key={s.id} className="multi-select-option" onClick={() => {
                                                if (isChecked) {
                                                    setSubjectFilter(subjectFilter.filter(id => id !== s.id));
                                                } else {
                                                    setSubjectFilter([...subjectFilter, s.id]);
                                                }
                                            }}>
                                                <input type="checkbox" checked={isChecked} onChange={() => { }} />
                                                <span>{s.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className={`multi-select-container ${isTeacherDropdownOpen ? 'open' : ''}`} ref={teacherDropdownRef}>
                            <div
                                className="filter-select multi-select-trigger"
                                onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                            >
                                <span>
                                    {teacherFilter.length === 0
                                        ? 'Tất cả giáo viên'
                                        : `Giáo viên (${teacherFilter.length})`}
                                </span>
                                <span className="multi-select-arrow">▼</span>
                            </div>
                            {isTeacherDropdownOpen && (
                                <div className="multi-select-dropdown">
                                    <div
                                        className="multi-select-option"
                                        onClick={() => setTeacherFilter([])}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={teacherFilter.length === 0}
                                            onChange={() => { }}
                                        />
                                        <span>Tất cả giáo viên</span>
                                    </div>
                                    {teachers.map(t => {
                                        const isChecked = teacherFilter.includes(t.id);
                                        return (
                                            <div
                                                key={t.id}
                                                className="multi-select-option"
                                                onClick={() => {
                                                    if (isChecked) {
                                                        setTeacherFilter(teacherFilter.filter(id => id !== t.id));
                                                    } else {
                                                        setTeacherFilter([...teacherFilter, t.id]);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => { }}
                                                />
                                                <span>{t.username}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <select className="filter-select" value={ordering} onChange={e => setOrdering(e.target.value)}>
                            <option value="-id">Mới nhất</option>
                            <option value="id">Cũ nhất</option>
                            <option value="content">Nội dung A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
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
                    <>
                        <div className="qb-list">
                            {questions.map((q, idx) => {
                                const canEdit = isAuthor(q);
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
                                                    <span className="qb-index">#{(currentPage - 1) * pageSize + idx + 1}</span>
                                                    <span className={`qb-badge ${typeColor(q.type)}`}>
                                                        {q.type === 'single' ? '◉' : '☑'} {typeLabel(q.type)}
                                                    </span>
                                                    {q.subject_name && (
                                                        <span className="qb-subject">📖 {q.subject_name}</span>
                                                    )}
                                                </div>
                                                <div className="qb-card__actions">
                                                    <Link to={`/teacher/questions/${q.id}`} className="qb-btn qb-btn--detail">
                                                        Chi tiết
                                                    </Link>
                                                    {canEdit && (
                                                        <>
                                                            <Link to={`/teacher/questions/edit/${q.id}`} className="qb-btn qb-btn--edit">
                                                                Sửa
                                                            </Link>
                                                            <button className="qb-btn qb-btn--delete" onClick={() => handleDelete(q.id)}>
                                                                Xóa
                                                            </button>
                                                        </>
                                                    )}
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

                        {totalCount > 0 && (
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                totalCount={totalCount}
                                pageSize={pageSize}
                                itemLabel="câu hỏi"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}