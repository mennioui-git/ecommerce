import apiInstance from '../../utils/axios';
import { getGuestId } from '../../utils/guestId';
import Swal from 'sweetalert2';

/**
 * Toggle a product in the wishlist.
 *  - Authenticated user → saved in the database
 *  - Guest              → saved in Redis (identified by a guest_id cookie)
 */
export const addToWishlist = async (productId, userId) => {
    try {
        let response;

        if (userId) {
            // ── Authenticated user ──────────────────────────────────────────
            const formData = new FormData();
            formData.append('product_id', productId);
            formData.append('user_id', userId);
            response = await apiInstance.post('customer/wishlist/create/', formData);
        } else {
            // ── Guest user (Redis) ──────────────────────────────────────────
            const guestId = getGuestId();
            response = await apiInstance.post(
                'guest/wishlist/',
                { product_id: productId, guest_id: guestId },
                { headers: { 'X-Guest-ID': guestId } }
            );
        }

        Swal.fire({
            icon: 'success',
            title: response.data.message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });

        // Notify App.jsx to refresh the wishlist counter in the header
        window.dispatchEvent(new Event('wishlist-updated'));

        return response.data;
    } catch (error) {
        console.error('Wishlist error:', error);
        Swal.fire({ icon: 'error', title: 'Could not update wishlist' });
        throw error;
    }
};

/**
 * Called right after a successful login: moves Redis guest wishlist → user DB wishlist.
 */
export const mergeGuestWishlist = async (userId) => {
    const guestId = getGuestId();
    try {
        await apiInstance.post('guest/wishlist/merge/', {
            guest_id: guestId,
            user_id: userId,
        });
    } catch (error) {
        console.error('Wishlist merge error:', error);
    }
};
