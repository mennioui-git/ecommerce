import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Sidebar from './Sidebar';
import apiInstance from '../../utils/axios';
import UserData from '../plugin/UserData';
import { addToWishlist } from '../plugin/AddToWishlist';
import { getGuestId } from '../../utils/guestId';

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const userData = UserData();

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            if (userData?.user_id) {
                // ── Authenticated: load from DB ───────────────────────────
                const res = await apiInstance.get(`customer/wishlist/${userData.user_id}/`);
                setWishlist(res.data);
            } else {
                // ── Guest: load from Redis ────────────────────────────────
                const guestId = getGuestId();
                const res = await apiInstance.get('guest/wishlist/', {
                    params: { guest_id: guestId },
                    headers: { 'X-Guest-ID': guestId },
                });
                // Guest endpoint returns plain Product objects
                setWishlist(res.data.map(product => ({ product })));
            }
        } catch (err) {
            console.error('Error fetching wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [userData?.user_id]);

    const handleToggle = async (productId) => {
        await addToWishlist(productId, userData?.user_id);
        fetchWishlist();
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <i className="fas fa-spinner fa-spin fa-2x" />
            </div>
        );
    }

    return (
        <div>
            <main className="mt-5">
                <div className="container">
                    <section>
                        <div className="row">
                            {userData?.user_id && <Sidebar />}
                            <div className={userData?.user_id ? 'col-lg-9 mt-1' : 'col-12'}>
                                <h3 className="mb-3">
                                    <i className="fas fa-heart text-danger me-2" />
                                    Wishlist
                                    <span className="badge bg-danger ms-2">{wishlist.length}</span>
                                </h3>

                                {!userData?.user_id && (
                                    <div className="alert alert-info mb-4">
                                        <i className="fas fa-info-circle me-2" />
                                        Wishlist saved for 30 days.{' '}
                                        <Link to="/login">Log in</Link> to keep it permanently across all devices.
                                    </div>
                                )}

                                {wishlist.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-heart-broken fa-3x text-muted mb-3" />
                                        <h5 className="text-muted">Your wishlist is empty</h5>
                                        <Link to="/" className="btn btn-primary mt-3">
                                            Browse Products
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {wishlist.map((w) => (
                                            <div key={w.product.id} className="col-lg-4 col-md-6 mb-4">
                                                <div className="card h-100 shadow-sm">
                                                    <div style={{ height: 220, overflow: 'hidden' }}>
                                                        <img
                                                            src={w.product.image}
                                                            className="w-100 h-100"
                                                            style={{ objectFit: 'cover' }}
                                                            alt={w.product.title}
                                                        />
                                                    </div>
                                                    <div className="card-body d-flex flex-column">
                                                        <Link
                                                            to={`/detail/${w.product.slug}/`}
                                                            className="text-reset text-decoration-none"
                                                        >
                                                            <h6 className="card-title mb-2">
                                                                {w.product.title?.length > 50
                                                                    ? w.product.title.slice(0, 50) + '…'
                                                                    : w.product.title}
                                                            </h6>
                                                        </Link>
                                                        <h6 className="mb-3 text-primary">${w.product.price}</h6>
                                                        <div className="mt-auto d-flex gap-2">
                                                            <Link
                                                                to={`/detail/${w.product.slug}/`}
                                                                className="btn btn-outline-primary btn-sm flex-grow-1"
                                                            >
                                                                View Product
                                                            </Link>
                                                            <button
                                                                onClick={() => handleToggle(w.product.id)}
                                                                className="btn btn-danger btn-sm"
                                                                title="Remove from wishlist"
                                                            >
                                                                <i className="fas fa-heart-broken" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Wishlist;
