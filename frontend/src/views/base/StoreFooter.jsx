import React from 'react'
import { Link } from 'react-router-dom'

function StoreFooter() {
  return (
    <footer className="lc-footer">
      <div className="container">
        <div className="row g-5 pb-5">

          {/* Brand Column */}
          <div className="col-lg-4 col-md-6">
            <span className="lc-footer-brand">Lamssa Creation</span>
            <p className="lc-footer-desc">
              Votre destination mode pour des vêtements élégants et intemporels.
              Qualité artisanale, style contemporain — pensé pour vous.
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
              <li><a href="#">Femme</a></li>
              <li><a href="#">Homme</a></li>
              <li><a href="#">Accessoires</a></li>
              <li><a href="#">Nouveautés</a></li>
              <li><a href="#">Soldes</a></li>
            </ul>
          </div>

          {/* Service Client */}
          <div className="col-lg-2 col-md-3 col-6">
            <p className="lc-footer-col-title">Service Client</p>
            <ul>
              <li><a href="#">Livraison</a></li>
              <li><a href="#">Retours</a></li>
              <li><a href="#">FAQ</a></li>
              <li><Link to="/cart/">Panier</Link></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* À Propos */}
          <div className="col-lg-2 col-md-3 col-6">
            <p className="lc-footer-col-title">À Propos</p>
            <ul>
              <li><a href="#">Notre Histoire</a></li>
              <li><a href="#">Presse</a></li>
              <li><a href="#">Carrières</a></li>
              <li><a href="#">Confidentialité</a></li>
              <li><Link to="/vendor/register/">Devenir Vendeur</Link></li>
            </ul>
          </div>

          {/* Mon Compte */}
          <div className="col-lg-2 col-md-3 col-6">
            <p className="lc-footer-col-title">Mon Compte</p>
            <ul>
              <li><Link to="/login">Connexion</Link></li>
              <li><Link to="/register">Inscription</Link></li>
              <li><Link to="/customer/orders/">Commandes</Link></li>
              <li><Link to="/customer/wishlist/">Favoris</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="lc-footer-bottom">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
          <p className="lc-footer-copyright mb-0">
            &copy; 2025 Lamssa Creation. Tous droits réservés.
          </p>
          <p className="lc-footer-copyright mb-0">
            Mode &amp; Élégance — Fait avec soin
          </p>
        </div>
      </div>
    </footer>
  )
}

export default StoreFooter
