import Cookies from 'js-cookie';

const COOKIE_KEY = 'wishlist';
const COOKIE_EXPIRES = 30; // days

export function getWishlistIds() {
    try {
        return JSON.parse(Cookies.get(COOKIE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveWishlistIds(ids) {
    Cookies.set(COOKIE_KEY, JSON.stringify(ids), { expires: COOKIE_EXPIRES });
}

export function isInWishlist(productId) {
    return getWishlistIds().includes(Number(productId));
}

/** Returns true if added, false if removed */
export function toggleWishlist(productId) {
    const id = Number(productId);
    const ids = getWishlistIds();
    if (ids.includes(id)) {
        saveWishlistIds(ids.filter(i => i !== id));
        return false;
    }
    saveWishlistIds([...ids, id]);
    return true;
}

export function clearWishlist() {
    Cookies.remove(COOKIE_KEY);
}
