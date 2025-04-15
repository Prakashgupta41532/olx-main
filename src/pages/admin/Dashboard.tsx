import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Users, ShoppingBag, AlertCircle, Settings } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          </div>
          <nav className="mt-4">
            <Link
              to="/admin"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Users className="h-5 w-5 mr-2" />
              Users
            </Link>
            <Link
              to="/admin/listings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Listings
            </Link>
            <Link
              to="/admin/reports"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              Reports
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route
              index
              element={
                <div>
                  <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                      <p className="text-3xl font-bold text-primary-600">1,234</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700">Active Listings</h3>
                      <p className="text-3xl font-bold text-primary-600">567</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700">Pending Reports</h3>
                      <p className="text-3xl font-bold text-primary-600">23</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700">Verification Requests</h3>
                      <p className="text-3xl font-bold text-primary-600">45</p>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="listings" element={<div>Listings Management</div>} />
            <Route path="reports" element={<div>Reports Management</div>} />
            <Route path="settings" element={<div>Admin Settings</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;