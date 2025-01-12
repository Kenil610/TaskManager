import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../Button';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const hiddenRoutes = ['/login', '/signup', '/forgotpassword', '/reset-password'];
  
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Website Name */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-2xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Task Manager
            </Link>
          </div>
          
          {/* Center Links */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`${
                location.pathname === '/'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-indigo-600'
              } px-3 py-2 text-sm font-medium transition-colors duration-200`}
            >
              Home
            </Link>
            <Link
              to="/profile"
              className={`${
                location.pathname === '/profile'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-indigo-600'
              } px-3 py-2 text-sm font-medium transition-colors duration-200`}
            >
              Profile
            </Link>
          </nav>
          
          {/* Logout Button */}
          <div className="flex items-center">
            <Button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;