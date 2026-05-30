import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import QuickSystem from '../../components/Teacher/QuickSystem/QuickSystem';
import Pagination from '../../components/common/Pagination';
import './Teacher.css';

export default function TeacherFiles() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const fetchFiles = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = { page, page_size: pageSize };
            const data = await apiService.getFiles(params);
            if (data.results) {
                setFiles(data.results);
                setTotalCount(data.count);
            } else {
                setFiles(Array.isArray(data) ? data : []);
                setTotalCount(Array.isArray(data) ? data.length : 0);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to load files', err);
            setError('Không thể tải danh sách tài liệu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(1);
    }, []);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchFiles(newPage);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            await apiService.uploadFile({ name: file.name, file });
            toast.success('Tải lên tài liệu thành công!');
            fetchFiles(1);
        } catch (err) {
            console.error('Upload failed', err);
            toast.error('Tải lên thất bại.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
        try {
            await apiService.deleteFile(id);
            setFiles(files => files.filter(f => f.id !== id));
            setTotalCount(prev => prev - 1);
            toast.success('Xóa tài liệu thành công!');
        } catch (err) {
            console.error('Delete failed', err);
            toast.error('Xóa tài liệu thất bại.');
        }
    };

    const getFileUrl = (file) => {
        if (file.file?.startsWith('http')) return file.file;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
        return `${baseUrl}${file.file}`;
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="admin-container">
            <QuickSystem />
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Tài liệu của tôi</h1>
                    <p className="admin-subtitle">Quản lý tài liệu, file bạn đã tải lên.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                        id="file-upload-input"
                    />
                    <button className="primary-btn" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                        {uploading ? 'Đang tải...' : '+ Tải lên tài liệu'}
                    </button>
                </div>
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
                                        <th>Tên tài liệu</th>
                                        <th>File</th>
                                        <th>Ngày tải</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map(file => (
                                        <tr key={file.id}>
                                            <td>{file.id}</td>
                                            <td><strong>{file.name}</strong></td>
                                            <td>
                                                <a href={getFileUrl(file)} target="_blank" rel="noopener noreferrer" className="text-btn" style={{ fontSize: '0.85rem' }}>
                                                    📥 Tải xuống
                                                </a>
                                            </td>
                                            <td>{file.created_at ? new Date(file.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                                            <td>
                                                <div className="action-group">
                                                    <button className="text-btn danger" onClick={() => handleDelete(file.id)}>Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {files.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="empty-state">Bạn chưa tải lên tài liệu nào.</td>
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
                                itemLabel="tài liệu"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
