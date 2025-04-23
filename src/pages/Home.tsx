import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProductListings, ProductListing } from '../lib/api/productListings';

const Home = () => {
  const [featuredListings, setFeaturedListings] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getProductListings();
        setFeaturedListings(data.slice(0, 10));
        setError(null);
      } catch (e) {
        setError(`Failed to load featured listings. ${e}`);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

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
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="col-span-full text-center py-8 text-red-500">{error}</div>
          ) : featuredListings.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No featured listings found.</div>
          ) : 
            featuredListings.map((listing) => (
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