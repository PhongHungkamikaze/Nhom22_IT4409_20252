class PermissionMixin:
    permission_classes_by_action = {}
    permission_classes_by_method = {}

    def get_permissions(self):
        # Viewset
        action = getattr(self, "action", None)
        if action and action in self.permission_classes_by_action:
            self.permission_classes = self.permission_classes_by_action[action]
        # API View
        request = getattr(self, "request", None)
        method = request.method.upper() if request else None
        if method and method in self.permission_classes_by_method:
            self.permission_classes = self.permission_classes_by_method[method]
        return super().get_permissions()
