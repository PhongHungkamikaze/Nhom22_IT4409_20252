# exam_online/conftest.py
"""
Root conftest — cấu hình pytest-django.
File này phải nằm ở cùng cấp với manage.py.
"""



def pytest_configure(config):
    """Đặt DJANGO_SETTINGS_MODULE trước khi pytest thu thập test."""
    import os

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "exam_online.settings")
