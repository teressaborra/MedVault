// API utility for handling JWT authentication
const API_BASE_URL = 'http://localhost:8080/api';

// Get the stored JWT token
export const getToken = () => {
    return localStorage.getItem('mv_jwt_token');
};

// Set the JWT token
export const setToken = (token) => {
    localStorage.setItem('mv_jwt_token', token);
};

// Remove the JWT token
export const removeToken = () => {
    localStorage.removeItem('mv_jwt_token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
        // Decode the token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch (e) {
        return false;
    }
};

// Get user info from token
export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            userId: payload.userId,
            email: payload.sub,
            role: payload.role,
            identificationId: payload.identificationId
        };
    } catch (e) {
        return null;
    }
};

// Create headers with JWT token
export const getAuthHeaders = () => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

// Authenticated fetch wrapper
export const authFetch = async (url, options = {}) => {
    const headers = {
        ...getAuthHeaders(),
        ...options.headers,
    };
    
    const response = await fetch(url.startsWith('http') ? url : `${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });
    
    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
        removeToken();
        localStorage.removeItem('mv_current_user');
        window.location.href = '/';
    }
    
    return response;
};

// Login function
export const login = async (email, password, role) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
        setToken(data.token);
    }
    
    return data;
};

// Logout function
export const logout = () => {
    removeToken();
    localStorage.removeItem('mv_current_user');
    window.location.href = '/';
};

const authService = {
    getToken,
    setToken,
    removeToken,
    isAuthenticated,
    getUserFromToken,
    getAuthHeaders,
    authFetch,
    login,
    logout,
};

export default authService;
