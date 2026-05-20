import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import './Admin.css';

export default function AddUser() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await apiService.createUser(formData);
            toast.success('Thêm người dùng mới thành công!');
            navigate('/admin/users');
        } catch (err) {
            console.error('Create failed', err);
            const errorData = err.response?.data;
            let msg = 'Thêm người dùng thất bại. Vui lòng thử lại.';
            if (errorData) {
                const firstError = Object.values(errorData)[0];
                msg = Array.isArray(firstError) ? firstError[0] : firstError;
            }
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Thêm người dùng mới</h1>
                    <p className="admin-subtitle">Tạo tài khoản mới cho hệ thống.</p>
                </div>
                <button className="text-btn" onClick={() => navigate('/admin/users')}>Quay lại</button>
            </header>

            <div className="admin-card">
                {error && (
                    <div className="error-message" style={{ 
                        marginBottom: '20px', 
                        padding: '10px', 
                        backgroundColor: '#fee2e2', 
                        color: '#b91c1c', 
                        borderRadius: '4px' 
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tên đăng nhập *</label>
                        <input 
                            type="text" 
                            className="filter-select" 
                            style={{ width: '100%', padding: '10px' }}
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email *</label>
                        <input 
                            type="email" 
                            className="filter-select" 
                            style={{ width: '100%', padding: '10px' }}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mật khẩu *</label>
                        <input 
                            type="password" 
                            className="filter-select" 
                            style={{ width: '100%', padding: '10px' }}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Họ</label>
                            <input 
                                type="text" 
                                className="filter-select" 
                                style={{ width: '100%', padding: '10px' }}
                                value={formData.first_name}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tên</label>
                            <input 
                                type="text" 
                                className="filter-select" 
                                style={{ width: '100%', padding: '10px' }}
                                value={formData.last_name}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vai trò</label>
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
                            {saving ? 'Đang tạo...' : 'Thêm người dùng'}
                        </button>
                        <button type="button" className="text-btn" onClick={() => navigate('/admin/users')}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
