import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import Pagination from '../../components/common/Pagination';
import './Teacher.css';

export default function TeacherClassGroups() {
    const navigate = useNavigate();
    const [classGroups, setClassGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGroup, setCurrentGroup] = useState({ name: '', description: '', subject: '' });
    const [isEdit, setIsEdit] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const fetchClassGroups = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = { page, page_size: pageSize };
            const data = await apiService.getClassGroups(params);
            if (data.results) {
                setClassGroups(data.results);
                setTotalCount(data.count);
            } else {
                setClassGroups(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to load class groups', err);
            setError('Không thể tải danh sách lớp học.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassGroups(1);
    }, []);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchClassGroups(newPage);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
        try {
            await apiService.deleteClassGroup(id);
            setClassGroups(groups => groups.filter(g => g.id !== id));
            setTotalCount(prev => prev - 1);
            toast.success('Xóa lớp học thành công!');
        } catch (err) {
            console.error('Delete failed', err);
            toast.error('Xóa lớp học thất bại.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { name: currentGroup.name, description: currentGroup.description };
            if (currentGroup.subject) payload.subject = currentGroup.subject;
            if (isEdit) {
                await apiService.updateClassGroup(currentGroup.id, payload);
                toast.success('Cập nhật lớp học thành công!');
            } else {
                await apiService.createClassGroup(payload);
                toast.success('Thêm lớp học thành công!');
            }
            setIsModalOpen(false);
            fetchClassGroups(currentPage);
        } catch (err) {
            console.error('Save failed', err);
            const errorData = err.response?.data || err.data;
            let msg = 'Thao tác thất bại.';
            if (errorData) {
                if (typeof errorData === 'string') msg = errorData;
                else msg = errorData.detail || Object.values(errorData).flat()[0] || msg;
            } else if (err.message) {
                msg = err.message;
            }
            toast.error(msg);
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    const openAddModal = () => {
        setCurrentGroup({ name: '', description: '', subject: '' });
        setIsEdit(false);
        setIsModalOpen(true);
    };

    const openEditModal = (group) => {
        setCurrentGroup(group);
        setIsEdit(true);
        setIsModalOpen(true);
    };

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Lớp học của tôi</h1>
                    <p className="admin-subtitle">Quản lý các lớp học, nhóm học tập của bạn.</p>
                </div>
                <button className="primary-btn" onClick={openAddModal}>
                    <span className="btn-icon">+</span> Tạo lớp học
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
                                        <th>Tên lớp</th>
                                        <th>Mô tả</th>
                                        <th>Sĩ số</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classGroups.map(group => (
                                        <tr key={group.id}>
                                            <td>{group.id}</td>
                                            <td><strong>{group.name}</strong></td>
                                            <td>{group.description || '-'}</td>
                                            <td>{group.member_count}</td>
                                            <td>
                                                <div className="action-group">
                                                    <button className="text-btn" onClick={() => navigate(`/teacher/class-groups/${group.id}`)}>Quản lý</button>
                                                    <button className="text-btn" onClick={() => openEditModal(group)}>Sửa</button>
                                                    <button className="text-btn danger" onClick={() => handleDelete(group.id)}>Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {classGroups.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="empty-state">Bạn chưa có lớp học nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalCount > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                totalCount={totalCount}
                                pageSize={pageSize}
                                itemLabel="lớp học"
                            />
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
                        <h2>{isEdit ? 'Sửa lớp học' : 'Tạo lớp học'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Tên lớp *</label>
                                <input
                                    type="text"
                                    className="filter-select"
                                    style={{ width: '100%', padding: '10px' }}
                                    value={currentGroup.name}
                                    onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Mô tả</label>
                                <textarea
                                    className="filter-select"
                                    style={{ width: '100%', padding: '10px', height: '100px' }}
                                    value={currentGroup.description || ''}
                                    onChange={(e) => setCurrentGroup({ ...currentGroup, description: e.target.value })}
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
