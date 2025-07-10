import { useState, useEffect } from 'react';
import { FaUser, FaArrowLeft, FaSave, FaSpinner, FaEnvelope, FaPhone, FaUserEdit, FaCheckCircle, FaExclamationTriangle, FaCamera, FaImage, FaTimes } from 'react-icons/fa';
import axios from 'axios';

// Custom CSS animations
const customStyles = `
  @keyframes gradient-x {
    0%, 100% {
      transform: translateX(-50%);
    }
    50% {
      transform: translateX(50%);
    }
  }
  
  @keyframes gradient-y {
    0%, 100% {
      transform: translateY(-50%);
    }
    50% {
      transform: translateY(50%);
    }
  }
  
  @keyframes float-slow {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-30px) rotate(1deg);
    }
    66% {
      transform: translateY(-20px) rotate(-1deg);
    }
  }
  
  @keyframes float-reverse {
    0%, 100% {
      transform: translateY(0px) translateX(0px) rotate(0deg);
    }
    33% {
      transform: translateY(20px) translateX(-10px) rotate(-1deg);
    }
    66% {
      transform: translateY(-10px) translateX(10px) rotate(1deg);
    }
  }
  
  @keyframes pulse-slow {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }
  
  @keyframes twinkle {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    25% {
      opacity: 0.8;
      transform: scale(1.2);
    }
    50% {
      opacity: 1;
      transform: scale(0.8);
    }
    75% {
      opacity: 0.6;
      transform: scale(1.1);
    }
  }
  
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes spin-reverse {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
  
  @keyframes aurora {
    0%, 100% {
      opacity: 0.3;
      transform: translateX(-100%);
    }
    50% {
      opacity: 0.8;
      transform: translateX(100%);
    }
  }
  
  .animate-gradient-x {
    animation: gradient-x 8s ease-in-out infinite;
  }
  
  .animate-gradient-y {
    animation: gradient-y 10s ease-in-out infinite;
  }
  
  .animate-float-slow {
    animation: float-slow 6s ease-in-out infinite;
  }
  
  .animate-float-reverse {
    animation: float-reverse 8s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
  }
  
  .animate-twinkle {
    animation: twinkle 3s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  .animate-spin-reverse {
    animation: spin-reverse 15s linear infinite;
  }
  
  .animate-aurora {
    animation: aurora 12s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

export default function EditProfile() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('🔍 Loading user data for edit profile...');
        
        // First check localStorage for stored user data
        const storedUserData = localStorage.getItem('userData');
        console.log('📦 Checking localStorage userData:', storedUserData);
        
        if (storedUserData) {
          try {
            const parsedData = JSON.parse(storedUserData);
            console.log('✅ Found stored user data:', parsedData);
            
            // Make sure it's not guest user data
            if (parsedData.email && parsedData.email !== 'guest@example.com') {
              setUserData({
                name: parsedData.name || '',
                email: parsedData.email || '',
                phone: parsedData.phone || '',
                profilePhoto: parsedData.avatar || parsedData.profilePhoto || null
              });
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('❌ Error parsing stored user data:', error);
          }
        }
        
        // Check individual localStorage items
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const authToken = localStorage.getItem('authToken');
        
        console.log('🔍 Individual localStorage items:', { userId, userEmail, authToken });
        
        // If we have email, create user data
        if (userEmail && userEmail !== 'guest@example.com') {
          console.log('📧 Creating user data from userEmail:', userEmail);
          setUserData({
            name: userEmail.split('@')[0],
            email: userEmail,
            phone: '',
            profilePhoto: null
          });
          setIsLoading(false);
          return;
        }
        
        // Try to fetch from backend if we have userId
        if (userId) {
          console.log('📡 Fetching user data from backend for userId:', userId);
          try {
            const response = await axios.get(`http://localhost:8080/api/user/${userId}`, {
              headers: {
                'Content-Type': 'application/json',
                ...(authToken && { Authorization: `Bearer ${authToken}` })
              }
            });
            
            if (response && response.data) {
              setUserData({
                name: response.data.name || response.data.email?.split('@')[0] || '',
                email: response.data.email || userEmail || '',
                phone: response.data.phone || '',
                profilePhoto: response.data.avatar || null
              });
              setIsLoading(false);
              return;
            }
          } catch (apiError) {
            console.error('❌ API Error:', apiError.response?.status, apiError.message);
          }
        }
        
        // Fallback: redirect to login if no user data
        console.log('👻 No user data found, redirecting to login');
        window.location.href = '/';
        
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        window.location.href = '/';
      }
    };
    
    fetchUserData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!userData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    
    if (userData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(userData.phone)) {
      newErrors.phone = 'Phone number format is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveMessage('Please fix the errors above');
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      // Handle photo upload first if there's a new photo
      let photoUrl = userData.profilePhoto;
      if (selectedPhoto) {
        setIsUploadingPhoto(true);
        try {
          const formData = new FormData();
          formData.append('file', selectedPhoto);
          
          // Upload avatar to the correct backend endpoint
          const photoResponse = await axios.post(`http://localhost:8080/api/user/${userId}/avatar`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(authToken && { Authorization: `Bearer ${authToken}` })
            }
          });
          
          if (photoResponse && photoResponse.data && photoResponse.data.avatar) {
            photoUrl = photoResponse.data.avatar;
            console.log('✅ Avatar uploaded successfully:', photoUrl);
          }
        } catch (photoError) {
          console.error('❌ Photo upload failed:', photoError);
          
          // Check for specific error types
          if (photoError.response && photoError.response.data) {
            const errorMsg = photoError.response.data.message || photoError.response.data.error;
            if (errorMsg && (errorMsg.includes('quota') || errorMsg.includes('large') || errorMsg.includes('size'))) {
              setSaveMessage('Image is too large for the database. Please use a smaller image (under 1.5MB).');
              setIsSaving(false);
              return;
            }
          }
          
          // Continue with profile update even if photo upload fails
          photoUrl = photoPreview; // Use local preview as fallback
        } finally {
          setIsUploadingPhoto(false);
        }
      }
      
      const updatedUserData = {
        ...userData,
        avatar: photoUrl,
        profilePhoto: photoUrl // Keep both for backward compatibility
      };
      
      if (userId) {
        // Try to update via API
        try {
          const response = await axios.put(`http://localhost:8080/api/user/${userId}`, updatedUserData, {
            headers: {
              'Content-Type': 'application/json',
              ...(authToken && { Authorization: `Bearer ${authToken}` })
            }
          });
          
          if (response && response.data) {
            console.log('✅ Profile updated successfully:', response.data);
            setSaveMessage('Profile updated successfully!');
          }
        } catch (apiError) {
          console.error('❌ API Error updating profile:', apiError);
          setSaveMessage('Note: Changes saved locally, but server update failed');
        }
      }
      
      // Always update localStorage regardless of API success
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      localStorage.setItem('userEmail', updatedUserData.email);
      
      // Update local state
      setUserData(updatedUserData);
      
      setSaveMessage('Profile updated successfully!');
      
      // Clear the selected photo since it's now saved
      setSelectedPhoto(null);
      setPhotoPreview(null);
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSaveMessage('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 1.5MB for better database performance)
      if (file.size > 1.5 * 1024 * 1024) {
        setSaveMessage('Image size should be less than 1.5MB. Please compress your image.');
        return;
      }
      
      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setSaveMessage('');
    }
  };

  const handlePhotoRemove = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setUserData(prev => ({
      ...prev,
      profilePhoto: null,
      avatar: null
    }));
  };

  const triggerPhotoUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = handlePhotoSelect;
    fileInput.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden flex items-center justify-center">
        {/* Enhanced Animated Background Elements with Green Theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main large circles with green theme */}
          <div className="absolute -top-4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-green-600/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob" style={{borderRadius: '50%'}}></div>
          <div className="absolute -top-4 -right-4 w-80 h-80 bg-gradient-to-r from-green-400/15 to-teal-500/15 rounded-full mix-blend-screen filter blur-xl opacity-25 animate-blob animation-delay-2000" style={{borderRadius: '50%'}}></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-teal-400/20 to-cyan-500/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob animation-delay-4000" style={{borderRadius: '50%'}}></div>
          
          {/* Additional green accent circles */}
          <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-gradient-to-r from-lime-400/15 to-emerald-500/15 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-blob-reverse animation-delay-1000" style={{borderRadius: '50%'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-green-300/15 to-emerald-400/15 rounded-full mix-blend-screen filter blur-xl opacity-25 animate-blob-slow animation-delay-3000" style={{borderRadius: '50%'}}></div>
          
          {/* Center floating circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-r from-emerald-300/10 to-green-400/10 rounded-full mix-blend-screen filter blur-2xl opacity-20 animate-float-slow" style={{borderRadius: '50%'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <FaUser className="text-white text-2xl" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-emerald-400 rounded-full mx-auto animate-ping opacity-20"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Profile</h2>
          <p className="text-gray-300">Preparing your personalized workspace...</p>
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark theme background with green accents */}
      <div className="absolute inset-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"></div>
        
        {/* Animated green circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-green-600/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob" style={{borderRadius: '50%'}}></div>
          <div className="absolute -top-4 -right-4 w-80 h-80 bg-gradient-to-r from-green-400/15 to-teal-500/15 rounded-full mix-blend-screen filter blur-xl opacity-25 animate-blob animation-delay-2000" style={{borderRadius: '50%'}}></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-teal-400/20 to-cyan-500/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob animation-delay-4000" style={{borderRadius: '50%'}}></div>
          <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-gradient-to-r from-lime-400/15 to-emerald-500/15 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-blob-reverse animation-delay-1000" style={{borderRadius: '50%'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-green-300/15 to-emerald-400/15 rounded-full mix-blend-screen filter blur-xl opacity-25 animate-blob-slow animation-delay-3000" style={{borderRadius: '50%'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-r from-emerald-300/10 to-green-400/10 rounded-full mix-blend-screen filter blur-2xl opacity-20 animate-float-slow" style={{borderRadius: '50%'}}></div>
        </div>
      </div>
      {/* Enhanced Navigation Header */}
      <nav className="bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-emerald-500/30 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Back Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="group flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-emerald-400 transition-all duration-300 hover:scale-105 rounded-xl hover:bg-emerald-500/10"
              >
                <div className="p-1.5 rounded-lg bg-gray-800 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform duration-300" />
                </div>
                <span className="font-semibold text-sm">Back to Dashboard</span>
              </button>
            </div>
            
            {/* Right Section - User Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{userData.name || 'Loading...'}</p>
                <p className="text-xs text-gray-400">{userData.email || ''}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center overflow-hidden">
                {photoPreview || userData.profilePhoto ? (
                  <img 
                    src={photoPreview || userData.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-white text-sm" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Border Gradient */}
        <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500"></div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Enhanced Page Header with Photo Upload */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="relative group">
            {/* Profile Photo Container */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              {/* Photo Display */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-emerald-400/50 bg-gradient-to-r from-emerald-600 to-green-700 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                {photoPreview || userData.profilePhoto ? (
                  <img 
                    src={photoPreview || userData.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-white text-4xl transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                )}
                
                {/* Upload Indicator */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-10">
                    <FaSpinner className="text-white text-2xl animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Camera Button */}
              <button
                onClick={triggerPhotoUpload}
                className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-20 cursor-pointer"
              >
                <FaCamera className="text-white text-sm transition-transform duration-300 hover:scale-110" />
              </button>
            </div>
            
            {/* Upload Instructions */}
            <div className="mb-6">
              <button
                onClick={triggerPhotoUpload}
                className="inline-flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-all duration-300 hover:underline hover:scale-105 group"
              >
                <span className="relative">
                  {photoPreview || userData.profilePhoto ? 'Change Photo' : 'Upload Profile Photo'}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </button>
              <p className="text-gray-500 text-xs mt-2 font-medium tracking-wide uppercase opacity-75">JPG, PNG or GIF • Max 1.5MB</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-black bg-gradient-to-r from-white via-gray-100 to-emerald-100 bg-clip-text text-transparent leading-tight tracking-tight">
              Edit Profile
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-emerald-500 rounded-full"></div>
              <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"></div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-green-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-300 text-lg font-light leading-relaxed max-w-md mx-auto">
              <span className="font-medium text-emerald-400">Personalize</span> your workspace with updated information and preferences
            </p>
          </div>
        </div>

        {/* Enhanced Form Card */}
        <div className="group relative">
          {/* Card glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          
          <div className="relative bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-emerald-500/30 transition-all duration-500 hover:shadow-2xl animate-fade-in-up animation-delay-300">
            <div className="p-8 sm:p-10">
              {/* Form */}
              <div className="space-y-8">
                {/* Name Field */}
                <div className="group/field animate-slide-in-left animation-delay-500">
                  <label className="flex items-center space-x-3 text-sm font-bold text-gray-200 mb-4 group-hover/field:text-emerald-300 transition-colors duration-300">
                    <div className="p-2 rounded-xl bg-emerald-500/20 group-hover/field:bg-emerald-500/30 transition-all duration-300 group-hover/field:scale-110">
                      <FaUser className="text-emerald-400 text-sm" />
                    </div>
                    <span className="tracking-wide">
                      Full Name 
                      <span className="text-emerald-400 font-black">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 font-medium text-white placeholder-gray-400 hover:border-emerald-400 hover:shadow-md bg-gray-700/50 ${
                        errors.name 
                          ? 'border-red-400 bg-red-900/20 focus:border-red-400' 
                          : 'border-gray-600 focus:border-emerald-500 hover:bg-gray-700/70'
                      }`}
                      placeholder="e.g. John Smith"
                    />
                    {/* Input glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.name && (
                    <div className="flex items-center space-x-2 mt-3 animate-shake">
                      <FaExclamationTriangle className="text-red-500 text-sm" />
                      <p className="text-sm text-red-600 font-medium">{errors.name}</p>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="group/field animate-slide-in-left animation-delay-700">
                  <label className="flex items-center space-x-3 text-sm font-bold text-gray-200 mb-4 group-hover/field:text-green-300 transition-colors duration-300">
                    <div className="p-2 rounded-xl bg-green-500/20 group-hover/field:bg-green-500/30 transition-all duration-300 group-hover/field:scale-110">
                      <FaEnvelope className="text-green-400 text-sm" />
                    </div>
                    <span className="tracking-wide">
                      Email Address 
                      <span className="text-green-400 font-black">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 font-medium text-white placeholder-gray-400 hover:border-green-400 hover:shadow-md bg-gray-700/50 ${
                        errors.email 
                          ? 'border-red-400 bg-red-900/20 focus:border-red-400' 
                          : 'border-gray-600 focus:border-green-500 hover:bg-gray-700/70'
                      }`}
                      placeholder="e.g. john@company.com"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-green-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.email && (
                    <div className="flex items-center space-x-2 mt-3 animate-shake">
                      <FaExclamationTriangle className="text-red-400 text-sm" />
                      <p className="text-sm text-red-400 font-medium">{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="group/field animate-slide-in-left animation-delay-900">
                  <label className="flex items-center space-x-3 text-sm font-bold text-gray-200 mb-4 group-hover/field:text-purple-300 transition-colors duration-300">
                    <div className="p-2 rounded-xl bg-purple-500/20 group-hover/field:bg-purple-500/30 transition-all duration-300 group-hover/field:scale-110">
                      <FaPhone className="text-purple-400 text-sm" />
                    </div>
                    <span className="tracking-wide">
                      Phone Number 
                      <span className="text-gray-400 font-medium text-xs ml-1 tracking-normal">(Optional)</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 font-medium text-white placeholder-gray-400 hover:border-purple-400 hover:shadow-md bg-gray-700/50 ${
                        errors.phone 
                          ? 'border-red-400 bg-red-900/20 focus:border-red-400' 
                          : 'border-gray-600 focus:border-purple-500 hover:bg-gray-700/70'
                      }`}
                      placeholder="e.g. +1 (555) 123-4567"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.phone && (
                    <div className="flex items-center space-x-2 mt-3 animate-shake">
                      <FaExclamationTriangle className="text-red-400 text-sm" />
                      <p className="text-sm text-red-400 font-medium">{errors.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Save Message */}
              {saveMessage && (
                <div className={`mt-8 p-6 rounded-xl border-2 shadow-lg animate-fade-in-up ${
                  saveMessage.includes('Error') || saveMessage.includes('fix') 
                    ? 'bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-300 border-red-500/50' 
                    : 'bg-gradient-to-r from-green-900/50 to-emerald-800/50 text-green-300 border-green-500/50'
                }`}>
                  <div className="flex items-center space-x-3">
                    {saveMessage.includes('Error') || saveMessage.includes('fix') ? (
                      <FaExclamationTriangle className="text-red-400 text-xl" />
                    ) : (
                      <FaCheckCircle className="text-green-400 text-xl" />
                    )}
                    <p className="font-semibold text-lg">{saveMessage}</p>
                  </div>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-6 animate-fade-in-up animation-delay-1000">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="group flex-1 px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300 text-lg" />
                    <span className="text-lg tracking-wide">Cancel</span>
                  </span>
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 disabled:hover:scale-100 disabled:hover:translate-y-0 overflow-hidden"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <span className="relative flex items-center justify-center space-x-3">
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin text-xl" />
                        <span className="text-lg font-bold tracking-wide">Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="group-hover:scale-110 transition-transform duration-300 text-lg" />
                        <span className="text-lg font-bold tracking-wide">Save Changes</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Additional Info */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-1200">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gray-800/80 backdrop-blur-md rounded-xl border border-emerald-500/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-25"></div>
            </div>
            <p className="text-sm text-gray-300 font-semibold tracking-wide">
              <span className="text-emerald-400"></span> Your information is 
              <span className="text-emerald-300 font-bold"> secure</span> and 
              <span className="text-emerald-300 font-bold"> encrypted</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
