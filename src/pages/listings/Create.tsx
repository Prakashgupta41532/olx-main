import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, MapPin, DollarSign, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getCategories, Category } from '../../lib/api/categories';
import toast from 'react-hot-toast';

interface CategoryAttribute {
  name: string;
  type: string;
  options?: string[];
  required: boolean;
  validation?: Record<string, any>;
}

const categoryGroups = [
  {
    name: 'Vehicles',
    subcategories: [
      { name: 'Cars', icon: '🚗' },
      { name: 'Motorcycles', icon: '🏍️' },
      { name: 'Commercial Vehicles', icon: '🚛' },
      { name: 'Spare Parts', icon: '🔧' },
      { name: 'Other Vehicles', icon: '🚐' }
    ]
  },
  {
    name: 'Properties',
    subcategories: [
      { name: 'For Sale: Houses & Apartments', icon: '🏠' },
      { name: 'For Rent: Houses & Apartments', icon: '🏢' },
      { name: 'Lands & Plots', icon: '🗺️' },
      { name: 'For Rent: Shops & Offices', icon: '🏪' },
      { name: 'For Sale: Shops & Offices', icon: '🏬' },
      { name: 'PG & Guest Houses', icon: '🏨' }
    ]
  },
  {
    name: 'Electronics & Appliances',
    subcategories: [
      { name: 'Mobile Phones', icon: '📱' },
      { name: 'Laptops', icon: '💻' },
      { name: 'TVs', icon: '📺' },
      { name: 'Computer Accessories', icon: '🖱️' },
      { name: 'Kitchen Appliances', icon: '🍳' },
      { name: 'Cameras', icon: '📸' }
    ]
  },
  {
    name: 'Fashion',
    subcategories: [
      { name: "Men's Fashion", icon: '👔' },
      { name: "Women's Fashion", icon: '👗' },
      { name: "Kids' Fashion", icon: '👶' },
      { name: 'Watches', icon: '⌚' },
      { name: 'Accessories', icon: '👜' }
    ]
  },
  {
    name: 'Home & Garden',
    subcategories: [
      { name: 'Furniture', icon: '🛋️' },
      { name: 'Home Decor', icon: '🏺' },
      { name: 'Garden', icon: '🌺' },
      { name: 'Home Storage', icon: '📦' },
      { name: 'Kitchen & Dining', icon: '🍽️' }
    ]
  },
  {
    name: 'Sports & Hobbies',
    subcategories: [
      { name: 'Books', icon: '📚' },
      { name: 'Gym & Fitness', icon: '🏋️' },
      { name: 'Musical Instruments', icon: '🎸' },
      { name: 'Sports Equipment', icon: '⚽' },
      { name: 'Other Hobbies', icon: '🎨' }
    ]
  },
  {
    name: 'Jobs',
    subcategories: [
      { name: 'IT Jobs', icon: '💻' },
      { name: 'Sales & Marketing', icon: '📊' },
      { name: 'Customer Service', icon: '🎯' },
      { name: 'Driver Jobs', icon: '🚗' },
      { name: 'Other Jobs', icon: '💼' }
    ]
  },
  {
    name: 'Services',
    subcategories: [
      { name: 'Electronics Repair', icon: '🔧' },
      { name: 'Home Services', icon: '🏠' },
      { name: 'Education', icon: '📚' },
      { name: 'Packers & Movers', icon: '📦' },
      { name: 'Other Services', icon: '🛠️' }
    ]
  },
  {
    name: 'Pets',
    subcategories: [
      { name: 'Dogs', icon: '🐕' },
      { name: 'Cats', icon: '🐈' },
      { name: 'Fish & Aquarium', icon: '🐠' },
      { name: 'Pet Food & Accessories', icon: '🦴' },
      { name: 'Other Pets', icon: '🐾' }
    ]
  }
];

const Create = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    condition: '',
    brand: '',
    model: '',
    year: '',
    attributes: {} as Record<string, string | string[]>
  });

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else if (step === 3 && selectedCategory) {
      setSelectedCategory(null);
      setStep(2);
    } else if (step === 2 && selectedGroup) {
      setSelectedGroup(null);
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName);
    setStep(2);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setStep(3);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 20) {
      toast.error('Maximum 20 images allowed');
      return;
    }
    setImages(files);
  };

  const handleSubmit = async () => {
    try {
      if (!user) {
        toast.error('Please sign in to create a listing');
        return;
      }

      // Upload images
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const fileName = `${Date.now()}-${image.name}`;
          const { data, error } = await supabase.storage
            .from('listing-images')
            .upload(fileName, image);
          if (error) throw error;
          return data.path;
        })
      );

      // Create listing
      const { data, error } = await supabase.from('listings').insert({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        seller_id: user.id,
        category_id: selectedCategory,
        location: { address: formData.location },
        images: imageUrls,
        status: 'active',
        condition: formData.condition,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year)
      }).select().single();

      if (error) throw error;

      toast.success('Listing created successfully!');
      navigate(`/listings/${data.id}`);
    } catch (error) {
      toast.error('Failed to create listing');
      console.error('Error creating listing:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Choose a category</h2>
            <div className="divide-y divide-gray-100">
              {categoryGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => handleGroupSelect(group.name)}
                  className="w-full py-4 px-2 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center text-xl">
                      {group.subcategories[0].icon}
                    </div>
                    <span className="text-gray-900">{group.name}</span>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-gray-400 transform rotate-180" />
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        const group = categoryGroups.find(g => g.name === selectedGroup);
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{selectedGroup}</h2>
            <div className="divide-y divide-gray-100">
              {group?.subcategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategorySelect(category.name)}
                  className="w-full py-4 px-2 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center text-xl">
                      {category.icon}
                    </div>
                    <span className="text-gray-900">{category.name}</span>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-gray-400 transform rotate-180" />
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Include some details</h2>
            <div className="space-y-4">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {/* Ad Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  maxLength={70}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.title.length}/70
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe what you are selling <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={4}
                  maxLength={4096}
                  placeholder="Include condition, features and reason for selling"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/4096
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-500 transition-colors"
            >
              Next
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Photos</h2>
            <div className="grid grid-cols-3 gap-4">
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-gray-50 transition-colors">
                <Camera className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Add Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              {images.map((image, index) => (
                <div key={index} className="aspect-square relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-100"
                  >
                    <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-500 transition-colors"
            >
              Next
            </button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Set your price</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  CA$
                </span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter your location"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-500 transition-colors"
            >
              Post Now
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center">
          <button onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {step === 1 && 'Choose a category'}
            {step === 2 && selectedGroup}
            {step === 3 && 'Include some details'}
            {step === 4 && 'Upload Photos'}
            {step === 5 && 'Set your price'}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Create;