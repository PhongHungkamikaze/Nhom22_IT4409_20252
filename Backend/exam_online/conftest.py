# exam_online/conftest.py
"""
Root conftest — cấu hình pytest-django.
File này phải nằm ở cùng cấp với manage.py.
"""
import os

# Dùng file SQLite riêng để tránh lock với db.sqlite3 của server
# Phải đặt TRƯỚC khi Django load settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "exam_online.settings")
os.environ["DATABASE_URL"] = "sqlite:///test_db.sqlite3"

# Tắt Celery — dùng in-process eager execution, không cần Redis
os.environ["CELERY_TASK_ALWAYS_EAGER"] = "True"
os.environ["CELERY_TASK_EAGER_PROPAGATES"] = "True"
# Dùng memory broker để tránh kết nối Redis
os.environ["REDIS_URL"] = "memory://"


def pytest_configure(config):
    """Đặt DJANGO_SETTINGS_MODULE trước khi pytest thu thập test."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "exam_online.settings")
