import React, { useState, useEffect } from 'react';
import './Admin.css';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';
import apiService from '../../services/api';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState({ name: '', description: '' });
    const [isEdit, setIsEdit] = useState(false);

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

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) return;
        try {
            await apiService.deleteSubject(id);
            setSubjects(subjects.filter(s => s.id !== id));
        } catch (err) {
            console.error('Delete failed', err);
            alert('Xóa môn học thất bại.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await apiService.updateSubject(currentSubject.id, currentSubject);
                alert('Cập nhật thành công!');
            } else {
                await apiService.createSubject(currentSubject);
                alert('Thêm mới thành công!');
            }
            setIsModalOpen(false);
            fetchSubjects();
        } catch (err) {
            console.error('Save failed', err);
            alert('Thao tác thất bại.');
        }
    };

    const openAddModal = () => {
        setCurrentSubject({ name: '', description: '' });
        setIsEdit(false);
        setIsModalOpen(true);
    };

    const openEditModal = (subject) => {
        setCurrentSubject(subject);
        setIsEdit(true);
        setIsModalOpen(true);
    };

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Quản lý môn học</h1>
                    <p className="admin-subtitle">Thêm, sửa, xóa các môn học trên hệ thống.</p>
                </div>
                <button className="primary-btn" onClick={openAddModal}>
                    <span className="btn-icon">+</span> Thêm môn học
                </button>
            </header>

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
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(subject => (
                                    <tr key={subject.id}>
                                        <td>{subject.id}</td>
                                        <td><strong>{subject.name}</strong></td>
                                        <td>{subject.description || '-'}</td>
                                        <td className="action-group">
                                            <button className="text-btn" onClick={() => openEditModal(subject)}>Sửa</button>
                                            <button className="text-btn danger" onClick={() => handleDelete(subject.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px'
                    }}>
                        <h2>{isEdit ? 'Sửa môn học' : 'Thêm môn học'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Tên môn học *</label>
                                <input 
                                    type="text" 
                                    className="filter-select" 
                                    style={{ width: '100%', padding: '10px' }}
                                    value={currentSubject.name}
                                    onChange={(e) => setCurrentSubject({...currentSubject, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Mô tả</label>
                                <textarea 
                                    className="filter-select" 
                                    style={{ width: '100%', padding: '10px', height: '100px' }}
                                    value={currentSubject.description || ''}
                                    onChange={(e) => setCurrentSubject({...currentSubject, description: e.target.value})}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="primary-btn">Lưu</button>
                                <button type="button" className="text-btn" onClick={() => setIsModalOpen(false)}>Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
