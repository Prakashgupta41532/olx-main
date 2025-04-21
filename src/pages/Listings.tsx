import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, SlidersHorizontal, ChevronDown, Tag, Clock, CheckCircle } from 'lucide-react';
import ReactSlider from 'react-slider';
import { getProductListings, ProductListing, 
  // updateProductListing
 } from '../lib/api/productListings';

const Listings = () => {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [distance, setDistance] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          sort_by: apiSortBy
        });
        
        setListings(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [selectedCategory, sortBy, priceRange]);
  // useEffect(() => {
  //   const updateImage = async () => {
  //     await updateProductListing('450d5599-dea4-410c-9e08-51f7a611a2b6', {
  //       image: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //     });
  //   };
  //   updateImage();
  // }, []);

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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-48">
                    <img
                      src={listing.image || 'https://via.placeholder.com/500x300?text=No+Image'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.verified && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                      <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded-lg text-sm font-medium">
                        CA${listing.price}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.location}</span>
                      <span className="mx-1">•</span>
                      <span>{listing.distance}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Tag className="h-4 w-4 mr-1" />
                        <span>{listing.condition}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{listing.posted}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {!loading && !error && listings.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              No listings found matching your criteria. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;