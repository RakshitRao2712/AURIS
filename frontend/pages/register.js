import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FRONTEND_URL } from '../lib/config';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userData && userEmail && userEmail !== 'guest@example.com') {
      // User is already logged in, redirect to dashboard
      router.push('/');
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage('');
  };

  // Google Sign-In callback with rate limiting protection
  const handleGoogleLogin = async (credential) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('🔑 Attempting Google registration/login');
      
      const response = await fetch('http://localhost:8080/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          credential: credential
        })
      });

      // Handle rate limiting specifically
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Google registration failed');
      }

      console.log('✅ Google registration/login successful:', data);
      
      // Store user authentication data
      localStorage.setItem('userId', data.userId || data.id || '1');
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('authToken', data.token || 'temp-token');
      
      // Store complete user data
      const userData = {
        name: data.name || data.given_name || '',
        email: data.email,
        phone: data.phone || '',
        id: data.userId || data.id,
        avatar: data.picture || data.avatar || ''
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      console.log('💾 Stored Google user data:', userData);
      
      // Redirect to dashboard
      window.location.href = FRONTEND_URL + '/';

    } catch (error) {
      console.error('❌ Google registration failed:', error);
      setErrorMessage(error.message || 'Google registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Google Sign-In with rate limiting protection
  useEffect(() => {
    let initializationAttempts = 0;
    const maxAttempts = 3;
    
    const initializeGoogleSignIn = () => {
      if (typeof window !== 'undefined' && window.google && initializationAttempts < maxAttempts) {
        initializationAttempts++;
        
        try {
          window.google.accounts.id.initialize({
            client_id: '308626026639-mjsot4dvjkc6a62j76ahjh4hrfogu419.apps.googleusercontent.com',
            callback: (response) => {
              handleGoogleLogin(response.credential);
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });
          
          // Add delay before rendering button to prevent rate limits
          setTimeout(() => {
            const buttonContainer = document.getElementById('google-signin-button');
            if (buttonContainer) {
              window.google.accounts.id.renderButton(
                buttonContainer,
                {
                  theme: 'outline',
                  size: 'large',
                  text: 'signup_with',
                  shape: 'rectangular',
                  width: 400,
                  logo_alignment: 'left',
                  type: 'standard'
                }
              );
            }
          }, 500); // 500ms delay
          
          console.log('✅ Google Sign-In initialized successfully');
          console.log('🔍 Current origin:', window.location.origin);
          console.log('🔍 Current URL:', window.location.href);
        } catch (error) {
          console.error('❌ Google Sign-In initialization failed:', error);
          
          // Retry after delay if it's a rate limit issue
          if (error.message.includes('429') || error.message.includes('rate')) {
            console.log('🔄 Retrying Google Sign-In initialization in 2 seconds...');
            setTimeout(initializeGoogleSignIn, 2000);
          }
        }
      }
    };

    // Wait for Google script to load with timeout
    const timeoutId = setTimeout(() => {
      if (!window.google) {
        console.warn('⚠️ Google Sign-In script failed to load within timeout');
      }
    }, 10000);

    if (window.google) {
      clearTimeout(timeoutId);
      initializeGoogleSignIn();
    } else {
      const handleLoad = () => {
        clearTimeout(timeoutId);
        initializeGoogleSignIn();
      };
      
      window.addEventListener('load', handleLoad);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('load', handleLoad);
      };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('📝 Attempting registration for:', formData.email);
      
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      console.log('✅ Registration successful:', data);
      
      // Store user authentication data for the dashboard
      localStorage.setItem('userId', data.userId || data.id || '1');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('authToken', data.token || 'temp-token');
      
      // Store complete user data for immediate display
      const userData = {
        name: data.name || '', // Use actual name from database, empty string if not set
        email: data.email || formData.email,
        phone: data.phone || '',
        id: data.userId || data.id,
        avatar: data.avatar || ''
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      console.log('💾 Stored user data:', userData);
      
      // Redirect to dashboard
      window.location.href = FRONTEND_URL + '/';

    } catch (error) {
      console.error('❌ Registration failed:', error);
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register - AURIS</title>
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </Head>
      
      <div className="register-container">
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <h2 className="loginh2">REGISTER</h2>
            
            {/* Error Message */}
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
            
            <div className="input-field">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <label>Email</label>
            </div>
            
            <div className="input-field">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <label>Password</label>
            </div>
            
            <button 
              className="submitbtn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </button>
            
            {/* Divider */}
            <div className="divider">
              <span>OR</span>
            </div>
            
            {/* Google Sign-In Button */}
            <div id="google-signin-button" className="google-signin-container"></div>
            
            <div className="register">
              <p>
                Have an account?{' '}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/login');
                  }}
                >
                  Login
                </a>
              </p>
            </div>
            
            <div className="register">
              <p>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = 'http://localhost:8080/';
                  }}
                >
                  ← Back to home
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Open Sans", sans-serif;
        }
        
        .register-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
          padding: 0 10px;
          position: relative;
        }
        
        .register-container::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background: 
            linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)),
            linear-gradient(135deg, 
              #4a5568 0%, 
              #2d3748 25%, 
              #1a202c 50%, 
              #2d3748 75%, 
              #4a5568 100%
            ),
            linear-gradient(45deg, 
              #ff7e5f 0%, 
              #feb47b 25%, 
              #86a8e7 50%, 
              #7f7fd5 75%, 
              #667eea 100%
            );
          background-position: center, center, center;
          background-size: cover, cover, cover;
          background-repeat: no-repeat, no-repeat, no-repeat;
          background-attachment: fixed;
          z-index: -1;
        }
        
        .loginh2 {
          font-family: 'Jua', sans-serif;
          letter-spacing: 4px;
        }
        
        .submitbtn {
          font-family: 'Jua', sans-serif;
        }
        
        .wrapper {
          width: 400px;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          border: 2px solid rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        
        form {
          display: flex;
          flex-direction: column;
          animation: slideFadeIn 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(50px);
        }
        
        h2 {
          font-size: 2rem;
          margin-bottom: 20px;
          color: #fff;
        }
        
        .input-field {
          position: relative;
          border-bottom: 2px solid #ccc;
          margin: 15px 0;
        }
        
        .input-field label {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          color: #fff;
          font-size: 16px;
          pointer-events: none;
          transition: 0.15s ease;
        }
        
        .input-field input {
          width: 100%;
          height: 40px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: #fff;
        }
        
        .input-field input:focus~label,
        .input-field input:valid~label {
          font-size: 0.8rem;
          top: 10px;
          transform: translateY(-120%);
        }
        
        .wrapper a {
          color: #efefef;
          text-decoration: none;
        }
        
        .wrapper a:hover {
          text-decoration: underline;
        }
        
        button {
          background: #fff;
          color: #000;
          font-weight: 600;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          border-radius: 3px;
          font-size: 16px;
          border: 2px solid transparent;
          transition: 0.3s ease;
        }
        
        button:hover:not(:disabled) {
          color: #fff;
          border-color: #fff;
          background: rgba(255, 255, 255, 0.15);
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .register {
          text-align: center;
          margin-top: 30px;
          color: #fff;
        }
        
        .error-message {
          background: rgba(255, 255, 255, 0.1);
          color: #ff6b6b;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }
        
        .divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          text-align: center;
        }
        
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
        }
        
        .divider span {
          padding: 0 15px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
        }
        
        .google-signin-container {
          width: 100%;
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
        }
        
        @keyframes slideFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
