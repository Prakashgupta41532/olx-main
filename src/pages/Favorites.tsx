import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Tag, Clock, CheckCircle } from 'lucide-react';
import { getUserFavorites, removeFromFavorites, FavoriteWithProduct } from '../lib/api/favorites';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserFavorites();
        setFavorites(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await removeFromFavorites(productId);
      // Update the state to remove the item
      setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-soft p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Sign in to view favorites</h3>
            <p className="text-gray-500 mb-4">You need to be logged in to save and view your favorite listings</p>
            <Link 
              to="/auth" 
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No favorites yet</h3>
            <p className="text-gray-500 mb-4">Browse listings and click the heart icon to add items to your favorites</p>
            <Link 
              to="/" 
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow"
              >
                <div className="relative pb-[75%]">
                  <img
                    src={favorite.product.image || 'https://via.placeholder.com/300x225'}
                    alt={favorite.product.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {favorite.product.verified && (
                    <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFavorite(favorite.product_id)}
                    className="absolute top-2 left-2 p-2 rounded-full bg-red-500 text-white transition-colors"
                  >
                    <Heart className="h-4 w-4 fill-white" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{favorite.product.title}</h3>
                    <span className="font-bold text-primary-600">CA${favorite.product.price}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{favorite.product.location}</span>
                    {favorite.product.distance && (
                      <span className="ml-2">({favorite.product.distance} km)</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {favorite.product.condition && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {favorite.product.condition}
                      </span>
                    )}
                    {favorite.product.posted && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {favorite.product.posted}
                      </span>
                    )}
                  </div>
                  <Link 
                    to={`/listings/${favorite.product.id}`} 
                    className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
