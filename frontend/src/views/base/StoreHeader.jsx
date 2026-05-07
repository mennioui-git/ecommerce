import React, { useContext, useState } from 'react'
import { useAuthStore } from '../../store/auth';
import { Link } from 'react-router-dom';
import { CartContext } from '../plugin/Context';
import { useNavigate } from 'react-router-dom';

function StoreHeader() {
    const [cartCount] = useContext(CartContext);
    const [search, setSearch] = useState("");

    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const user = useAuthStore((state) => state.user);

    const navigate = useNavigate();

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleSearchSubmit = () => {
        navigate(`/search?query=${search}`);
    };

    return (
        <header>
            {/* Announcement Bar */}
            <div className="lc-announcement-bar">
                Livraison gratuite en France à partir de 80&nbsp;€&nbsp;&nbsp;|&nbsp;&nbsp;Retours acceptés sous 30 jours
            </div>

            {/* Main Navbar */}
            <nav className="navbar navbar-expand-lg lc-header">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        Lamssa Creation
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
                                <Link className="nav-link" to="/">Collections</Link>
                            </li>

                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Mon Compte
                                </a>
                                <ul className="dropdown-menu">
                                    <li><Link to="/customer/account/" className="dropdown-item"><i className="fas fa-user me-2" />Mon Profil</Link></li>
                                    <li><Link className="dropdown-item" to="/customer/orders/"><i className="fas fa-shopping-bag me-2" />Mes Commandes</Link></li>
                                    <li><Link className="dropdown-item" to="/customer/wishlist/"><i className="fas fa-heart me-2" />Favoris</Link></li>
                                    <li><Link className="dropdown-item" to="/customer/notifications/"><i className="fas fa-bell me-2" />Notifications</Link></li>
                                    <li><Link className="dropdown-item" to="/customer/settings/"><i className="fas fa-cog me-2" />Paramètres</Link></li>
                                </ul>
                            </li>

                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Vendeur
                                </a>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to="/vendor/dashboard/"><i className="fas fa-chart-line me-2" />Tableau de bord</Link></li>
                                    <li><Link className="dropdown-item" to="/vendor/products/"><i className="fas fa-boxes me-2" />Produits</Link></li>
                                    <li><Link className="dropdown-item" to="/vendor/product/new/"><i className="fas fa-plus-circle me-2" />Ajouter</Link></li>
                                    <li><Link className="dropdown-item" to="/vendor/orders/"><i className="fas fa-shopping-cart me-2" />Commandes</Link></li>
                                    <li><Link className="dropdown-item" to="/vendor/earning/"><i className="fas fa-dollar-sign me-2" />Revenus</Link></li>
                                    <li><Link className="dropdown-item" to="/vendor/reviews/"><i className="fas fa-star me-2" />Avis</Link></li>
                                    <li><Link className="dropdown-item" to="/vendor/coupon/"><i className="fas fa-tag me-2" />Coupons</Link></li>
                                    <li><Link className="dropdown-item" to="/vendor/notifications/"><i className="fas fa-bell me-2" />Notifications</Link></li>
                                    <li><Link className="dropdown-item" to="/vendor/settings/"><i className="fas fa-cog me-2" />Paramètres</Link></li>
                                </ul>
                            </li>
                        </ul>

                        {/* Right: search + auth + cart */}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <input
                                onChange={handleSearchChange}
                                name="search"
                                className="form-control"
                                type="text"
                                placeholder="Rechercher..."
                                aria-label="Rechercher"
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

                            {isLoggedIn() ? (
                                <>
                                    <Link className="lc-btn-outline ms-1" to="/customer/account/">Compte</Link>
                                    <Link className="lc-btn-outline" to="/logout">Déconnexion</Link>
                                </>
                            ) : (
                                <>
                                    <Link className="lc-btn-outline ms-1" to="/login">Connexion</Link>
                                    <Link className="lc-btn-outline" to="/register">S'inscrire</Link>
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
