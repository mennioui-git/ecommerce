import { useAuthStore } from '../../store/auth';
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
      <p className="lc-hero-eyebrow">New Collection 2025</p>
      <h1 className="lc-hero-title">
        Fashion at<br /><em>Your Service</em>
      </h1>
      <p className="lc-hero-subtitle">
        Lamssa Fashion offers a carefully curated selection of elegant pieces,
        designed to elevate your everyday style.
      </p>
      <div className="d-flex justify-content-center gap-3 flex-wrap">
        <a href="#our-collections" className="lc-btn-gold">Discover the Collection</a>
        <a href="#new-arrivals" className="lc-btn-ghost">New Arrivals</a>
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
