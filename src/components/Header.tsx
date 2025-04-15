import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, Search, MessageCircle, User, LogOut, MapPin, ChevronDown, Bell, X,
  Car, Home, Smartphone, Briefcase, Bike, Tv, Truck, Sofa, Shirt, Book, Dog,
  ShoppingBag, Plus, Store
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Toronto, ON');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const locations = [
    'Toronto, ON',
    'Vancouver, BC',
    'Montreal, QC',
    'Calgary, AB',
    'Ottawa, ON',
    'Edmonton, AB',
    'Winnipeg, MB',
    'Quebec City, QC'
  ];

  const categories = [
    { name: 'Cars', icon: Car, path: '/category/cars' },
    { name: 'Properties', icon: Home, path: '/category/properties' },
    { name: 'Mobiles', icon: Smartphone, path: '/category/mobiles' },
    { name: 'Jobs', icon: Briefcase, path: '/category/jobs' },
    { name: 'Bikes', icon: Bike, path: '/category/bikes' },
    { name: 'Electronics', icon: Tv, path: '/category/electronics' },
    { name: 'Commercial', icon: Truck, path: '/category/commercial' },
    { name: 'Furniture', icon: Sofa, path: '/category/furniture' },
    { name: 'Fashion', icon: Shirt, path: '/category/fashion' },
    { name: 'Books & Sports', icon: Book, path: '/category/books-sports' },
    { name: 'Pets', icon: Dog, path: '/category/pets' }
  ];

  return (
    <header className="bg-gradient-to-r from-brand-600 to-brand-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-brand-800 p-4 z-50"
            >
              <div className="flex items-center space-x-4">
                <button onClick={() => setShowSearch(false)}>
                  <X className="h-6 w-6" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Header */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <Store className="h-8 w-8" />
                <span className="text-xl font-bold hidden sm:block">ShopNearMe</span>
              </Link>
            </div>

            {/* Center Section - Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              </div>
              <button className="ml-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                Search
              </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSearch(true)}
                className="md:hidden"
              >
                <Search className="h-6 w-6" />
              </button>
              
              <Link
                to="/listings/create"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Sell Now</span>
              </Link>

              {user ? (
                <>
                  <Link to="/messages" className="hidden sm:block">
                    <MessageCircle className="h-6 w-6" />
                  </Link>
                  <Link to="/notifications" className="hidden sm:block">
                    <Bell className="h-6 w-6" />
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2">
                      <User className="h-6 w-6" />
                      <ChevronDown className="h-4 w-4 hidden sm:block" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50"
                      >
                        Orders
                      </Link>
                      <Link
                        to="/listings/create"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 md:hidden"
                      >
                        Sell Now
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-brand-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Categories Bar */}
          <div className="mt-2 -mb-2">
            <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide py-2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.path}
                  className="flex flex-col items-center space-y-1 text-xs font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
                >
                  <category.icon className="h-5 w-5" />
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-700"
            >
              <nav className="px-4 py-2">
                <Link
                  to="/profile"
                  className="block py-2 text-white/80 hover:text-white"
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="block py-2 text-white/80 hover:text-white"
                >
                  Orders
                </Link>
                <Link
                  to="/messages"
                  className="block py-2 text-white/80 hover:text-white"
                >
                  Messages
                </Link>
                <Link
                  to="/notifications"
                  className="block py-2 text-white/80 hover:text-white"
                >
                  Notifications
                </Link>
                <Link
                  to="/listings/create"
                  className="block py-2 text-white/80 hover:text-white"
                >
                  Sell Now
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;