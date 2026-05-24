import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
    FiLock, 
    FiSliders, 
    FiUser, 
    FiKey, 
    FiSettings, 
    FiLogOut, 
    FiTrash2, 
    FiInfo, 
    FiAlertTriangle,
    FiBell,
    FiGlobe,
    FiSun
} from 'react-icons/fi';
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
    const [preferences, setPreferences] = useState({
        theme: localStorage.getItem('theme') || 'light',
        notifications: localStorage.getItem('notifications') !== 'false',
        language: localStorage.getItem('language') || 'vi',
    });

    // Handle password change inputs
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

        if (!passwordData.oldPassword) {
            toast.error('Vui lòng nhập mật khẩu hiện tại');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Xác nhận mật khẩu mới không trùng khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setLoading(true);
            await apiService.changePassword(
                passwordData.oldPassword,
                passwordData.newPassword,
                passwordData.confirmPassword
            );
            toast.success('Đổi mật khẩu thành công!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error('Failed to change password:', err);
            const fieldMessage =
                err?.data?.old_password?.[0] ||
                err?.data?.new_password?.[0] ||
                err?.data?.confirm_password?.[0];
            const detailMessage = err?.data?.detail;
            const fallbackMessage = 'Mật khẩu cũ không chính xác. Vui lòng kiểm tra lại.';
            toast.error(fieldMessage || detailMessage || fallbackMessage);
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

        const configName = key === 'theme' ? 'giao diện' : key === 'language' ? 'ngôn ngữ' : 'thông báo';
        toast.success(`Cập nhật cài đặt ${configName} thành công!`);
    };

    return (
        <div className="student-page">
            {/* Hero Header */}
            <div className="stu-dashboard-header">
                <div className="stu-container">
                    <div className="stu-welcome-row">
                        <div className="stu-welcome-left">
                            <div className="stu-header-badge">
                                <FiSettings className="stu-badge-icon" />
                                Cài Đặt Hệ Thống
                            </div>
                            <h1>Cấu hình tài khoản</h1>
                            <p>Thay đổi tùy chọn bảo mật, giao diện và thông báo theo sở thích của bạn.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Settings Section */}
            <section className="stu-quizzes-section">
                <div className="stu-container">
                    <div className="stu-settings-grid" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                        
                        {/* Sidebar Tabs */}
                        <div className="stu-settings-sidebar-premium">
                            <h3 className="stu-settings-menu-title" style={{ paddingLeft: '0.8rem', fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Danh mục
                            </h3>
                            {[
                                { id: 'security', label: 'Bảo mật & Mật khẩu', icon: <FiLock /> },
                                { id: 'preferences', label: 'Tùy chọn hiển thị', icon: <FiSliders /> },
                                { id: 'account', label: 'Tài khoản cá nhân', icon: <FiUser /> },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`stu-settings-tab-premium${activeTab === tab.id ? ' is-active' : ''}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Settings Content Panel */}
                        <div className="stu-settings-panel-premium">
                            
                            {/* SECURITY TAB */}
                            {activeTab === 'security' && (
                                <div className="stu-settings-section">
                                    <h2 className="stu-settings-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiLock style={{ color: '#4f46e5' }} /> Bảo mật tài khoản
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
                                        Đổi mật khẩu định kỳ để bảo vệ tài khoản và kết quả làm bài thi trắc nghiệm của bạn.
                                    </p>

                                    <form onSubmit={handleChangePassword} className="stu-profile-form">
                                        {/* Old Password */}
                                        <div className="stu-form-group stu-form-full-width">
                                            <label className="stu-field-label">
                                                <FiKey /> Mật khẩu hiện tại
                                            </label>
                                            <div className="stu-input-wrapper">
                                                <input
                                                    type="password"
                                                    name="oldPassword"
                                                    value={passwordData.oldPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Nhập mật khẩu đang dùng"
                                                    className="stu-input-with-icon"
                                                    required
                                                />
                                                <FiLock className="stu-input-icon" />
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div className="stu-form-group">
                                            <label className="stu-field-label">
                                                Mật khẩu mới
                                            </label>
                                            <div className="stu-input-wrapper">
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Tối thiểu 6 ký tự"
                                                    className="stu-input-with-icon"
                                                    required
                                                />
                                                <FiLock className="stu-input-icon" />
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="stu-form-group">
                                            <label className="stu-field-label">
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <div className="stu-input-wrapper">
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    className="stu-input-with-icon"
                                                    required
                                                />
                                                <FiLock className="stu-input-icon" />
                                            </div>
                                        </div>

                                        {/* Submit Action */}
                                        <div className="stu-form-actions-premium" style={{ width: '100%' }}>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="stu-btn-save-premium"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="stu-loading-spinner-btn"></span>
                                                        Đang cập nhật...
                                                    </>
                                                ) : (
                                                    'Cập nhật mật khẩu'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* PREFERENCES TAB */}
                            {activeTab === 'preferences' && (
                                <div className="stu-settings-section">
                                    <h2 className="stu-settings-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiSliders style={{ color: '#4f46e5' }} /> Tùy chọn hiển thị
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
                                        Cấu hình giao diện, ngôn ngữ hiển thị và cài đặt gửi thông báo của hệ thống.
                                    </p>

                                    <div className="stu-profile-form">
                                        {/* Theme preference */}
                                        <div className="stu-form-group stu-form-full-width">
                                            <label className="stu-field-label">
                                                <FiSun /> Giao diện hệ thống
                                            </label>
                                            <select
                                                value={preferences.theme}
                                                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                                                className="stu-settings-select"
                                                style={{ padding: '0.75rem 1rem', borderRadius: '10px', width: '100%', maxWidth: '100%', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                                            >
                                                <option value="light">Chế độ Sáng (Light Mode)</option>
                                                <option value="dark">Chế độ Tối (Dark Mode)</option>
                                                <option value="auto">Tự động (Theo hệ điều hành)</option>
                                            </select>
                                        </div>

                                        {/* Language preference */}
                                        <div className="stu-form-group stu-form-full-width">
                                            <label className="stu-field-label">
                                                <FiGlobe /> Ngôn ngữ chính
                                            </label>
                                            <select
                                                value={preferences.language}
                                                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                                className="stu-settings-select"
                                                style={{ padding: '0.75rem 1rem', borderRadius: '10px', width: '100%', maxWidth: '100%', border: '1.5px solid #cbd5e1', fontWeight: 500 }}
                                            >
                                                <option value="vi">Tiếng Việt (Vietnamese)</option>
                                                <option value="en">Tiếng Anh (English)</option>
                                            </select>
                                        </div>

                                        {/* Notifications preference */}
                                        <div className="stu-form-group stu-form-full-width" style={{ marginTop: '0.5rem' }}>
                                            <label className="stu-settings-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.notifications}
                                                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                                                    className="stu-settings-checkbox-input"
                                                />
                                                <span className="stu-settings-checkbox-text" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <FiBell /> Bật thông báo hệ thống
                                                </span>
                                            </label>
                                            <p className="stu-settings-help" style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '1.8rem', marginTop: '0.25rem' }}>
                                                Gửi thông báo đẩy về điểm số ngay sau khi hoàn thành bài thi trắc nghiệm.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ACCOUNT TAB (DANGER ZONE) */}
                            {activeTab === 'account' && (
                                <div className="stu-settings-section">
                                    <h2 className="stu-settings-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiUser style={{ color: '#4f46e5' }} /> Quản lý tài khoản
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
                                        Đăng xuất khỏi thiết bị hiện tại hoặc thực hiện xóa tài khoản vĩnh viễn khỏi hệ thống.
                                    </p>

                                    {/* Danger Zone */}
                                    <div className="stu-settings-card-premium is-danger">
                                        <h3 className="stu-settings-card-title-premium is-danger">
                                            <FiAlertTriangle /> Khu vực quan trọng
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                                            Đăng xuất sẽ xóa phiên hoạt động hiện tại của bạn. Nếu thực hiện xóa tài khoản, toàn bộ lịch sử điểm số và thông tin cá nhân sẽ biến mất vĩnh viễn và không thể phục hồi.
                                        </p>

                                        <div className="stu-settings-actions">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Bạn chắc chắn muốn đăng xuất khỏi tài khoản này?')) {
                                                        logout();
                                                        toast.success('Đăng xuất thành công');
                                                        navigate('/login');
                                                    }
                                                }}
                                                className="stu-btn-cancel-premium"
                                                style={{ border: '1.5px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                            >
                                                <FiLogOut /> Đăng xuất tài khoản
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (window.confirm('CẢNH BÁO: Bạn chắc chắn muốn xóa tài khoản này? Toàn bộ kết quả thi của bạn sẽ mất hết!')) {
                                                        toast.error('Chức năng xóa tài khoản đang được bảo trì. Vui lòng liên hệ Admin để được hỗ trợ.');
                                                    }
                                                }}
                                                className="stu-action-btn stu-settings-danger-btn"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none' }}
                                            >
                                                <FiTrash2 /> Yêu cầu xóa tài khoản
                                            </button>
                                        </div>
                                    </div>

                                    {/* Help Card */}
                                    <div className="stu-settings-card-premium is-info">
                                        <h3 className="stu-settings-card-title-premium is-info">
                                            <FiInfo /> Liên hệ hỗ trợ kỹ thuật
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                                            Nếu bạn gặp bất kỳ sự cố nào liên quan đến việc thi cử, lỗi hiển thị hoặc cần cập nhật quyền hạn tài khoản, vui lòng liên hệ:
                                        </p>
                                        <ul className="stu-settings-list" style={{ paddingLeft: '1.2rem', color: '#475569', fontSize: '0.9rem' }}>
                                            <li style={{ marginBottom: '0.4rem' }}>Email hỗ trợ: <strong>support@quizmaster.com</strong></li>
                                            <li>Hotline hỗ trợ: <strong>1900-8888 (08:00 - 18:00)</strong></li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Back Button */}
                            <div className="stu-settings-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
                                <button
                                    onClick={() => navigate('/student')}
                                    className="stu-btn-cancel-premium"
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
