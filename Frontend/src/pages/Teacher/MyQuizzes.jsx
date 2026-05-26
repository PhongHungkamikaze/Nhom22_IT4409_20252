import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Teacher.css';
import '../Admin/Admin.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';

export default function MyQuizzes() {
    const [searchTerm, setSearchTerm] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    const [ordering, setOrdering] = useState('-created_at');
    const [publishedFilter, setPublishedFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState([]);
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const subjectDropdownRef = useRef(null);
    const [teacherFilter, setTeacherFilter] = useState([]);
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
    const teacherDropdownRef = useRef(null);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                ordering: ordering,
            };
            if (publishedFilter === 'published') params.is_published = true;
            if (publishedFilter === 'draft') params.is_published = false;
            if (subjectFilter.length > 0) params.subject__in = subjectFilter.join(',');
            if (teacherFilter.length > 0) params.author__in = teacherFilter.join(',');

            const data = await apiService.getQuizzes(params);
            setQuizzes(data.results || []);
        } catch (err) {
            console.error('Failed to fetch quizzes', err);
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
        const timeoutId = setTimeout(() => {
            fetchQuizzes();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, publishedFilter, subjectFilterString, teacherFilterString, ordering]);

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
                        <select className="filter-select" value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="draft">Bản nháp</option>
                        </select>
                        <div className={`multi-select-container ${isSubjectDropdownOpen ? 'open' : ''}`} ref={subjectDropdownRef}>
                            <div
                                className="filter-select multi-select-trigger"
                                onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                            >
                                <span>
                                    {subjectFilter.length === 0
                                        ? 'Tất cả môn học'
                                        : `Môn học (${subjectFilter.length})`}
                                </span>
                                <span className="multi-select-arrow">▼</span>
                            </div>
                            {isSubjectDropdownOpen && (
                                <div className="multi-select-dropdown">
                                    <div
                                        className="multi-select-option"
                                        onClick={() => setSubjectFilter([])}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={subjectFilter.length === 0}
                                            onChange={() => {}}
                                        />
                                        <span>Tất cả môn học</span>
                                    </div>
                                    {subjects.map(s => {
                                        const isChecked = subjectFilter.includes(s.id);
                                        return (
                                            <div
                                                key={s.id}
                                                className="multi-select-option"
                                                onClick={() => {
                                                    if (isChecked) {
                                                        setSubjectFilter(subjectFilter.filter(id => id !== s.id));
                                                    } else {
                                                        setSubjectFilter([...subjectFilter, s.id]);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}}
                                                />
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
                                            onChange={() => {}}
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
                                                    onChange={() => {}}
                                                />
                                                <span>{t.username}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <select className="filter-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                            <option value="-created_at">Mới nhất</option>
                            <option value="created_at">Cũ nhất</option>
                            <option value="title">Tiêu đề A-Z</option>
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
                            ) : quizzes.length > 0 ? (
                                quizzes.map(quiz => {
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
                                            <td>
                                                <div className="action-group">
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
                                                </div>
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
                    <span className="pagination-info">Showing {quizzes.length} quizzes</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
