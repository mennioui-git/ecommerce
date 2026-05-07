import { useAuthStore } from '../../store/auth';
import { Link } from 'react-router-dom';
import Products from './Products';

const Home = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      {isLoggedIn() ? <LoggedInView user={user} /> : <LoggedOutView />}
    </div>
  );
};

const HeroSection = () => (
  <section className="lc-hero text-center">
    <div className="container">
      <p className="lc-hero-eyebrow">Nouvelle Collection 2025</p>
      <h1 className="lc-hero-title">
        La Mode à<br /><em>Votre Service</em>
      </h1>
      <p className="lc-hero-subtitle">
        Lamssa Creation vous propose une sélection soigneuse de pièces élégantes,
        conçues pour sublimer votre style au quotidien.
      </p>
      <div className="d-flex justify-content-center gap-3 flex-wrap">
        <Link to="/" className="lc-btn-gold">Découvrir la Collection</Link>
        <Link to="/" className="lc-btn-ghost">Nos Nouveautés</Link>
      </div>
    </div>
  </section>
);

const LoggedInView = ({ user }) => (
  <div>
    <HeroSection />
    <Products />
  </div>
);

export const LoggedOutView = ({ title = 'Home' }) => (
  <div>
    <HeroSection />
    <Products />
  </div>
);

export default Home;
