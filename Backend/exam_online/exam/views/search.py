from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import Quiz, FileSet


@extend_schema(
    tags=["Search"],
    parameters=[
        OpenApiParameter(name="q", description="Search keyword", required=True, type=str),
        OpenApiParameter(name="type", description="Search type: quiz, file, user", required=False, type=str),
    ],
    description="Search across quizzes, filesets, and users",
)
class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        search_type = request.query_params.get("type")

        if not q:
            return Response(
                {"detail": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = {}
        user = request.user

        if not search_type or search_type == "quiz":
            quizzes = Quiz.objects.filter(
                Q(title__icontains=q) | Q(description__icontains=q)
            )
            if user.role == "student":
                quizzes = quizzes.filter(is_published=True)
            results["quizzes"] = list(
                quizzes.values("id", "title", "description")[:20]
            )

        if not search_type or search_type == "file":
            files = FileSet.objects.filter(name__icontains=q)
            if user.role != "admin":
                files = files.filter(uploaded_by=user)
            results["files"] = list(files.values("id", "name", "file")[:20])

        if (not search_type or search_type == "user") and user.role == "admin":
            from ..models import User

            users = User.objects.filter(
                Q(username__icontains=q) | Q(email__icontains=q)
            )
            results["users"] = list(
                users.values("id", "username", "email")[:20]
            )

        total = sum(len(v) for v in results.values())
        return Response({"query": q, "results": results, "total": total})
