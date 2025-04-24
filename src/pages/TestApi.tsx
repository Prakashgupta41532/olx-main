import { useState, useEffect } from 'react';
import { getProductListings, getProductListingById, ProductListing } from '../lib/api/productListings';

const TestApi = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [singleProduct, setSingleProduct] = useState<ProductListing | null>(null);
  const [productId, setProductId] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await getProductListings();
        console.log('All listings:', data);
        setListings(data);
        
        // If we have listings, set the first one's ID as the default
        if (data && data.length > 0) {
          setProductId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleFetchSingleProduct = async () => {
    if (!productId) {
      setError('Please enter a product ID');
      return;
    }

    try {
      setLoading(true);
      const data = await getProductListingById(productId);
      console.log('Single product:', data);
      setSingleProduct(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
      setSingleProduct(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Single Product Fetch</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Enter product ID"
          />
          <button
            onClick={handleFetchSingleProduct}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Fetch Product'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {singleProduct && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{singleProduct.title}</h3>
            <pre className="text-sm overflow-auto max-h-60">
              {JSON.stringify(singleProduct, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold mb-4">All Listings</h2>
        {listings.length === 0 ? (
          <p>No listings found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => (
              <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{listing.title}</h3>
                <p className="text-gray-600 mb-2">ID: {listing.id}</p>
                <p className="text-primary-600 font-bold">CA${listing.price}</p>
                <button
                  onClick={() => {
                    setProductId(listing.id);
                    handleFetchSingleProduct();
                  }}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                >
                  Test fetch this product
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestApi;
