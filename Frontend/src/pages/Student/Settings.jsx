import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import './Student.css';

export default function Settings() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [activeTab, setActiveTab] = useState('security');
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [preferences, setPreferences] = useState({
        theme: localStorage.getItem('theme') || 'light',
        notifications: localStorage.getItem('notifications') !== 'false',
        language: localStorage.getItem('language') || 'vi',
    });

    // Handle password change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // UPDATE: Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setLoading(true);
            await apiService.changePassword(passwordData.oldPassword, passwordData.newPassword);
            setSuccess('✓ Đổi mật khẩu thành công!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to change password:', err);
            setError('Lỗi khi đổi mật khẩu. Kiểm tra mật khẩu cũ và thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Handle preference changes
    const handlePreferenceChange = (key, value) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);
        
        // Save to localStorage
        if (key === 'theme') localStorage.setItem('theme', value);
        if (key === 'notifications') localStorage.setItem('notifications', value);
        if (key === 'language') localStorage.setItem('language', value);
        
        setSuccess(`✓ Cập nhật ${key} thành công!`);
        setTimeout(() => setSuccess(null), 2000);
    };

    return (
        <div className="student-page">
            {/* Hero */}
            <section className="stu-hero">
                <div className="stu-hero-content">
                    <div className="stu-hero-text">
                        <h1>⚙️ Cài Đặt</h1>
                        <p>Quản lý các cài đặt tài khoản của bạn</p>
                    </div>
                </div>
            </section>

            {/* Settings Content */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div style={{
                        maxWidth: '900px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: '250px 1fr',
                        gap: '2rem'
                    }}>
                        {/* Sidebar Tabs */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '1rem',
                            height: 'fit-content',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Menu</h3>
                            {[
                                { id: 'security', label: '🔒 Bảo mật', icon: '🔒' },
                                { id: 'preferences', label: '⚙️ Tùy chọn', icon: '⚙️' },
                                { id: 'account', label: '📱 Tài khoản', icon: '📱' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        marginBottom: '0.5rem',
                                        backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
                                        color: activeTab === tab.id ? 'white' : '#333',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Content */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '2rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {/* Error Message */}
                            {error && (
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#fee',
                                    color: '#c33',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#efe',
                                    color: '#3c3',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    {success}
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 style={{ marginTop: 0 }}>🔒 Bảo Mật</h2>
                                    <form onSubmit={handleChangePassword}>
                                        {/* Old Password */}
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{
                                                display: 'block',
                                                fontWeight: 'bold',
                                                marginBottom: '0.5rem',
                                                color: '#333'
                                            }}>
                                                Mật khẩu hiện tại
                                            </label>
                                            <input
                                                type="password"
                                                name="oldPassword"
                                                value={passwordData.oldPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập mật khẩu hiện tại"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ddd',
                                                    fontFamily: 'inherit',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        {/* New Password */}
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{
                                                display: 'block',
                                                fontWeight: 'bold',
                                                marginBottom: '0.5rem',
                                                color: '#333'
                                            }}>
                                                Mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ddd',
                                                    fontFamily: 'inherit',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        {/* Confirm Password */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <label style={{
                                                display: 'block',
                                                fontWeight: 'bold',
                                                marginBottom: '0.5rem',
                                                color: '#333'
                                            }}>
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập lại mật khẩu mới"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ddd',
                                                    fontFamily: 'inherit',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                padding: '10px 30px',
                                                backgroundColor: loading ? '#ccc' : '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {loading ? '⏳ Đang cập nhật...' : '✓ Đổi mật khẩu'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div>
                                    <h2 style={{ marginTop: 0 }}>⚙️ Tùy Chọn</h2>

                                    {/* Theme */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontWeight: 'bold',
                                            marginBottom: '0.5rem',
                                            color: '#333'
                                        }}>
                                            🎨 Chủ đề
                                        </label>
                                        <select
                                            value={preferences.theme}
                                            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                                            style={{
                                                padding: '10px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                fontFamily: 'inherit',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="light">☀️ Sáng</option>
                                            <option value="dark">🌙 Tối</option>
                                            <option value="auto">🔄 Tự động</option>
                                        </select>
                                    </div>

                                    {/* Language */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontWeight: 'bold',
                                            marginBottom: '0.5rem',
                                            color: '#333'
                                        }}>
                                            🌐 Ngôn ngữ
                                        </label>
                                        <select
                                            value={preferences.language}
                                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                            style={{
                                                padding: '10px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                fontFamily: 'inherit',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="vi">Tiếng Việt</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>

                                    {/* Notifications */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={preferences.notifications}
                                                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                                                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 'bold', color: '#333' }}>
                                                🔔 Nhận thông báo
                                            </span>
                                        </label>
                                        <p style={{ fontSize: '0.9rem', color: '#999', margin: '0.5rem 0 0 28px' }}>
                                            Nhập thông báo về kết quả bài quiz
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Account Tab */}
                            {activeTab === 'account' && (
                                <div>
                                    <h2 style={{ marginTop: 0 }}>📱 Tài Khoản</h2>

                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '6px',
                                        marginBottom: '2rem',
                                        borderLeft: '4px solid #dc3545'
                                    }}>
                                        <h3 style={{ marginTop: 0, color: '#dc3545' }}>⚠️ Khu vực Nguy Hiểm</h3>
                                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                                            Những hành động này không thể được hoàn tác
                                        </p>

                                        <button
                                            onClick={() => {
                                                if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
                                                    logout();
                                                    navigate('/login');
                                                }
                                            }}
                                            style={{
                                                padding: '10px 30px',
                                                backgroundColor: '#ffc107',
                                                color: '#333',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                marginRight: '1rem'
                                            }}
                                        >
                                            🚪 Đăng xuất
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (window.confirm('Bạn chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất!')) {
                                                    alert('Chức năng này sẽ được cập nhật. Vui lòng liên hệ support để xóa tài khoản.');
                                                }
                                            }}
                                            style={{
                                                padding: '10px 30px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            🗑️ Xóa Tài Khoản
                                        </button>
                                    </div>

                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: '#f0f7ff',
                                        borderRadius: '6px',
                                        borderLeft: '4px solid #007bff'
                                    }}>
                                        <h3 style={{ marginTop: 0, color: '#007bff' }}>ℹ️ Thông Tin Hỗ Trợ</h3>
                                        <p style={{ color: '#666' }}>
                                            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:
                                        </p>
                                        <ul style={{ color: '#666' }}>
                                            <li>📧 Email: support@quizmaster.com</li>
                                            <li>📞 Điện thoại: 1900-xxxx</li>
                                            <li>💬 Chat: Trên trang web</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Back Button */}
                            <div style={{ marginTop: '2rem' }}>
                                <button
                                    onClick={() => navigate('/student')}
                                    style={{
                                        padding: '10px 30px',
                                        backgroundColor: '#e0e0e0',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ← Quay lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
