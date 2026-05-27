import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import QuickSystem from '../../components/Admin/QuickSystem/QuickSystem';
import './Admin.css';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState({ name: '', description: '' });
    const [isEdit, setIsEdit] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const fetchSubjects = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                page_size: pageSize,
            };
            const data = await apiService.getSubjects(params);
            if (data.results) {
                setSubjects(data.results);
                setTotalCount(data.count);
            } else {
                setSubjects(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to load subjects', err);
            setError('Không thể tải danh sách môn học.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects(1);
    }, []);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchSubjects(newPage);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) return;
        try {
            await apiService.deleteSubject(id);
            setSubjects(subjects.filter(s => s.id !== id));
            setTotalCount(prev => prev - 1);
            toast.success('Xóa môn học thành công!');
        } catch (err) {
            console.error('Delete failed', err);
            toast.error('Xóa môn học thất bại.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await apiService.updateSubject(currentSubject.id, currentSubject);
                toast.success('Cập nhật môn học thành công!');
            } else {
                await apiService.createSubject(currentSubject);
                toast.success('Thêm mới môn học thành công!');
            }
            setIsModalOpen(false);
            fetchSubjects(currentPage);
        } catch (err) {
            console.error('Save failed', err);
            toast.error('Thao tác thất bại.');
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = (totalCount > currentPage * pageSize) || (subjects.length === pageSize);

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
                    <>
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
                                            <td>
                                                <div className="action-group">
                                                    <button className="text-btn" onClick={() => openEditModal(subject)}>Sửa</button>
                                                    <button className="text-btn danger" onClick={() => handleDelete(subject.id)}>Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {subjects.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="empty-state">Không có môn học nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalCount > 0 && (
                            <div className="pagination">
                                <span className="pagination-info">Hiển thị {subjects.length} trên tổng số {totalCount} môn học</span>
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
                    </>
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
                                    onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Mô tả</label>
                                <textarea
                                    className="filter-select"
                                    style={{ width: '100%', padding: '10px', height: '100px' }}
                                    value={currentSubject.description || ''}
                                    onChange={(e) => setCurrentSubject({ ...currentSubject, description: e.target.value })}
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
