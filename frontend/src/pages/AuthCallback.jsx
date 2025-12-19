import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '@/utils/axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processGoogleAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id found in URL');
          navigate('/registro', { replace: true });
          return;
        }

        // Exchange session_id for user data
        const response = await axios.get(`${API}/auth/google/callback`, {
          params: { session_id: sessionId },
          withCredentials: true
        });

        if (response.data.success && response.data.user) {
          // Store session token in localStorage as fallback for mobile
          if (response.data.session_token) {
            localStorage.setItem('session_token', response.data.session_token);
          }

          // Navigate to dashboard with user data
          navigate('/dashboard', { 
            replace: true,
            state: { user: response.data.user }
          });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error processing Google auth:', error);
        navigate('/registro', { 
          replace: true,
          state: { error: 'Error al procesar autenticación con Google' }
        });
      }
    };

    processGoogleAuth();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-lg text-gray-700">Procesando autenticación con Google...</p>
      </div>
    </div>
  );
}
