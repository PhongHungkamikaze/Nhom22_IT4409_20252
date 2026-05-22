import React, { useState, useEffect } from 'react';
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
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [teacherFilter, setTeacherFilter] = useState('all');
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
            if (subjectFilter !== 'all') params.subject = subjectFilter;
            if (teacherFilter !== 'all') params.author = teacherFilter;

            const data = await apiService.getQuizzes(params);
            setQuizzes(Array.isArray(data.results) ? data.results : []);
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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchQuizzes();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, publishedFilter, subjectFilter, teacherFilter, ordering]);

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

                <div className="pagination">
                    <span className="pagination-info">Hiển thị {quizzes.length} bài thi</span>
                    <div className="pagination-controls">
                        <button className="page-btn active">1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
