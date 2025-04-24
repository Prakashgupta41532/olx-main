import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, SlidersHorizontal, ChevronDown, Tag, Clock, CheckCircle, Heart } from 'lucide-react';
import ReactSlider from 'react-slider';
import { getProductListings, ProductListing } from '../lib/api/productListings';
import { addToFavorites, removeFromFavorites, isProductFavorited } from '../lib/api/favorites';
import { useAuth } from '../contexts/AuthContext';

const Listings = () => {
  const { user } = useAuth();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [distance, setDistance] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState<{[key: string]: boolean}>({});

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

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        // Convert UI sort options to API sort options
        let apiSortBy;
        switch (sortBy) {
          case 'Price: Low to High':
            apiSortBy = 'price_low_to_high';
            break;
          case 'Price: High to Low':
            apiSortBy = 'price_high_to_low';
            break;
          case 'Newest First':
            apiSortBy = 'newest_first';
            break;
          case 'Distance':
            apiSortBy = 'distance';
            break;
          case 'Most Popular':
            apiSortBy = 'popular';
            break;
          default:
            apiSortBy = 'newest_first';
        }

        // Convert UI category to API category (slug format)
        let apiCategory;
        if (selectedCategory !== 'All Categories') {
          apiCategory = selectedCategory.toLowerCase().replace(/ /g, '-');
        }

        const data = await getProductListings({
          category: apiCategory,
          price_min: priceRange[0],
          price_max: priceRange[1],
          sort_by: apiSortBy,
          search: searchQuery.trim() !== '' ? searchQuery : undefined,
          max_distance: distance
        });
        
        // Process the data
        let processedData = [...data];
        
        // If we're sorting by distance but the API doesn't support it,
        // we can do client-side sorting
        if (sortBy === 'Distance' && apiSortBy !== 'distance') {
          // This is a simplified example. In a real app, you would use
          // geolocation to calculate actual distances
          processedData.sort((a, b) => {
            const distA = a.distance ? parseFloat(a.distance) : 999;
            const distB = b.distance ? parseFloat(b.distance) : 999;
            return distA - distB;
          });
        }
        
        // Apply all filters using the filterListings function
        processedData = filterListings(processedData);
        
        setListings(processedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent too many API calls while typing
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, sortBy, priceRange, searchQuery, distance]);

  // Check favorite status for all listings when they change or user changes
  useEffect(() => {
    if (user && listings.length > 0) {
      const checkFavorites = async () => {
        const newStatus: {[key: string]: boolean} = {};
        
        for (const listing of listings) {
          try {
            const isFavorite = await isProductFavorited(listing.id);
            newStatus[listing.id] = isFavorite;
          } catch (err) {
            console.error('Error checking favorite status:', err);
          }
        }
        
        setFavoriteStatus(newStatus);
      };
      
      checkFavorites();
    }
  }, [listings, user]);

  // Filter function for client-side filtering
  const filterListings = (listings: ProductListing[]) => {
    return listings.filter(listing => {
      // Price filter
      if (listing.price < priceRange[0] || listing.price > priceRange[1]) {
        return false;
      }
      
      // Distance filter (if available)
      if (listing.distance && parseFloat(listing.distance) > distance) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== 'All Categories') {
        const categorySlug = selectedCategory.toLowerCase().replace(/ /g, '-');
        if (listing.category_id !== categorySlug) {
          return false;
        }
      }
      
      // Search query filter
      if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const toggleFavorite = async (listingId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth';
      return;
    }
    
    try {
      if (favoriteStatus[listingId]) {
        await removeFromFavorites(listingId);
        setFavoriteStatus(prev => ({
          ...prev,
          [listingId]: false
        }));
      } else {
        await addToFavorites(listingId);
        setFavoriteStatus(prev => ({
          ...prev,
          [listingId]: true
        }));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

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
                  value={searchQuery}
                  onChange={handleSearchInputChange}
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
                onClick={toggleFilters}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Advanced filters - toggle visibility */}
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

        {/* Listings Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Listings</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No listings found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow"
                >
                  <div className="relative pb-[75%]">
                    <img
                      src={listing.image || 'https://via.placeholder.com/300x225'}
                      alt={listing.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {listing.verified && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                    <button
                      onClick={(e) => toggleFavorite(listing.id, e)}
                      className={`absolute top-2 left-2 p-2 rounded-full ${favoriteStatus[listing.id] ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'} transition-colors`}
                    >
                      <Heart className={`h-4 w-4 ${favoriteStatus[listing.id] ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{listing.title}</h3>
                      <span className="font-bold text-primary-600">CA${listing.price}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.location}</span>
                      {listing.distance && (
                        <span className="ml-2">({listing.distance} km)</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {listing.condition && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {listing.condition}
                        </span>
                      )}
                      {listing.posted && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {listing.posted}
                        </span>
                      )}
                    </div>
                    <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;