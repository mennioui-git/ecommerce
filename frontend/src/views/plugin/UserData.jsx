import React from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

function UserData() {
    // Retrieve the access token and refresh token from browser cookies
    let access_token = Cookies.get('access_token');
    let refresh_token = Cookies.get('refresh_token');

    if (access_token && refresh_token) {
        // Both access and refresh tokens exist
        // Decode the refresh token to extract user information
        const token = refresh_token;
        const decoded = jwtDecode(token);

        // Extract the user's unique identifier (user_id) from the decoded token
        const user_id = decoded.user_id;

        // Return the decoded user data, which may include user information
        return decoded;
    } else {
        // One or both tokens (access or refresh) are missing
        return null;
    }
}

export default UserData;

