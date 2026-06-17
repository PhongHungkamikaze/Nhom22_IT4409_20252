import React, { useState, useEffect } from 'react';
import './Teacher.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import apiService from '../../services/api';

export default function TeacherSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [searchName, setSearchName] = useState('');
    const [sortBy, setSortBy] = useState('id');

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const data = await apiService.getSubjects();
            const list = Array.isArray(data) ? data : (data.results || []);
            setAllSubjects(list);
            setSubjects(list);
            setError(null);
        } catch (err) {
            console.error('Failed to load subjects', err);
            setError('Không thể tải danh sách môn học.');
        } finally {
            setLoading(false);
        }
    };

    // Apply filters whenever filter states or allSubjects change
    useEffect(() => {
        let filtered = [...allSubjects];
        if (searchName.trim()) {
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchName.trim().toLowerCase())
            );
        }
        if (sortBy === 'name_asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name_desc') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        }
        setSubjects(filtered);
    }, [searchName, sortBy, allSubjects]);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleResetFilters = () => {
        setSearchName('');
        setSortBy('id');
    };

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Danh sách môn học</h1>
                    <p className="admin-subtitle">Xem thông tin các môn học trên hệ thống.</p>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="admin-card" style={{ marginBottom: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="search-bar" style={{ flex: '1', minWidth: '220px' }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên môn học..."
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                        />
                    </div>
                    <div style={{ minWidth: '180px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '4px', fontWeight: 600 }}>Sắp xếp theo</label>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="id">ID (mặc định)</option>
                            <option value="name_asc">Tên A → Z</option>
                            <option value="name_desc">Tên Z → A</option>
                        </select>
                    </div>
                    <button
                        className="secondary-btn"
                        onClick={handleResetFilters}
                        style={{ height: '46px', whiteSpace: 'nowrap' }}
                    >
                        ↺ Đặt lại
                    </button>
                </div>
                {(searchName || sortBy !== 'id') && (
                    <div style={{ marginTop: '10px', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        Tìm thấy <strong style={{ color: 'var(--primary-color)' }}>{subjects.length}</strong> môn học
                    </div>
                )}
            </div>

            <div className="admin-card">
                {loading && <p style={{ padding: '20px' }}>Đang tải...</p>}
                {error && <p className="error-message" style={{ padding: '20px' }}>{error}</p>}

                {!loading && (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên môn học</th>
                                    <th>Mô tả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(subject => (
                                    <tr key={subject.id}>
                                        <td>{subject.id}</td>
                                        <td><strong>{subject.name}</strong></td>
                                        <td>{subject.description || '-'}</td>
                                    </tr>
                                ))}
                                {subjects.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="empty-state">
                                            {searchName ? 'Không tìm thấy môn học phù hợp.' : 'Chưa có môn học nào.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
