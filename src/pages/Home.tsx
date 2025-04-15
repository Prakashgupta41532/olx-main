import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Star, Tag, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const featuredListings = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max - 256GB',
      price: 1299,
      location: 'Toronto, ON',
      image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=400',
      rating: 4.8,
      reviews: 24,
      condition: 'Like New',
      posted: '2 hours ago'
    },
    {
      id: 2,
      title: 'MacBook Pro M3 Max - 2024',
      price: 3499,
      location: 'Vancouver, BC',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=400',
      rating: 4.9,
      reviews: 16,
      condition: 'Excellent',
      posted: '3 hours ago'
    },
    {
      id: 3,
      title: 'PS5 Slim with Extra Controller',
      price: 499,
      location: 'Montreal, QC',
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=400',
      rating: 4.7,
      reviews: 31,
      condition: 'Good',
      posted: '5 hours ago'
    },
    {
      id: 4,
      title: 'iPad Pro 12.9" M2 (2023)',
      price: 1199,
      location: 'Calgary, AB',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400',
      rating: 5.0,
      reviews: 12,
      condition: 'Like New',
      posted: '1 day ago'
    },
    {
      id: 5,
      title: 'Nintendo Switch OLED - White',
      price: 349,
      location: 'Ottawa, ON',
      image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=400',
      rating: 4.6,
      reviews: 28,
      condition: 'Good',
      posted: '2 days ago'
    },
    {
      id: 6,
      title: 'AirPods Pro (2nd Gen)',
      price: 279,
      location: 'Edmonton, AB',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=400',
      rating: 4.9,
      reviews: 19,
      condition: 'Like New',
      posted: '1 week ago'
    },
    {
      id: 7,
      title: 'Canon EOS R5 with RF 24-70mm',
      price: 4299,
      location: 'Victoria, BC',
      image: 'https://images.unsplash.com/photo-1621520291095-aa6c7137f578?auto=format&fit=crop&q=80&w=400',
      rating: 4.8,
      reviews: 15,
      condition: 'Excellent',
      posted: '3 days ago'
    },
    {
      id: 8,
      title: 'DJI Mavic 3 Pro Drone',
      price: 2199,
      location: 'Quebec City, QC',
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=400',
      rating: 4.7,
      reviews: 23,
      condition: 'Like New',
      posted: '4 days ago'
    }
  ];

  const todaysDeals = [
    {
      id: 1,
      title: 'Flash Sale: Electronics',
      description: 'Up to 30% off on latest gadgets',
      endTime: '11:59 PM',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=500',
      bgColor: 'bg-gradient-to-r from-purple-600 to-blue-600'
    },
    {
      id: 2,
      title: 'Weekend Special',
      description: 'Free delivery on items over $50',
      endTime: 'Sunday',
      image: 'https://images.unsplash.com/photo-1526614180703-827d23e7c8f2?auto=format&fit=crop&q=80&w=500',
      bgColor: 'bg-gradient-to-r from-blue-600 to-cyan-600'
    },
    {
      id: 3,
      title: 'Verified Sellers',
      description: '10% extra discount',
      endTime: 'Limited time',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=500',
      bgColor: 'bg-gradient-to-r from-emerald-600 to-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Today's Deals */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Deals</h2>
          <Link
            to="/deals"
            className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {todaysDeals.map((deal) => (
            <div
              key={deal.id}
              className={`${deal.bgColor} rounded-xl overflow-hidden relative h-48`}
            >
              <img
                src={deal.image}
                alt={deal.title}
                className="w-full h-full object-cover mix-blend-overlay opacity-20"
              />
              <div className="absolute inset-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{deal.title}</h3>
                <p className="text-white/80 mb-4">{deal.description}</p>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Ends in: {deal.endTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Listings */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Featured Listings</h2>
          <Link
            to="/listings"
            className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {featuredListings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-brand-600">
                  {listing.condition}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  {listing.title}
                </h3>
                <p className="text-brand-600 font-bold mb-1">
                  CA${listing.price.toLocaleString()}
                </p>
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {listing.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {listing.posted}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;