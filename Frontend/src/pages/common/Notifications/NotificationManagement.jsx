import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';
import { 
  FiBell, FiCheckCircle, FiTrash2, FiClock, FiInfo, 
  FiFilter, FiRefreshCw, FiMoreVertical 
} from 'react-icons/fi';
import './Notifications.css';

const NotificationManagement = ({ role }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: 15,
      };
      if (filter === 'unread') params.is_read = false;
      if (filter === 'read') params.is_read = true;

      const data = await apiService.getNotifications(params);
      setNotifications(data.results || []);
      setTotalPages(Math.ceil(data.count / 15) || 1);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filter]);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleMarkAsRead = async () => {
    if (selectedIds.length === 0) return;
    try {
      await apiService.markNotificationsRead(selectedIds);
      setNotifications(prev => prev.map(n => 
        selectedIds.includes(n.id) ? { ...n, is_read: true } : n
      ));
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} thông báo đã chọn?`)) return;
    try {
      await apiService.markNotificationsDeleted(selectedIds);
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'EXAM_VIOLATION': return <FiInfo className="notif-type-icon violation" />;
      case 'QUIZ_PUBLISHED': return <FiCheckCircle className="notif-type-icon success" />;
      case 'SYSTEM_ALERT': return <FiInfo className="notif-type-icon info" />;
      default: return <FiBell className="notif-type-icon" />;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const renderData = (data) => {
    if (!data) return null;
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        return <span className="quiz-ref">{data}</span>;
      }
    }
    
    if (parsedData.quiz_title) {
        return <span className="quiz-ref">Quiz: {parsedData.quiz_title}</span>;
    }
    if (parsedData.reason) {
        return <span className="quiz-ref">Lý do: {parsedData.reason}</span>;
    }
    return null;
  };

  return (
    <div className="notif-mgmt-container">
      <header className="mgmt-header">
        <div className="title-section">
          <h1>Quản lý Thông báo {role === 'admin' ? '(Admin)' : '(Teacher)'}</h1>
          <p>Xem và quản lý lịch sử thông báo hệ thống.</p>
        </div>
        
        <div className="mgmt-actions">
          <button className="btn-refresh" onClick={fetchNotifications}>
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </header>

      <div className="mgmt-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc
          </button>
          <button 
            className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Đã đọc
          </button>
        </div>

        <div className="bulk-actions">
          {selectedIds.length > 0 && (
            <div className="selection-menu animate-in">
              <span>Đã chọn {selectedIds.length} mục</span>
              <button onClick={handleMarkAsRead} className="btn-mark-read">
                <FiCheckCircle /> Đánh dấu đã đọc
              </button>
              <button onClick={handleDelete} className="btn-delete">
                <FiTrash2 /> Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="notif-main-card">
        <table className="notif-table">
          <thead>
            <tr>
              <th className="col-check">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === notifications.length && notifications.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="col-type">Loại</th>
              <th className="col-content">Nội dung</th>
              <th className="col-role">Người nhận</th>
              <th className="col-time">Thời gian</th>
              <th className="col-status">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-loader">
                  <div className="spinner"></div>
                  <p>Đang tải thông báo...</p>
                </td>
              </tr>
            ) : notifications.length > 0 ? (
              notifications.map(n => (
                <tr key={n.id} className={!n.is_read ? 'row-unread' : ''}>
                  <td>
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(n.id)}
                      onChange={() => handleToggleSelect(n.id)}
                    />
                  </td>
                  <td className="td-type">
                    {getIcon(n.type)}
                  </td>
                  <td className="td-content">
                    <div className="content-wrapper">
                      <strong>{n.title}</strong>
                      <p>{n.content}</p>
                      {renderData(n.data)}
                    </div>
                  </td>
                  <td className="td-recipient">
                     <span className="user-pill">{n.recipient_name || `User ID: ${n.recipient}`}</span>
                  </td>
                  <td className="td-time">
                    <div className="time-wrapper">
                       <FiClock /> {formatDate(n.created_at)}
                    </div>
                  </td>
                  <td className="td-status">
                    <span className={`status-badge ${n.is_read ? 'read' : 'unread'}`}>
                      {n.is_read ? 'Đã đọc' : 'Mới'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="table-empty">
                  <FiBell size={48} />
                  <p>Không có thông báo nào phù hợp với bộ lọc.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Trở về
            </button>
            <span className="page-info">Trang {page} / {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Tiếp theo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;
