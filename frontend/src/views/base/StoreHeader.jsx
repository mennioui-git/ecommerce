import React, { useContext, useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext, WishlistContext } from '../plugin/Context';
import UserData from '../plugin/UserData';

function StoreHeader() {
    const [cartCount] = useContext(CartContext);
    const [wishlistCount] = useContext(WishlistContext);
    const [search, setSearch] = useState('');

    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const userData = UserData();
    const isVendor = userData?.vendor_id && userData.vendor_id !== 0;

    const navigate = useNavigate();

    const handleSearchSubmit = () => {
        if (search.trim()) navigate(`/search?query=${search.trim()}`);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter') handleSearchSubmit();
    };

    return (
        <header>
            {/* Announcement Bar */}
            <div className="lc-announcement-bar">
                Free shipping on orders over $80&nbsp;&nbsp;|&nbsp;&nbsp;Returns accepted within 30 days
            </div>

            {/* Main Navbar */}
            <nav className="navbar navbar-expand-lg lc-header">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        Lamssa Fashion
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#lcNavbar"
                        aria-controls="lcNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="lcNavbar">
                        {/* Left nav links */}
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link" href="/#our-collections">Collections</a>
                            </li>

                            {/* My Account — only for logged-in non-vendor users */}
                            {isLoggedIn() && !isVendor && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        My Account
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li><Link to="/customer/account/" className="dropdown-item"><i className="fas fa-user me-2" />My Profile</Link></li>
                                        <li><Link className="dropdown-item" to="/customer/orders/"><i className="fas fa-shopping-bag me-2" />My Orders</Link></li>
                                        <li><Link className="dropdown-item" to="/customer/wishlist/"><i className="fas fa-heart me-2" />Wishlist</Link></li>
                                        <li><Link className="dropdown-item" to="/customer/notifications/"><i className="fas fa-bell me-2" />Notifications</Link></li>
                                        <li><Link className="dropdown-item" to="/customer/settings/"><i className="fas fa-cog me-2" />Settings</Link></li>
                                    </ul>
                                </li>
                            )}

                            {/* Vendor dropdown (vendors only) OR "Become a Vendor" button */}
                            {isVendor ? (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Vendor
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li><Link className="dropdown-item" to="/vendor/dashboard/"><i className="fas fa-chart-line me-2" />Dashboard</Link></li>
                                        <li><Link className="dropdown-item" to="/vendor/products/"><i className="fas fa-boxes me-2" />Products</Link></li>
                                        <li><Link className="dropdown-item" to="/vendor/product/new/"><i className="fas fa-plus-circle me-2" />Add Product</Link></li>
                                        <li><Link className="dropdown-item" to="/vendor/orders/"><i className="fas fa-shopping-cart me-2" />Orders</Link></li>
                                        <li><Link className="dropdown-item" to="/vendor/earning/"><i className="fas fa-dollar-sign me-2" />Earnings</Link></li>
                                        <li><Link className="dropdown-item" to="/vendor/reviews/"><i className="fas fa-star me-2" />Reviews</Link></li>
                                        <li><Link className="dropdown-item" to="/vendor/coupon/"><i className="fas fa-tag me-2" />Coupons</Link></li>
                                        <li><Link className="dropdown-item" to="/vendor/notifications/"><i className="fas fa-bell me-2" />Notifications</Link></li>
                                        <li><Link className="dropdown-item" to="/vendor/settings/"><i className="fas fa-cog me-2" />Settings</Link></li>
                                    </ul>
                                </li>
                            ) : (
                                <li className="nav-item">
                                    <Link className="nav-link fw-semibold text-warning" to="/vendor/register/">
                                        <i className="fas fa-store me-1" />Become a Vendor
                                    </Link>
                                </li>
                            )}
                        </ul>

                        {/* Right: search + wishlist + auth + cart */}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <input
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKey}
                                value={search}
                                name="search"
                                className="form-control"
                                type="text"
                                placeholder="Search..."
                                aria-label="Search"
                                style={{ maxWidth: '160px', fontSize: '0.82rem' }}
                            />
                            <button
                                onClick={handleSearchSubmit}
                                className="btn btn-outline-success"
                                type="button"
                                style={{ padding: '0.42rem 0.75rem' }}
                            >
                                <i className="fas fa-search" />
                            </button>

                            {/* Wishlist icon — visible for everyone (guest + user) */}
                            <Link className="lc-cart-btn ms-1" to="/customer/wishlist/" title="My Wishlist">
                                <i className="fas fa-heart" />
                                {wishlistCount > 0 && (
                                    <span className="lc-cart-count">{wishlistCount}</span>
                                )}
                            </Link>

                            {isLoggedIn() ? (
                                <>
                                    <Link className="lc-btn-outline ms-1" to="/customer/account/">Account</Link>
                                    <Link className="lc-btn-outline" to="/logout">Logout</Link>
                                </>
                            ) : (
                                <>
                                    <Link className="lc-btn-outline ms-1" to="/login">Login</Link>
                                    <Link className="lc-btn-outline" to="/register">Sign Up</Link>
                                </>
                            )}

                            <Link className="lc-cart-btn ms-1" to="/cart/">
                                <i className="fas fa-shopping-bag" />
                                <span className="lc-cart-count">{cartCount || 0}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default StoreHeader;
