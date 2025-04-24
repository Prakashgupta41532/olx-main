import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Tag, Clock, User, ChevronLeft, Heart, Share2, CheckCircle } from 'lucide-react';
import { getProductListingById, getProductListings, ProductListing } from '../lib/api/productListings';
import { addToFavorites, removeFromFavorites, isProductFavorited } from '../lib/api/favorites';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [similarListings, setSimilarListings] = useState<ProductListing[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) {
        console.log('No ID provided');
        return;
      }
      
      console.log('Fetching product details for ID:', id);
      
      try {
        setLoading(true);
        const data = await getProductListingById(id);
        console.log('Product data received:', data);
        setProduct(data);
        
        // Check if product is favorited
        if (user) {
          console.log('Checking if product is favorited for user:', user.id);
          const favorited = await isProductFavorited(id);
          console.log('Is product favorited:', favorited);
          setIsFavorited(favorited);
        }

        // Fetch similar listings after we have the product data
        if (data) {
          fetchSimilarListings(data);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, user]);

  const fetchSimilarListings = async (currentProduct: ProductListing) => {
    try {
      setLoadingSimilar(true);
      console.log('Fetching similar listings for category_id:', currentProduct.category_id);
      
      // Get products with the same category, excluding the current product
      const filters: {
        category?: string;
        price_min?: number;
        price_max?: number;
      } = {};
      
      if (currentProduct.category_id) {
        // If we have a category, use it to find similar products
        const { data: categories } = await supabase
          .from('categories')
          .select('slug')
          .eq('id', currentProduct.category_id)
          .single();
        
        if (categories?.slug) {
          filters.category = categories.slug;
        }
      }
      
      // Get listings with similar price range (+/- 30%)
      const minPrice = currentProduct.price * 0.7;
      const maxPrice = currentProduct.price * 1.3;
      filters.price_min = minPrice;
      filters.price_max = maxPrice;
      
      const listings = await getProductListings(filters);
      console.log('Similar listings found:', listings);
      
      // Filter out the current product
      const filteredListings = listings.filter(listing => listing.id !== currentProduct.id);
      
      // Limit to 4 similar listings
      setSimilarListings(filteredListings.slice(0, 4));
    } catch (err) {
      console.error('Error fetching similar listings:', err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      toast.error('Please log in to save favorites');
      navigate('/auth');
      return;
    }
    
    if (!id) return;
    
    try {
      if (isFavorited) {
        await removeFromFavorites(id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Failed to update favorites');
    }
  };

  const handleCheckout = () => {
    // In a real application, this would navigate to a checkout page or process
    toast.success('Proceeding to checkout...');
    // For now, we'll just show a toast notification
    toast('This would navigate to the checkout process in a real application');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title || 'Product listing',
        text: `Check out this listing: ${product?.title}`,
        url: window.location.href,
      })
      .then(() => toast.success('Shared successfully'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Product not found'}
            </h3>
            <button 
              onClick={goBack}
              className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={goBack}
            className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to listings
          </button>

          <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-8">
            <div className="relative h-96 md:h-[500px]">
              <img
                src={product.image || 'https://via.placeholder.com/800x600'}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-contain bg-gray-100"
              />
              {product.verified && (
                <div className="absolute top-4 right-4 bg-primary-500 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verified
                </div>
              )}
              <div className="absolute top-4 left-4 flex space-x-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-full ${isFavorited ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'} transition-colors shadow-md`}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors shadow-md"
                  aria-label="Share listing"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.title}</h1>
                <div className="text-2xl md:text-3xl font-bold text-primary-600">
                  CA${product.price.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{product.location}</span>
                  {product.distance && (
                    <span className="ml-2">({product.distance} km)</span>
                  )}
                </div>
                {product.condition && (
                  <div className="flex items-center text-gray-600">
                    <Tag className="h-5 w-5 mr-2" />
                    <span>{product.condition}</span>
                  </div>
                )}
                {product.posted && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Posted {product.posted}</span>
                  </div>
                )}
                {product.seller_id && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-2" />
                    <span>Seller ID: {product.seller_id}</span>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <div className="prose max-w-none text-gray-700">
                  {product.description || 'No description provided.'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleCheckout}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Proceed to Checkout
                </button>
                <button 
                  onClick={() => {
                    toast.success('Message sent to seller');
                    // In a real app, this would open a chat with the seller
                  }}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Contact Seller
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Similar Listings</h2>
            {loadingSimilar ? (
              <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : similarListings.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No similar listings found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {similarListings.map((listing) => (
                  <Link 
                    key={listing.id} 
                    to={`/listings/${listing.id}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
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
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{listing.title}</h3>
                        <span className="font-bold text-primary-600 text-sm">CA${listing.price}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">{listing.location}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
