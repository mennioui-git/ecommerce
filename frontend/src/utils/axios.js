import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = 'http://127.0.0.1:8000/api/v1/';

// Separate plain instance used only for token refresh (avoids interceptor loops)
const plainAxios = axios.create({ baseURL: BASE_URL });

// Prevents parallel refresh calls when multiple requests get a 401 simultaneously
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
    refreshQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token)));
    refreshQueue = [];
}

async function refreshAccessToken() {
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    const { data } = await plainAxios.post('user/token/refresh/', { refresh: refreshToken });

    const isSecure = window.location.protocol === 'https:';
    Cookies.set('access_token', data.access, { expires: 1, secure: isSecure, sameSite: 'lax' });
    if (data.refresh) {
        Cookies.set('refresh_token', data.refresh, { expires: 7, secure: isSecure, sameSite: 'lax' });
    }

    const { useAuthStore } = await import('../store/auth');
    useAuthStore.getState().setUser(jwtDecode(data.access));
    useAuthStore.getState().setLoading(false);

    return data.access;
}

function clearSessionAndRedirect() {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    import('../store/auth').then(({ useAuthStore }) => {
        useAuthStore.getState().setUser(null);
    });
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

const apiInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attaches a valid access token to every request. Refreshes proactively if expired.
apiInstance.interceptors.request.use(
    async (config) => {
        let accessToken = Cookies.get('access_token');
        const refreshToken = Cookies.get('refresh_token');

        if (!accessToken && !refreshToken) {
            return config; // anonymous request — send without auth header
        }

        if (accessToken && refreshToken) {
            try {
                const { exp } = jwtDecode(accessToken);
                if (Date.now() >= exp * 1000) {
                    accessToken = await refreshAccessToken();
                }
            } catch {
                // malformed token — let it go; 401 handler will catch it
            }
        }

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────────────────
// On 401: attempt one token refresh then retry. On second failure: logout.
apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        original._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({
                    resolve: (token) => {
                        original.headers.Authorization = `Bearer ${token}`;
                        resolve(apiInstance(original));
                    },
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            original.headers.Authorization = `Bearer ${newToken}`;
            return apiInstance(original);
        } catch (refreshError) {
            processQueue(refreshError, null);
            clearSessionAndRedirect();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiInstance;
