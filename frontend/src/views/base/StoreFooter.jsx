import React from 'react'
import { Link } from 'react-router-dom'

function StoreFooter() {
  return (
    <footer className="lc-footer">
      <div className="container">
        <div className="row g-5 pb-5">

          {/* Brand Column */}
          <div className="col-lg-4 col-md-6">
            <span className="lc-footer-brand">Lamssa Fashion</span>
            <p className="lc-footer-desc">
              Your fashion destination for elegant and timeless clothing.
              Artisan quality, contemporary style — designed for you.
            </p>
            <div className="lc-footer-social">
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
              <a href="#" aria-label="Pinterest"><i className="fab fa-pinterest-p" /></a>
              <a href="#" aria-label="TikTok"><i className="fab fa-tiktok" /></a>
            </div>
          </div>

          {/* Collections */}
          <div className="col-lg-2 col-md-3 col-6">
            <p className="lc-footer-col-title">Collections</p>
            <ul>
              <li><a href="#">Women</a></li>
              <li><a href="#">Men</a></li>
              <li><a href="#">Accessories</a></li>
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Sale</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-lg-2 col-md-3 col-6">
            <p className="lc-footer-col-title">Customer Service</p>
            <ul>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">FAQ</a></li>
              <li><Link to="/cart/">Cart</Link></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* About */}
          <div className="col-lg-2 col-md-3 col-6">
            <p className="lc-footer-col-title">About</p>
            <ul>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Privacy</a></li>
              <li><Link to="/vendor/register/">Become a Vendor</Link></li>
            </ul>
          </div>

          {/* My Account */}
          <div className="col-lg-2 col-md-3 col-6">
            <p className="lc-footer-col-title">My Account</p>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/customer/orders/">Orders</Link></li>
              <li><Link to="/customer/wishlist/">Wishlist</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="lc-footer-bottom">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
          <p className="lc-footer-copyright mb-0">
            &copy; 2025 Lamssa Fashion. All rights reserved.
          </p>
          <p className="lc-footer-copyright mb-0">
            Fashion &amp; Elegance — Made with care
          </p>
        </div>
      </div>
    </footer>
  )
}

export default StoreFooter
