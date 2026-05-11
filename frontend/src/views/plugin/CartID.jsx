const CART_ID_KEY = 'cart_id';

function CartID() {
    let id = localStorage.getItem(CART_ID_KEY);

    // Migrate old key name if present
    if (!id) {
        const legacy = localStorage.getItem('randomString');
        if (legacy) {
            localStorage.setItem(CART_ID_KEY, legacy);
            localStorage.removeItem('randomString');
            id = legacy;
        }
    }

    if (!id) {
        // crypto.randomUUID() is available in all modern browsers
        id = crypto.randomUUID().replace(/-/g, '').substring(0, 30);
        localStorage.setItem(CART_ID_KEY, id);
    }

    return id;
}

export default CartID;
