import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Listings from './pages/Listings';
import CreateListing from './pages/listings/Create';
import Categories from './pages/Categories';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/admin/Dashboard';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="pt-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/create" element={<CreateListing />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                className: 'rounded-lg shadow-lg',
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }} 
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App