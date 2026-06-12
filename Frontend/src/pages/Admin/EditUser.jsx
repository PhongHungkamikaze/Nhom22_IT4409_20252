import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import './Admin.css';

export default function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'student'
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await apiService.getUser(id);
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    role: data.role || 'student'
                });
            } catch (err) {
                console.error('Failed to fetch user', err);
                setError('Không thể tải thông tin người dùng.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await apiService.partialUpdateUser(id, formData);
            toast.success('Cập nhật người dùng thành công!');
            navigate('/admin/users');
        } catch (err) {
            console.error('Update failed', err);
            const errorData = err.response?.data || err.data;
            let msg = 'Cập nhật thất bại.';
            if (errorData) {
                if (typeof errorData === 'string') {
                    msg = errorData;
                } else {
                    msg = errorData.non_field_errors?.[0]
                        || errorData.role?.[0]
                        || errorData.detail
                        || Object.values(errorData).flat()[0]
                        || msg;
                }
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-container"><p>Đang tải...</p></div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Chỉnh sửa người dùng</h1>
                    <p className="admin-subtitle">Thay đổi thông tin tài khoản #{id}</p>
                </div>
                <button className="text-btn" onClick={() => navigate('/admin/users')}>Quay lại</button>
            </header>

            <div className="admin-card">
                {error && <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>{error}</div>}
                
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Tên đăng nhập</label>
                        <input 
                            type="text" 
                            className="filter-select" 
                            style={{ width: '100%', padding: '10px' }}
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            className="filter-select" 
                            style={{ width: '100%', padding: '10px' }}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-row" style={{ display: 'flex', gap: '20px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Họ</label>
                            <input 
                                type="text" 
                                className="filter-select" 
                                style={{ width: '100%', padding: '10px' }}
                                value={formData.first_name}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Tên</label>
                            <input 
                                type="text" 
                                className="filter-select" 
                                style={{ width: '100%', padding: '10px' }}
                                value={formData.last_name}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Vai trò</label>
                        <select 
                            className="filter-select" 
                            style={{ width: '100%', padding: '10px' }}
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="student">Học sinh</option>
                            <option value="teacher">Giáo viên</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                        <button type="submit" className="primary-btn" disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button type="button" className="text-btn" onClick={() => navigate('/admin/users')}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
