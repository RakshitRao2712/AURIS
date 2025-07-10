import { useState, useEffect, useRef } from 'react';
import { FaUser, FaFile, FaImage, FaArrowRight, FaFilePdf, FaTimes, FaQuestion } from 'react-icons/fa';
import axios from 'axios';
import styles from '../styles/Dashboard.module.css';
import Message from './Message';

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
const [aiResponse, setAiResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);

  // Load user data from localStorage (set after login/registration)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check localStorage for stored user data (this is set immediately after login/registration)
        const storedUserData = localStorage.getItem('userData');
        
        if (storedUserData) {
          try {
            const parsedData = JSON.parse(storedUserData);
            
            // Make sure it's not guest user data
            if (parsedData.email && parsedData.email !== 'guest@example.com') {
              setUserData(parsedData);
              setIsLoadingUserData(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing stored user data:', error);
          }
        }
        
        // Check individual localStorage items
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const authToken = localStorage.getItem('authToken');
        
        // If we have email, create user data
        if (userEmail && userEmail !== 'guest@example.com') {
          const userData = {
            name: userEmail.split('@')[0],
            email: userEmail,
            phone: '',
            id: userId || null
          };
          setUserData(userData);
          setIsLoadingUserData(false);
          return;
        }
        
        // Try to fetch from backend if we have userId
        if (userId) {
          try {
            const response = await axios.get(`http://localhost:8080/api/user/${userId}`, {
              headers: {
                'Content-Type': 'application/json',
                ...(authToken && { Authorization: `Bearer ${authToken}` })
              }
            });
            
            if (response && response.data) {
              const userData = {
                name: response.data.name || response.data.email?.split('@')[0] || 'User',
                email: response.data.email || userEmail || '',
                phone: response.data.phone || '',
                id: response.data.id || userId
              };
              setUserData(userData);
              setIsLoadingUserData(false);
              return;
            }
          } catch (apiError) {
            console.error('API Error:', apiError.response?.status, apiError.message);
          }
        }
        
        // Fallback: Guest user
        setUserData({ name: 'Guest User', email: 'guest@example.com' });
        setIsLoadingUserData(false);
        
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        
        // Emergency fallback
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const parsedData = JSON.parse(storedUserData);
            setUserData(parsedData);
          } catch (parseError) {
            setUserData({ name: 'Guest User', email: 'guest@example.com' });
          }
        } else {
          setUserData({ name: 'Guest User', email: 'guest@example.com' });
        }
        setIsLoadingUserData(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Set auth checked to true immediately since we'll handle it during actual requests
  useEffect(() => {
    setAuthChecked(true);
  }, []);
  
  // Typewriter effect for AI response
  useEffect(() => {
    if (showResponse && aiResponse) {
      setConversationHistory((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponse },
      ]);
    }
  }, [showResponse, aiResponse]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, isLoading]);

  useEffect(() => {
    if (aiResponse && showResponse) {
      setIsTyping(true);
      setDisplayedResponse('');
      let index = 0;
      
      const typeWriter = setInterval(() => {
        if (index < aiResponse.length) {
          setDisplayedResponse(prev => prev + aiResponse.charAt(index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(typeWriter);
        }
      }, 15); // Adjust speed here (lower = faster)
      
      return () => clearInterval(typeWriter);
    }
  }, [aiResponse, showResponse]);

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;
    
    // Hide welcome screen when first message is sent
    if (showWelcome) {
      setShowWelcome(false);
    }
    
    // Add user message to conversation history
    const userMessage = { role: 'user', content: prompt };
    setConversationHistory(prev => [...prev, userMessage]);
    
    // Note: Authentication will be checked during the actual API call
    
    setIsLoading(true);
    setShowResponse(false);
    
    try {
      console.log('🚀 Sending prompt:', prompt);
      
      // Get user email from userData or localStorage
      const userEmail = userData.email || localStorage.getItem('userEmail') || '';
      
      if (selectedFile) {
        // Handle file upload with prompt
        await handleFileWithPrompt(selectedFile, prompt, userEmail);
      } else {
        // Handle text-only chat
        await handleTextChat(prompt, userEmail);
      }
      
    } catch (error) {
      console.error('❌ Error sending prompt:', error);
      
      let errorMessage = 'Sorry, there was an error processing your request. Please try again.';
      
      if (selectedFile) {
        errorMessage = 'Failed to process the uploaded file. Please try again or contact support.';
      }
      
      setAiResponse(errorMessage);
      setShowResponse(true);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };
  
  const handleTextChat = async (message, userEmail) => {
    try {
      console.log('📤 Sending chat request with email:', userEmail);
      console.log('📤 Request payload:', { email: userEmail, message: message });
      
      const response = await axios.post('http://localhost:8080/api/chat/generate', {
        email: userEmail,
        password: '', // Not needed for session-based auth
        message: message
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // Important for session cookies
      });
      
      console.log('✅ Chat response:', response.data);
      setAiResponse(response.data.aiResponse);
      
      // Small delay before showing response for pop-in effect
      setTimeout(() => {
        setShowResponse(true);
      }, 100);
      
      setPrompt('');
    } catch (error) {
      console.error('❌ Chat API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setAiResponse('🔒 Authentication Required\n\nYou need to be logged in to use this feature. Please:\n\n1. Go to http://localhost:8080/\n2. Click "LOGIN" and sign in\n3. Then return to this page and try again');
      } else if (error.response?.status === 0) {
        setAiResponse('Cannot connect to the server. Please make sure the backend is running on http://localhost:8080/');
      } else {
        setAiResponse(`Error: ${error.response?.data || error.message}`);
      }
      setShowResponse(true);
      setPrompt('');
      throw error; // Re-throw to be caught by the outer try-catch
    }
  };
  
  const handleFileWithPrompt = async (file, question, userEmail) => {
    try {
      if (file.type === 'pdf') {
        // PDF requires two-step process: upload first, then ask question
        await handlePdfUploadAndQuestion(file, question);
      } else if (file.type === 'image') {
        // Image can be processed in one step
        await handleImageUploadWithQuestion(file, question);
      }
      
      setPrompt('');
      setSelectedFile(null); // Clear selected file after successful upload
      
    } catch (error) {
      console.error('❌ File upload error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Sorry, there was an error processing your file and question.';
      
      if (error.response?.status === 401) {
        errorMessage = '🔒 Authentication Required\n\nYou need to be logged in to upload files. Please:\n\n1. Go to http://localhost:8080/\n2. Click "LOGIN" and sign in\n3. Then return to this page and try again';
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Please try a smaller file.';
      } else if (error.response?.status === 415) {
        errorMessage = 'File type not supported. Please try a different file format.';
      } else if (error.response?.status === 0) {
        errorMessage = 'Cannot connect to the server. Please make sure the backend is running.';
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setAiResponse(errorMessage);
      setShowResponse(true);
      setPrompt('');
      
      throw error; // Re-throw to be caught by the outer try-catch
    }
  };
  
  const handlePdfUploadAndQuestion = async (file, question) => {
    console.log('📤 Starting PDF upload and question process:', {
      fileName: file.name,
      question: question
    });
    
    try {
      // Step 1: Upload the PDF file
      setLoadingStep('Uploading PDF file...');
      const formData = new FormData();
      formData.append('file', file.file);
      
      const uploadResponse = await axios.post('http://localhost:8080/api/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      console.log('✅ PDF upload response:', uploadResponse.data);
      
      // Check if upload was successful
      if (!uploadResponse.data || uploadResponse.data.includes('error')) {
        throw new Error('PDF upload failed: ' + uploadResponse.data);
      }
      
      // Step 2: Ask the question about the uploaded PDF
      setLoadingStep('Processing your question...');
      const questionParams = new URLSearchParams();
      questionParams.append('question', question);
      
      const questionResponse = await axios.post('http://localhost:8080/api/pdf/ask', questionParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      });
      
      console.log('✅ PDF question response:', questionResponse.data);
      
      // Extract and set the AI response
      let aiResponseText = '';
      if (typeof questionResponse.data === 'string') {
        aiResponseText = questionResponse.data;
      } else {
        aiResponseText = JSON.stringify(questionResponse.data, null, 2);
      }
      
      // Check if we got a valid response
      if (!aiResponseText || aiResponseText.trim() === '') {
        aiResponseText = 'No response received from AI. Please try asking your question again.';
      }
      
      console.log('📝 Extracted PDF AI response:', aiResponseText);
      setAiResponse(aiResponseText);
      
      // Small delay before showing response for pop-in effect
      setTimeout(() => {
        setShowResponse(true);
      }, 100);
      
    } catch (error) {
      console.error('❌ PDF processing error:', error);
      
      let errorMessage = 'Failed to process PDF and question.';
      
      if (error.response?.status === 401) {
        errorMessage = '🔒 Authentication Required\n\nYou need to be logged in to upload PDF files. Please:\n\n1. Go to http://localhost:8080/\n2. Click "LOGIN" and sign in\n3. Then return to this page and try again';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid PDF file or question format.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };
  
  const handleImageUploadWithQuestion = async (file, question) => {
    console.log('📤 Uploading image with question:', {
      fileName: file.name,
      question: question
    });
    
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('question', question);
    
    const response = await axios.post('http://localhost:8080/api/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true
    });
    
    console.log('✅ Image processing response:', response.data);
    
    // Handle different possible response formats
    let aiResponseText = '';
    if (typeof response.data === 'string') {
      aiResponseText = response.data;
    } else if (response.data && response.data.response) {
      aiResponseText = response.data.response;
    } else if (response.data && response.data.aiResponse) {
      aiResponseText = response.data.aiResponse;
    } else if (response.data && response.data.message) {
      aiResponseText = response.data.message;
    } else if (response.data && response.data.result) {
      aiResponseText = response.data.result;
    } else {
      aiResponseText = JSON.stringify(response.data, null, 2);
    }
    
    console.log('📝 Extracted image AI response:', aiResponseText);
    setAiResponse(aiResponseText);
    
    // Small delay before showing response for pop-in effect
    setTimeout(() => {
      setShowResponse(true);
    }, 100);
  };

  const handleFileSelect = (fileType) => {
    setShowFileOptions(false);
    
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    
    if (fileType === 'pdf') {
      fileInput.accept = '.pdf,application/pdf';
    } else if (fileType === 'image') {
      fileInput.accept = 'image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp';
    }
    
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile({
          file: file,
          type: fileType,
          name: file.name,
          size: file.size
        });
        console.log('Selected file:', file);
      }
    };
    
    // Trigger file picker
    fileInput.click();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative flex flex-col items-center justify-center p-8 overflow-hidden">
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
        
        {/* Medium circles for more depth */}
        <div className="absolute top-3/4 left-1/4 w-48 h-48 bg-gradient-to-r from-green-400/15 to-teal-400/15 rounded-full mix-blend-screen filter blur-lg opacity-30 animate-float animation-delay-2500" style={{borderRadius: '50%'}}></div>
        
      </div>
      {/* User Info Circle - Top Right */}
      <div className="absolute top-8 right-8">
        <div className="relative">
          <button
            onClick={() => setShowUserInfo(!showUserInfo)}
            className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 animate-fade-in backdrop-blur-md border border-white/20 group hover-glow overflow-hidden"
          >
            {userData.avatar ? (
              <img 
                src={userData.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-white group-hover:text-emerald-400 text-xl transition-colors duration-300" />
            )}
          </button>
          
          {/* User Info Dropdown - Enhanced Design */}
          {showUserInfo && !isLoadingUserData && userData.name && userData.email && userData.name !== 'Guest User' && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-6 z-50 animate-scale-in">
              <div className="text-center">
                {/* Profile Avatar */}
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
                  {userData.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-white text-2xl" />
                  )}
                </div>
                
                {/* User Info */}
                <div className="space-y-2 mb-6">
                  <h3 className="font-bold text-lg text-white">{userData.name}</h3>
                  <p className="text-sm text-gray-300 break-all">{userData.email}</p>
                  {userData.phone && (
                    <p className="text-xs text-gray-400">{userData.phone}</p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    onClick={() => {
                      window.location.href = '/edit-profile';
                    }}
                  >
                    Edit Profile
                  </button>
                  
                  <button 
                    className="w-full py-2.5 px-4 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-sm font-medium rounded-xl hover:text-white transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                    onClick={() => {
                      window.location.href = 'http://localhost:8080/';
                    }}
                  >
                    Back to Homepage
                  </button>
                  
                  <button 
                    className="w-full py-2.5 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-xl hover:text-red-300 transition-all duration-300 border border-red-500/30 hover:border-red-400/50"
                    onClick={() => {
                      // Clear all user data from localStorage
                      localStorage.removeItem('userData');
                      localStorage.removeItem('userId');
                      localStorage.removeItem('userEmail');
                      localStorage.removeItem('authToken');
                      
                      // Redirect to home page on localhost:8080
                      window.location.href = 'http://localhost:8080/';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading or Guest User State */}
          {showUserInfo && (isLoadingUserData || !userData.name || !userData.email || userData.name === 'Guest User') && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-6 z-50 animate-scale-in">
              <div className="text-center">
                {isLoadingUserData ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                      <FaUser className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-300">Loading user data...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FaUser className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-300">
                      {userData.name === 'Guest User' ? 'You are not logged in' : 'No user data available'}
                    </p>
                    <div className="space-y-2">
                      <button 
                        className="w-full py-2.5 px-4 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-all duration-300"
                        onClick={() => window.location.href = 'http://localhost:8080/login'}
                      >
                        Sign In
                      </button>
                      <button 
                        className="w-full py-2.5 px-4 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-all duration-300"
                        onClick={() => window.location.href = 'http://localhost:8080/register'}
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-6xl w-full h-full relative z-10 flex flex-col justify-center items-center">
        {/* AURIS Content - Shows when no conversation started */}
        <div className={`transition-all duration-[800ms] ease-in-out ${showWelcome ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-12 pointer-events-none'}`}>
            {/* AURIS Title - Lighter and Smaller */}
            <div className={`relative mb-3 ${styles.animateFadeIn}`}>
              {/* Background glow layers */}
              <div className="absolute inset-0 -top-4 -bottom-4">
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-16 bg-gradient-to-r from-emerald-400/20 via-green-400/20 to-teal-400/20 blur-2xl ${styles.animatePulseGentle} opacity-40`}></div>
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-12 bg-gradient-to-r from-green-300/25 via-emerald-300/25 to-cyan-300/25 blur-xl ${styles.animateFloat} opacity-35`}></div>
              </div>
              
              <h1 className="relative text-4xl md:text-5xl font-bold tracking-tight leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="bg-gradient-to-r from-emerald-300 via-green-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent filter drop-shadow-sm">
                  AURIS
                </span>
              </h1>
            </div>
            
            {/* Clean Subtitle Even Closer and Smaller */}
          <div className={`relative mb-8 ${styles.animateFadeIn}`}>
              <p className="text-lg md:text-xl font-light tracking-wide leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100 bg-clip-text text-transparent">
                  How can I help you today?
                </span>
              </p>
            </div>
            
            {/* Suggestion Buttons */}
          <div className={`flex flex-wrap justify-center gap-3 mb-16 ${styles.animateFadeIn}`}>
              <button 
                onClick={() => setPrompt('What is artificial intelligence and how does it work?')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <FaQuestion className="text-emerald-400 text-sm group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm text-gray-200 font-medium group-hover:text-white">Ask Questions</span>
              </button>
              
              <button 
                onClick={() => setPrompt('Analyze this document and summarize the key points')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <FaFile className="text-green-400 text-sm group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm text-gray-200 font-medium group-hover:text-white">Analyze images</span>
              </button>
              
              <button 
                onClick={() => setPrompt('Help me write a professional email')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <FaArrowRight className="text-teal-400 text-sm group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm text-gray-200 font-medium group-hover:text-white">Help me write</span>
              </button>
            </div>
        </div>
        
        {/* Chat Messages Display */}
        {(conversationHistory.length > 0 || isLoading) && (
          <div className={`flex-1 flex flex-col w-full max-w-4xl mx-auto ${styles.animateFadeIn} min-h-0 absolute top-8 left-1/2 transform -translate-x-1/2`}>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-2 px-4 scroll-smooth pb-6" style={{maxHeight: 'calc(100vh - 200px)', minHeight: 'calc(100vh - 200px)'}}>
              {conversationHistory.map((message, index) => (
                <Message 
                  key={index} 
                  message={message} 
                  onCopy={() => {
                    navigator.clipboard.writeText(message.content);
                    console.log('✅ Message copied to clipboard');
                  }}
                />
              ))}
              
              {/* Loading indicator for AI response */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-gray-600 text-sm ml-2">{loadingStep || 'AI is thinking...'}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Prompt Input Area - Bottom Center perfectly aligned */}
      <div className={`absolute bottom-8 left-8 right-8 flex justify-center z-50 ${styles.animateFadeIn}`}>
        <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-full shadow-xl border border-white/20 p-1 hover:shadow-2xl hover:bg-white/15 transition-all duration-500 group hover-glow max-w-2xl w-full mx-20">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLoading ? (loadingStep || "AI is thinking...") : selectedFile ? `Ask a question about your ${selectedFile.type.toUpperCase()} file...` : "Enter your prompt here..."}
            disabled={isLoading}
            className={`flex-1 px-8 py-5 text-lg bg-transparent border-none outline-none text-white placeholder-gray-400 font-medium transition-all duration-300 group-hover:placeholder-gray-300 focus:placeholder-gray-200 ${isLoading ? 'cursor-not-allowed' : ''}`}
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="absolute inset-0 rounded-full ring-2 ring-emerald-500/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          {/* Loading indicator inside input */}
          {isLoading && (
            <div className="absolute right-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* File Selection Circle - Bottom Left */}
      <div className="absolute bottom-8 left-8 z-50">
        <div className="relative">
          <button
            onClick={() => setShowFileOptions(!showFileOptions)}
            className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 animate-bounce backdrop-blur-md border border-white/20 group relative"
          >
            <FaFile className="text-white group-hover:text-emerald-400 text-xl transition-colors duration-300" />
          </button>
          
          {/* File Options Dropdown */}
          {showFileOptions && (
            <div className={`absolute bottom-full left-0 mb-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-4 z-10 ${styles.animateFadeIn}`}>
              <p className="font-semibold text-white mb-3">Select File Type</p>
              {!isAuthenticated && authChecked && (
                <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                  <p className="text-xs text-yellow-300">⚠️ Login required for file uploads</p>
                </div>
              )}
              <div className="space-y-2">
                <button
                  onClick={() => handleFileSelect('pdf')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white/10 hover:bg-red-500/20 rounded-xl transition-all duration-300 group hover:scale-105 hover:shadow-md"
                >
                  <FaFilePdf className="text-red-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-200 font-medium group-hover:text-red-300">PDF File</span>
                </button>
                <button
                  onClick={() => handleFileSelect('image')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white/10 hover:bg-emerald-500/20 rounded-xl transition-all duration-300 group hover:scale-105 hover:shadow-md"
                >
                  <FaImage className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-200 font-medium group-hover:text-emerald-300">Image File</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Button Circle - Bottom Right */}
      <div className="absolute bottom-8 right-8 z-50">
        <button
          onClick={handleSendPrompt}
          disabled={!prompt.trim() || isLoading}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg animate-pulse backdrop-blur-md border group relative ${
            prompt.trim() && !isLoading
              ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white hover:scale-110 hover:shadow-2xl border-emerald-400/50'
              : 'bg-gray-600/60 text-gray-400 cursor-not-allowed border-gray-500/30'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FaArrowRight className={`text-xl transition-all duration-300 ${
              prompt.trim() && !isLoading ? 'group-hover:translate-x-1' : ''
            }`} />
          )}
        </button>
      </div>



      {/* File Indicator */}
      {selectedFile && (
        <div className="absolute top-8 left-8 bg-gray-900/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 p-3 max-w-xs">
          <div className="flex items-center space-x-2">
            {selectedFile.type === 'pdf' ? (
              <FaFilePdf className="text-red-400" />
            ) : (
              <FaImage className="text-emerald-400" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm text-white font-medium block truncate">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-300">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-200 flex-shrink-0"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
