import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Search, SlidersHorizontal, ChevronDown, Tag, Clock, CheckCircle } from 'lucide-react';
import ReactSlider from 'react-slider';

const Listings = () => {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [distance, setDistance] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');

  const categories = [
    'All Categories',
    'Electronics',
    'Vehicles',
    'Real Estate',
    'Furniture',
    'Fashion',
    'Sports',
    'Books',
    'Collectibles'
  ];

  const sortOptions = [
    'Newest First',
    'Price: Low to High',
    'Price: High to Low',
    'Most Popular',
    'Distance'
  ];

  const sampleListings = [
    {
      id: 1,
      title: '2022 MacBook Pro M2',
      price: 1899,
      location: 'Toronto, ON',
      distance: '2.3 km',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=500',
      condition: 'Like New',
      posted: '2 hours ago',
      verified: true
    },
    {
      id: 2,
      title: 'Canon EOS R5 Camera',
      price: 3499,
      location: 'Vancouver, BC',
      distance: '1.5 km',
      image: 'https://images.unsplash.com/photo-1621520291095-aa6c7137f578?auto=format&fit=crop&q=80&w=500',
      condition: 'Excellent',
      posted: '5 hours ago',
      verified: true
    },
    {
      id: 3,
      title: 'Canada Goose Parka',
      price: 599,
      location: 'Montreal, QC',
      distance: '3.1 km',
      image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=500',
      condition: 'Good',
      posted: '1 day ago',
      verified: false
    },
    {
      id: 4,
      title: 'iPhone 15 Pro Max',
      price: 1299,
      location: 'Calgary, AB',
      distance: '0.8 km',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=500',
      condition: 'Like New',
      posted: '3 hours ago',
      verified: true
    },
    {
      id: 5,
      title: 'Peloton Bike+',
      price: 1899,
      location: 'Ottawa, ON',
      distance: '4.2 km',
      image: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?auto=format&fit=crop&q=80&w=500',
      condition: 'Excellent',
      posted: '6 hours ago',
      verified: true
    },
    {
      id: 6,
      title: 'PS5 Bundle with Games',
      price: 549,
      location: 'Edmonton, AB',
      distance: '1.7 km',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=500',
      condition: 'Good',
      posted: '4 hours ago',
      verified: false
    },
    {
      id: 7,
      title: 'DJI Mavic 3 Pro Drone',
      price: 2299,
      location: 'Winnipeg, MB',
      distance: '2.9 km',
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=500',
      condition: 'Like New',
      posted: '2 days ago',
      verified: true
    },
    {
      id: 8,
      title: 'Ski Equipment Set',
      price: 799,
      location: 'Quebec City, QC',
      distance: '5.3 km',
      image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&q=80&w=500',
      condition: 'Good',
      posted: '1 day ago',
      verified: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-soft p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>

              <button
                className="bg-primary-50 text-primary-600 p-2 rounded-xl hover:bg-primary-100 transition-colors"
                onClick={() => {}}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (CA$)
              </label>
              <ReactSlider
                className="h-2 bg-gray-200 rounded-full"
                thumbClassName="w-6 h-6 bg-white border-2 border-primary-500 rounded-full -mt-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                trackClassName="h-2 bg-primary-500 rounded-full"
                value={priceRange}
                onChange={setPriceRange}
                min={0}
                max={5000}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>CA${priceRange[0]}</span>
                <span>CA${priceRange[1]}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance (km)
              </label>
              <ReactSlider
                className="h-2 bg-gray-200 rounded-full"
                thumbClassName="w-6 h-6 bg-white border-2 border-primary-500 rounded-full -mt-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                trackClassName="h-2 bg-primary-500 rounded-full"
                value={distance}
                onChange={setDistance}
                min={0}
                max={50}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>0 km</span>
                <span>{distance} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sampleListings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium text-primary-600">
                  {listing.condition}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                    {listing.title}
                    {listing.verified && (
                      <CheckCircle className="inline-block h-4 w-4 text-primary-600 ml-1" />
                    )}
                  </h3>
                  <p className="text-lg font-bold text-primary-600 ml-2 whitespace-nowrap">
                    CA${listing.price}
                  </p>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location} • {listing.distance}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {listing.posted}
                  </div>
                </div>
                <button className="mt-3 w-full py-2 bg-gradient-primary text-white text-sm font-medium rounded-xl hover:shadow-glow transition-all">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Listings;