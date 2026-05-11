import { useAuthStore } from '../store/auth';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { API_BASE_URL } from './constants';

// ── Cookie helpers ────────────────────────────────────────────────────────────

const isSecure = () => window.location.protocol === 'https:';

function setCookie(name, value, days) {
    Cookies.set(name, value, { expires: days, secure: isSecure(), sameSite: 'lax' });
}

// ── Public auth functions ─────────────────────────────────────────────────────

export const login = async (email, password) => {
    try {
        const { data, status } = await axios.post(`${API_BASE_URL}user/token/`, { email, password });
        if (status === 200) {
            setAuthUser(data.access, data.refresh);

            // Move Redis guest wishlist → user's DB wishlist
            const userId = jwtDecode(data.access)?.user_id;
            if (userId) {
                const { mergeGuestWishlist } = await import('../views/plugin/AddToWishlist');
                await mergeGuestWishlist(userId);
            }

            return { data, error: null };
        }
    } catch (error) {
        return {
            data: null,
            error: error.response?.data?.detail || 'Something went wrong on login',
        };
    }
};

export const register = async (full_name, email, phone, password, password2) => {
    try {
        const { data } = await axios.post(`${API_BASE_URL}user/register/`, {
            full_name, email, phone, password, password2,
        });
        await login(email, password);
        return { data, error: null };
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.detail ||
            (typeof errorData === 'object'
                ? Object.entries(errorData)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join(' | ')
                : null) ||
            'Something went wrong on registration';
        return { data: null, error: errorMessage };
    }
};

export const logout = async () => {
    const refreshToken = Cookies.get('refresh_token');

    // Blacklist the refresh token server-side so it can't be reused
    if (refreshToken) {
        try {
            await axios.post(`${API_BASE_URL}user/logout/`, { refresh: refreshToken });
        } catch {
            // ignore — clear local session regardless
        }
    }

    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    useAuthStore.getState().setUser(null);
};

// Called on app boot (MainWrapper) to restore session from cookies
export const setUser = async () => {
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');

    if (!accessToken && !refreshToken) return;

    if (isAccessTokenExpired(accessToken)) {
        if (!refreshToken) {
            // Both gone — clear state
            useAuthStore.getState().setUser(null);
            return;
        }
        try {
            const { data } = await axios.post(`${API_BASE_URL}user/token/refresh/`, {
                refresh: refreshToken,
            });
            setAuthUser(data.access, data.refresh || refreshToken);
        } catch {
            // Refresh token also expired or blacklisted
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            useAuthStore.getState().setUser(null);
        }
    } else {
        setAuthUser(accessToken, refreshToken);
    }
};

export const setAuthUser = (access_token, refresh_token) => {
    setCookie('access_token', access_token, 1);   // 1 day
    setCookie('refresh_token', refresh_token, 7); // 7 days

    const user = jwtDecode(access_token) ?? null;
    if (user) useAuthStore.getState().setUser(user);
    useAuthStore.getState().setLoading(false);
};

export const getRefreshToken = async () => {
    const refresh_token = Cookies.get('refresh_token');
    const { data } = await axios.post(`${API_BASE_URL}user/token/refresh/`, {
        refresh: refresh_token,
    });
    return data;
};

export const isAccessTokenExpired = (accessToken) => {
    if (!accessToken) return true;
    try {
        const { exp } = jwtDecode(accessToken);
        return Date.now() >= exp * 1000;
    } catch {
        return true;
    }
};
