import Cookies from 'js-cookie';

// Returns the persistent guest ID, creating one if it doesn't exist yet.
export const getGuestId = () => {
    let id = Cookies.get('guest_id');
    if (!id) {
        id = crypto.randomUUID();
        Cookies.set('guest_id', id, {
            expires: 30,
            sameSite: 'lax',
            secure: window.location.protocol === 'https:',
        });
    }
    return id;
};
