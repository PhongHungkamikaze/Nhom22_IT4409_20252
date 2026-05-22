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
            setError(null);
            setSuccess(null);
            setLoading(true);
            await apiService.changePassword(
                passwordData.oldPassword,
                passwordData.newPassword,
                passwordData.confirmPassword
            );
            setSuccess('Đổi mật khẩu thành công!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to change password:', err);
            const fieldMessage =
                err?.data?.old_password?.[0] ||
                err?.data?.new_password?.[0] ||
                err?.data?.confirm_password?.[0];
            const detailMessage = err?.data?.detail;
            const fallbackMessage = 'Lỗi khi đổi mật khẩu. Kiểm tra mật khẩu cũ và thử lại.';
            setError(fieldMessage || detailMessage || fallbackMessage);
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

        setSuccess(`Cập nhật ${key} thành công!`);
        setTimeout(() => setSuccess(null), 2000);
    };

    return (
        <div className="student-page">
            {/* Hero */}
            <section className="stu-hero">
                <div className="stu-hero-content">
                    <div className="stu-hero-text">
                        <h1>Cài Đặt</h1>
                        <p>Quản lý các cài đặt tài khoản của bạn</p>
                    </div>
                </div>
            </section>

            {/* Settings Content */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div className="stu-settings-grid">
                        {/* Sidebar Tabs */}
                        <div className="stu-settings-sidebar">
                            <h3 className="stu-settings-menu-title">Menu</h3>
                            {[
                                { id: 'security', label: 'Bảo mật' },
                                { id: 'preferences', label: 'Tùy chọn' },
                                { id: 'account', label: 'Tài khoản' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`stu-settings-tab${activeTab === tab.id ? ' is-active' : ''}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Content */}
                        <div className="stu-settings-panel">
                            {/* Error Message */}
                            {error && (
                                <div className="stu-settings-alert is-error">
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="stu-settings-alert is-success">
                                    {success}
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="stu-settings-section">
                                    <h2 className="stu-settings-title">Bảo mật</h2>
                                    <form onSubmit={handleChangePassword}>
                                        {/* Old Password */}
                                        <div className="stu-settings-field">
                                            <label className="stu-label">
                                                Mật khẩu hiện tại
                                            </label>
                                            <input
                                                type="password"
                                                name="oldPassword"
                                                value={passwordData.oldPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập mật khẩu hiện tại"
                                                className="stu-input"
                                            />
                                        </div>

                                        {/* New Password */}
                                        <div className="stu-settings-field">
                                            <label className="stu-label">
                                                Mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                                className="stu-input"
                                            />
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="stu-settings-field is-last">
                                            <label className="stu-label">
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Nhập lại mật khẩu mới"
                                                className="stu-input"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`stu-action-btn stu-action-btn-primary${loading ? ' is-disabled' : ''}`}
                                        >
                                            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div className="stu-settings-section">
                                    <h2 className="stu-settings-title">Tùy chọn</h2>

                                    {/* Theme */}
                                    <div className="stu-settings-field">
                                        <label className="stu-label">Chủ đề</label>
                                        <select
                                            value={preferences.theme}
                                            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                                            className="stu-settings-select"
                                        >
                                            <option value="light">Sáng</option>
                                            <option value="dark">Tối</option>
                                            <option value="auto">Tự động</option>
                                        </select>
                                    </div>

                                    {/* Language */}
                                    <div className="stu-settings-field">
                                        <label className="stu-label">Ngôn ngữ</label>
                                        <select
                                            value={preferences.language}
                                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                            className="stu-settings-select"
                                        >
                                            <option value="vi">Tiếng Việt</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>

                                    {/* Notifications */}
                                    <div className="stu-settings-field">
                                        <label className="stu-settings-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={preferences.notifications}
                                                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                                                className="stu-settings-checkbox-input"
                                            />
                                            <span className="stu-settings-checkbox-text">Nhận thông báo</span>
                                        </label>
                                        <p className="stu-settings-help">
                                            Nhận thông báo về kết quả bài quiz
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Account Tab */}
                            {activeTab === 'account' && (
                                <div className="stu-settings-section">
                                    <h2 className="stu-settings-title">Tài khoản</h2>

                                    <div className="stu-settings-card is-danger">
                                        <h3 className="stu-settings-card-title is-danger">Khu vực nguy hiểm</h3>
                                        <p className="stu-settings-card-text">
                                            Những hành động này không thể được hoàn tác
                                        </p>

                                        <div className="stu-settings-actions">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
                                                        logout();
                                                        navigate('/login');
                                                    }
                                                }}
                                                className="stu-action-btn stu-action-btn-secondary"
                                            >
                                                Đăng xuất
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Bạn chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất!')) {
                                                        alert('Chức năng này sẽ được cập nhật. Vui lòng liên hệ support để xóa tài khoản.');
                                                    }
                                                }}
                                                className="stu-action-btn stu-settings-danger-btn"
                                            >
                                                Xóa tài khoản
                                            </button>
                                        </div>
                                    </div>

                                    <div className="stu-settings-card is-info">
                                        <h3 className="stu-settings-card-title is-info">Thông tin hỗ trợ</h3>
                                        <p className="stu-settings-card-text">
                                            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:
                                        </p>
                                        <ul className="stu-settings-list">
                                            <li>Email: support@quizmaster.com</li>
                                            <li>Điện thoại: 1900-xxxx</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Back Button */}
                            <div className="stu-settings-footer">
                                <button
                                    onClick={() => navigate('/student')}
                                    className="stu-action-btn stu-action-btn-secondary"
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
