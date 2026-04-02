# exam_online/exam/views/search.py

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from ..models import Quiz, FileSet, User
from ..serializers import QuizSerializer, FileSetSerializer, UserSerializer


class SearchView(APIView):
    """
    API tìm kiếm tổng hợp trên nhiều model.

    Endpoint:  GET /search/?q=<từ_khóa>
    Tham số:
      - q     (bắt buộc) : từ khóa tìm kiếm
      - type  (tuỳ chọn) : giới hạn kết quả theo loại ("quiz" | "file" | "user")
                           Mặc định trả về tất cả.

    Trả về:
      {
        "query": "từ_khóa",
        "results": {
          "quizzes":   [...],
          "files":     [...],
          "users":     [...]   ← chỉ admin mới thấy mục này
        },
        "total": <tổng số kết quả>
      }
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        filter_type = request.query_params.get("type", "all").lower()

        if not query:
            return Response(
                {"detail": "Query parameter 'q' is required."},
                status=400,
            )

        results = {}

        # --- Tìm trong Quiz ---
        if filter_type in ("all", "quiz"):
            quizzes = Quiz.objects.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            ).select_related("author")
            results["quizzes"] = QuizSerializer(quizzes, many=True).data

        # --- Tìm trong FileSet (chỉ file của chính user, trừ admin) ---
        if filter_type in ("all", "file"):
            file_qs = FileSet.objects.filter(name__icontains=query)
            if not request.user.is_staff:
                file_qs = file_qs.filter(uploaded_by=request.user)
            results["files"] = FileSetSerializer(
                file_qs, many=True, context={"request": request}
            ).data

        # --- Tìm trong User (chỉ admin) ---
        if filter_type in ("all", "user") and request.user.is_staff:
            users = User.objects.filter(
                Q(username__icontains=query)
                | Q(email__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
            )
            results["users"] = UserSerializer(users, many=True).data

        total = sum(len(v) for v in results.values())

        return Response({"query": query, "results": results, "total": total})
