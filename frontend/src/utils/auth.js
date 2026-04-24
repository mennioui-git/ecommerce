import { useAuthStore } from "../store/auth";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { use } from "react";


export const login = async (email, password) => {
    try {
        const {data, status} = await axios.post(
            "user/token/", 
            {
                email,
                password
            }
        )
        if(status === 200){
            setAuthUser(data.access, data.refresh)

            // Alert - Sign in successfully
            return {data, error: null}
        }
    } catch (error) {
        return {
            data: null,
            error: error.response.data?.detail || 'Something went wrong on login'
        };
    }
}

export const register = async (full_name, email, phone, password, password2) => {
    try {
        const {data, status} = await axios.post(
            "user/register/",
            {
                full_name,
                email,
                phone,
                password,
                password2
            }
        )

        await login(email, password)

        // Alert - Sign up successfully
        return {data, error: null}

    } catch (error) {
        return {
            data: null,
            error: error.response.data?.detail || 'Something went wrong on registration'
        };
    }
}

export const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    useAuthStore.getState().setUser(null);

    // Alert - Sign out successfully
}

export const setUser = async () => {
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');

    if (!accessToken || !refreshToken) {
        return;
    }

    if (isAccessTokenExpired(accessToken)) {
        const response = await getRefreshToken(refreshToken);
        setAuthUser(response.access, refreshToken);
    } else {
        setAuthUser(accessToken, refreshToken);
    }
}

export const setAuthUser = (access_token, refresh_token) => {
    Cookies.set('access_token', access_token, 
        {
            expires: 1,
            secure: true
        }
    )

    Cookies.set('refresh_token', refresh_token, 
        {
            expires: 7,
            secure: true
        }
    )

    const user = jwtDecode(access_token) ?? null;

    if (user) {
        useAuthStore.getState().setUser(user);
    }
    useAuthStore.getState().setLoading(false);
}

export const getRefreshToken = async () => {
    const refresh_token = Cookies.get('refresh_token');
    const response = await axios.post(
        "user/token/refresh/",
        {
            refresh: refresh_token
        }
    )
    return response.data;
}

export const isAccessTokenExpired = (accessToken) => {
    try {
        const { exp } = jwtDecode(accessToken);
        return Date.now() > exp / 100;
    } catch (error) {
        console.error("Invalid access token:", error);
        return true;
    }
}
