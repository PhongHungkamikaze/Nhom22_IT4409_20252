import React, { useState, useEffect } from 'react';
import './Teacher.css';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import apiService from '../../services/api';

export default function TeacherSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const data = await apiService.getSubjects();
            setSubjects(Array.isArray(data) ? data : (data.results || []));
            setError(null);
        } catch (err) {
            console.error('Failed to load subjects', err);
            setError('Không thể tải danh sách môn học.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    return (
        <div className="teacher-container">
            <QuickSystem />
            <header className="teacher-header">
                <div>
                    <h1 className="teacher-title">Danh sách môn học</h1>
                    <p className="teacher-subtitle">Xem thông tin các môn học trên hệ thống.</p>
                </div>
            </header>

            <div className="teacher-card">
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
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                            Chưa có môn học nào.
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
