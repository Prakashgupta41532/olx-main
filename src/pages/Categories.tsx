import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Car,
  Home,
  Sofa,
  Shirt,
  Dumbbell,
  Book,
  Gem,
  Laptop,
  Camera,
  Headphones,
  Watch,
  Baby,
  Bike,
  Palette,
  Wrench,
  Guitar,
  Gamepad,
  DollarSign,
  Gift
} from 'lucide-react';

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: 'Electronics',
      icon: Smartphone,
      subcategories: ['Phones', 'Tablets', 'Accessories'],
      count: 1234
    },
    {
      id: 2,
      name: 'Vehicles',
      icon: Car,
      subcategories: ['Cars', 'Motorcycles', 'Parts'],
      count: 567
    },
    {
      id: 3,
      name: 'Real Estate',
      icon: Home,
      subcategories: ['Apartments', 'Houses', 'Rooms'],
      count: 890
    },
    {
      id: 4,
      name: 'Furniture',
      icon: Sofa,
      subcategories: ['Living Room', 'Bedroom', 'Office'],
      count: 432
    },
    {
      id: 5,
      name: 'Fashion',
      icon: Shirt,
      subcategories: ['Men', 'Women', 'Kids'],
      count: 2345
    },
    {
      id: 6,
      name: 'Sports',
      icon: Dumbbell,
      subcategories: ['Equipment', 'Clothing', 'Accessories'],
      count: 678
    },
    {
      id: 7,
      name: 'Books',
      icon: Book,
      subcategories: ['Fiction', 'Non-Fiction', 'Textbooks'],
      count: 901
    },
    {
      id: 8,
      name: 'Collectibles',
      icon: Gem,
      subcategories: ['Cards', 'Coins', 'Art'],
      count: 345
    },
    {
      id: 9,
      name: 'Computers',
      icon: Laptop,
      subcategories: ['Laptops', 'Desktops', 'Parts'],
      count: 789
    },
    {
      id: 10,
      name: 'Cameras',
      icon: Camera,
      subcategories: ['Digital', 'Film', 'Lenses'],
      count: 234
    },
    {
      id: 11,
      name: 'Audio',
      icon: Headphones,
      subcategories: ['Headphones', 'Speakers', 'Accessories'],
      count: 567
    },
    {
      id: 12,
      name: 'Watches',
      icon: Watch,
      subcategories: ['Luxury', 'Smart', 'Classic'],
      count: 123
    },
    {
      id: 13,
      name: 'Baby & Kids',
      icon: Baby,
      subcategories: ['Toys', 'Clothing', 'Gear'],
      count: 890
    },
    {
      id: 14,
      name: 'Bikes',
      icon: Bike,
      subcategories: ['Mountain', 'Road', 'Electric'],
      count: 456
    },
    {
      id: 15,
      name: 'Art',
      icon: Palette,
      subcategories: ['Paintings', 'Prints', 'Sculptures'],
      count: 789
    },
    {
      id: 16,
      name: 'Tools',
      icon: Wrench,
      subcategories: ['Power Tools', 'Hand Tools', 'Garden'],
      count: 345
    },
    {
      id: 17,
      name: 'Music',
      icon: Guitar,
      subcategories: ['Instruments', 'Equipment', 'Accessories'],
      count: 678
    },
    {
      id: 18,
      name: 'Gaming',
      icon: Gamepad,
      subcategories: ['Consoles', 'Games', 'Accessories'],
      count: 901
    },
    {
      id: 19,
      name: 'Services',
      icon: DollarSign,
      subcategories: ['Professional', 'Personal', 'Business'],
      count: 234
    },
    {
      id: 20,
      name: 'Other',
      icon: Gift,
      subcategories: ['Miscellaneous', 'Unique Items', 'Special'],
      count: 567
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-soft p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-primary-50 p-3 rounded-xl">
                  <category.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.count.toLocaleString()} listings
                  </p>
                  <div className="mt-2">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        to={`/listings?category=${category.name.toLowerCase()}&subcategory=${sub.toLowerCase()}`}
                        className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-2 mb-2 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
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

export default Categories;