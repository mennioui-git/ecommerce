import { useEffect, useState } from 'react';
import { login } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Link } from 'react-router-dom';
import apiInstance from '../../utils/axios';
import Products from './Products';
// This is a functional component named 'Home.'
const Home = () => {

  // Using the 'useAuthStore' hook to get the user's authentication state.
  // It returns an array with two elements: isLoggedIn and user.
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      {/* Using a conditional statement to render different views based on whether the user is logged in or not. */}
      {isLoggedIn() ? <LoggedInView user={user} /> : <LoggedOutView />}
    </div>
  );
};

// This is another functional component named 'LoggedInView' which receives 'user' as a prop.
const LoggedInView = ({ user }) => {


  return (
    <div>
      <Products />
    </div>
  );
};

// This is a functional component named 'LoggedOutView,' which has an optional 'title' prop.
export const LoggedOutView = ({ title = 'Home' }) => {
  return (
    <div>
      <Products />
    </div>
  );
};

// Exporting the 'Home' component as the default export of this module.
export default Home;