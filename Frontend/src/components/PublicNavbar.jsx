import React from 'react';
import { FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const PublicNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md">
      
      {/* Top Bar */}
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          
          {/* LEFT - Phone */}
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <FaPhone className="h-4 w-4" />
            <span>+(94) 776-957-704</span>
          </div>

          {/* RIGHT - Social Icons */}
          <div className="flex items-center space-x-3 text-gray-600">
            <a href="#" className="hover:text-blue-600 transition-colors">
              <FaFacebook className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              <FaTwitter className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-pink-600 transition-colors">
              <FaInstagram className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-blue-700 transition-colors">
              <FaLinkedin className="h-5 w-5" />
            </a>
          </div>

        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* LEFT - Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={assets.logo} 
              alt="Logo" 
              className="h-10 w-auto"
            />
            <h1 className="text-2xl font-bold text-blue-700">CampusOpsHub</h1>
          </div>

          {/* CENTER - Links with underline hover effect */}
          <div className="flex space-x-8">
            {['Home', 'Services', 'About', 'Contact'].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                className="relative text-gray-700 font-medium hover:text-blue-600 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
              >
                {link}
              </a>
            ))}
          </div>

          {/* RIGHT - Login Button */}
          <div>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
              onClick={() => navigate('/login')}
            >
              <FiLogIn className="h-4 w-4" />
              <span>Login</span>
            </button>
          </div>

        </div>
      </div>

    </nav>
  );
};

export default PublicNavbar;
