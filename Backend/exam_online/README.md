# Exam Online Backend

Hệ thống quản lý thi trực tuyến - Backend (Django).

## Cấu hình Môi trường

Đảm bảo bạn đã cài đặt và khởi động Redis server:
```bash
# Ubuntu/Linux
sudo apt-get install redis-server
sudo service redis-server start

# Kiểm tra redis (phải trả về PONG)
redis-cli ping
```

## Chạy Ứng dụng

### 1. Chạy Django Web Server
```bash
python manage.py runserver
```

### 2. Chạy Celery Worker (Xử lý thông báo và chấm điểm)
Đây là lệnh để chạy luồng xử lý các tác vụ nền như gửi thông báo vi phạm:
```bash
celery -A exam_online.celery_tasks worker -l info
```

## Các tính năng chính
- Quản lý bộ đề và câu hỏi.
- Theo dõi vi phạm phòng thi qua WebSocket.
- Hệ thống thông báo tự động cho giáo viên qua Celery.
- Chấm điểm tự động.
