import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';

export default function MyQuizzes() {
    const [searchTerm, setSearchTerm] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const fetchQuizzes = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                ordering: ordering,
                page: page,
                page_size: pageSize,
            };
            if (publishedFilter === 'published') params.is_published = true;
            if (publishedFilter === 'draft') params.is_published = false;
            if (subjectFilter.length > 0) params.subject__in = subjectFilter.join(',');
            if (teacherFilter.length > 0) params.author__in = teacherFilter.join(',');

            const data = await apiService.getQuizzes(params);
            if (data.results) {
                setQuizzes(data.results);
                setTotalCount(data.count);
            } else {
                setQuizzes(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
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
        const handleClickOutside = (event) => {
            if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target)) {
                setIsTeacherDropdownOpen(false);
            }
            if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
                setIsSubjectDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchFilters();
    }, []);

    const teacherFilterString = teacherFilter.join(',');
    const subjectFilterString = subjectFilter.join(',');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchQuizzes(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, publishedFilter, subjectFilterString, teacherFilterString, ordering]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchQuizzes(newPage);
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = (totalCount > currentPage * pageSize) || (quizzes.length === pageSize);

    return (

        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Quản lý bài thi</h1>
                    <p className="admin-subtitle">Xem và quản lý tất cả các bài thi trên hệ thống.</p>
                </div>
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
                            <option value="draft">Chưa xuất bản</option>
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
                                            onChange={() => { }}
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
                                                    onChange={() => { }}
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
                        <select className="filter-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                            <option value="-created_at">Mới nhất</option>
                            <option value="created_at">Cũ nhất</option>
                            <option value="title">Tiêu đề A-Z</option>
                            <option value="time_limit">Thời gian tăng dần</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Môn học</th>
                                <th>Giáo viên</th>
                                <th>Ngày tạo</th>
                                <th>Thời gian (phút)</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8">Loading quizzes...</td></tr>
                            ) : quizzes.length > 0 ? (
                                quizzes.map(quiz => {
                                    const authorName = quiz.author_name || (quiz.author && quiz.author.username) || String(quiz.author || '');
                                    return (
                                        <tr key={quiz.id}>
                                            <td>{quiz.id}</td>
                                            <td>{quiz.title}</td>
                                            <td>{quiz.subject_name || '-'}</td>
                                            <td>{authorName || '-'}</td>
                                            <td>{quiz.created_at ? new Date(quiz.created_at).toLocaleString() : 'No date'}</td>
                                            <td>{quiz.time_limit ?? '-'}</td>
                                            <td>
                                                {quiz.is_published ? "Đã xuất bản" : "Chưa xuất bản"}
                                            </td>
                                            <td>
                                                <div className="action-group">
                                                    <Link to={`/admin/quizzes/${quiz.id}`} className="text-btn">Chi tiết</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="8">Không tìm thấy bài thi nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalCount > 0 && (
                    <div className="pagination">
                        <span className="pagination-info">Hiển thị {quizzes.length} trên tổng số {totalCount} bài thi</span>
                        <div className="pagination-controls">
                            <button
                                className="page-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </button>

                            {Array.from({ length: totalPages }).map((_, index) => {
                                const pageNum = index + 1;
                                if (totalPages > 7) {
                                    if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 2) {
                                        if (Math.abs(pageNum - currentPage) === 3) return <span key={pageNum}>...</span>;
                                        return null;
                                    }
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                className="page-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!hasNextPage}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
