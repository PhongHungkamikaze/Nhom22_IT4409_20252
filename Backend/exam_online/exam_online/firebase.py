import os
import firebase_admin
from firebase_admin import credentials, firestore
from django.conf import settings


_firestore_client = None


def initialize_firebase():
    global _firestore_client

    if _firestore_client:
        return _firestore_client

    if not firebase_admin._apps:
        cred_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH

        if not os.path.exists(cred_path):
            raise FileNotFoundError(
                f"Firebase Service Account file NOT FOUND at: {cred_path}"
            )

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    _firestore_client = firestore.client()
    return _firestore_client


def get_firestore_client():
    return initialize_firebase()


def sync_notification_to_firestore(notification):
    try:
        db = get_firestore_client()

        doc_ref = (
            db.collection("notifications")
            .document(str(notification.recipient_id))
            .collection("items")
            .document(str(notification.id))
        )

        doc_ref.set(
            {
                "id": notification.id,
                "title": notification.title,
                "content": notification.content,
                "type": notification.type,
                "created_at": firestore.SERVER_TIMESTAMP,
                "is_read": bool(notification.read_at),
                "data": notification.data or {},
            }
        )

        return True

    except Exception as e:
        print(f"Error syncing notification to Firestore: {e}")
        return False


def report_violation_to_firestore(
    attempt_id,
    user_id,
    teacher_id,
    reason,
):
    try:
        db = get_firestore_client()

        db.collection("violations").add(
            {
                "attempt_id": attempt_id,
                "user_id": user_id,
                "teacher_id": teacher_id,
                "reason": reason,
                "timestamp": firestore.SERVER_TIMESTAMP,
            }
        )

        return True

    except Exception as e:
        print(f"Error reporting violation to Firestore: {e}")
        return False
