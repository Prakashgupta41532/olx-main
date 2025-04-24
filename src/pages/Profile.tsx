import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, uploadAvatar, UserProfile } from '../lib/api/profile';
import { Camera, Edit, Save, X, MapPin, Mail, Phone, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    username: '',
    phone_number: '',
    location: '',
    bio: '',
    website: '',
    social_links: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile();
        
        // If we have user data but no profile data, create a basic profile with user data
        if (user && (!profileData || Object.keys(profileData).length <= 2)) {
          const basicProfile = {
            id: user.id,
            email: user.email || '',
            full_name: '',
            username: '',
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at || new Date().toISOString()
          };
          setProfile(basicProfile);
          
          // Initialize form data with user data
          setFormData({
            email: user.email || '',
            full_name: '',
            username: '',
            phone_number: '',
            location: '',
            bio: '',
            website: '',
            social_links: {
              facebook: '',
              twitter: '',
              instagram: '',
              linkedin: ''
            }
          });
        } else if (profileData) {
          // We have profile data, use it
          setProfile(profileData);
          
          // Initialize form data with profile data
          setFormData({
            email: profileData.email || user?.email || '',
            full_name: profileData.full_name || '',
            username: profileData.username || '',
            phone_number: profileData.phone_number || '',
            location: profileData.location || '',
            bio: profileData.bio || '',
            website: profileData.website || '',
            social_links: {
              facebook: profileData.social_links?.facebook || '',
              twitter: profileData.social_links?.twitter || '',
              instagram: profileData.social_links?.instagram || '',
              linkedin: profileData.social_links?.linkedin || ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);
  
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    try {
      setUploading(true);
      const avatarUrl = await uploadAvatar(file);
      
      // Add a cache-busting parameter to the URL
      const cacheBustedUrl = `${avatarUrl}?t=${Date.now()}`;
      
      // Update profile state with the new avatar URL
      setProfile(prev => {
        if (!prev) return null;
        return { ...prev, avatar_url: cacheBustedUrl };
      });
      
      // Also update the form data to keep it in sync
      setFormData(prev => ({
        ...prev,
        avatar_url: cacheBustedUrl
      }));
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'social_links') {
        setFormData(prev => ({
          ...prev,
          social_links: {
            ...prev.social_links,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const updatedProfile = await updateProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-brand-600 to-brand-400 h-48">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div 
                className={`h-32 w-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden ${uploading ? 'opacity-50' : ''}`}
                onClick={handleAvatarClick}
              >
                {profile?.avatar_url ? (
                  <img 
                    src={`${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}refresh=${Date.now()}`} 
                    alt={profile.full_name || 'User'} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-4xl text-gray-400">
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </div>
                )}
                {!uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                    <Camera className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>
          <div className="absolute top-4 right-4">
            {!editing ? (
              <button 
                onClick={() => setEditing(true)}
                className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md transition-all duration-200"
              >
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button 
                onClick={() => setEditing(false)}
                className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md transition-all duration-200"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="pt-20 px-8 pb-8">
          {!editing ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name || 'No Name Set'}
                </h1>
                <p className="text-gray-500">
                  @{profile?.username || 'username'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {profile?.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail size={18} />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile?.phone_number && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone size={18} />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin size={18} />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe size={18} />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
              
              {profile?.bio && (
                <div className="border-t border-gray-100 pt-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                  <p className="text-gray-600 whitespace-pre-line">{profile.bio}</p>
                </div>
              )}
              
              {profile?.social_links && Object.values(profile.social_links).some(link => link) && (
                <div className="border-t border-gray-100 pt-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Social Links</h2>
                  <div className="flex space-x-4">
                    {profile.social_links.facebook && (
                      <a href={profile.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-600">
                        <Facebook size={20} />
                      </a>
                    )}
                    {profile.social_links.twitter && (
                      <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-600">
                        <Twitter size={20} />
                      </a>
                    )}
                    {profile.social_links.instagram && (
                      <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-600">
                        <Instagram size={20} />
                      </a>
                    )}
                    {profile.social_links.linkedin && (
                      <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-600">
                        <Linkedin size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              <div className="border-t border-gray-100 pt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Info</h2>
                <div className="space-y-2">
                  <p className="text-gray-600">Member since: {new Date(profile?.created_at || '').toLocaleDateString()}</p>
                  <button 
                    onClick={() => signOut()}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read Only)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="https://"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Facebook size={16} className="mr-2" /> Facebook
                    </label>
                    <input
                      type="url"
                      name="social_links.facebook"
                      value={formData.social_links.facebook}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Twitter size={16} className="mr-2" /> Twitter
                    </label>
                    <input
                      type="url"
                      name="social_links.twitter"
                      value={formData.social_links.twitter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Instagram size={16} className="mr-2" /> Instagram
                    </label>
                    <input
                      type="url"
                      name="social_links.instagram"
                      value={formData.social_links.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Linkedin size={16} className="mr-2" /> LinkedIn
                    </label>
                    <input
                      type="url"
                      name="social_links.linkedin"
                      value={formData.social_links.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;