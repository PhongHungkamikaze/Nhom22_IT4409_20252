/**
 * Giải mã payload của JWT token mà không cần thư viện bên ngoài.
 * @param {string} token - JWT token cần giải mã.
 * @returns {object|null} - Payload của token hoặc null nếu lỗi.
 */
export const decodeToken = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);
        console.log("JWT Payload:", payload);
        return payload;
    } catch (error) {
        console.error("Failed to decode JWT token:", error);
        return null;
    }
};

/**
 * Lấy User ID từ token.
 */
export const getUserIdFromToken = (token) => {
    const payload = decodeToken(token);
    return payload ? payload.user_id : null;
};
