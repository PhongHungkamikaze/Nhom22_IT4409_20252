# Django Settings
SECRET_KEY=yoursecretkeyhere
DEBUG=True

# Database
DB_NAME=db.sqlite3

# Celery & Redis
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Notifications
NOTIFICATION_PURGE_AFTER_DAYS=30
