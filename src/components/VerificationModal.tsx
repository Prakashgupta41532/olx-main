import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationModal = ({ isOpen, onClose }: VerificationModalProps) => {
  const { requestVerification } = useAuth();

  const handleVerification = async () => {
    try {
      await requestVerification();
      toast.success('Verification request submitted successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit verification request');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">Get Verified</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Verified Badge</h3>
                <p className="text-sm text-gray-500">
                  Stand out with a verified badge on your profile and listings
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Monthly Subscription</h3>
                <p className="text-sm text-gray-500">
                  CA$10/month - Cancel anytime
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary-600 mr-2" />
                  Priority listing placement
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary-600 mr-2" />
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary-600 mr-2" />
                  Dedicated support
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleVerification}
              className="w-full py-2.5 px-4 bg-gradient-primary text-white font-medium rounded-xl hover:shadow-glow transition-all"
            >
              Get Verified Now
            </button>
            <p className="mt-2 text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VerificationModal;