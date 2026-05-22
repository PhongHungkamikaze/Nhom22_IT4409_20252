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

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Ngân hàng câu hỏi</h1>
                    <p className="admin-subtitle">Quản lý kho câu hỏi hệ thống.</p>
                </div>
                <button className="primary-btn">
                    <span className="btn-icon">📝</span> Thêm câu hỏi
                </button>
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

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Nội dung câu hỏi</th>
                                <th>Giáo viên</th>
                                <th>Loại</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4">Đang tải câu hỏi...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="4" style={{ color: 'red' }}>Lỗi: {error}</td></tr>
                            ) : questions.length > 0 ? (
                                questions.map(q => (
                                    <tr key={q.id}>
                                        <td>
                                            <div className="question-text">{q.content}</div>
                                        </td>
                                        <td>{q.author_name || q.author || '-'}</td>
                                        <td>{q.type}</td>
                                        <td>
                                            <div className="action-group">
                                                <button className="text-btn">Chi tiết</button>
                                                <button className="text-btn danger">Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4">Không tìm thấy câu hỏi nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

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
