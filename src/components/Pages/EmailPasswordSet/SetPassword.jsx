import { useState } from 'react'
import { auth } from '../../../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { activateClientAdmin, clientAdminExists } from '../../../services/clientStatusService'
import { activateUser, userExists } from '../../../services/userStatusService'

export default function SetPassword({ onPasswordSet }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check for super admin credentials first
      if (email === 'superadmin@vsurvey.com' && password === 'superadmin123') {
        onPasswordSet('superadmin');
        return;
      }

      // Try to sign in with Firebase
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      console.log('Firebase authentication successful for:', email);

      // Check if this is a client admin
      const isClientAdmin = await clientAdminExists(email.trim());
      
      if (isClientAdmin) {
        // Activate client admin status
        await activateClientAdmin(email.trim());
        console.log('Client admin activated:', email);
        onPasswordSet('client');
      } else {
        // Check if this is a regular user
        const isUser = await userExists(email.trim());
        
        if (isUser) {
          // Activate user status
          await activateUser(email.trim());
          console.log('User activated:', email);
          onPasswordSet('user');
        } else {
          setError('User not found in the system. Please contact your administrator.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        
        {/* Admin Credentials Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Super Admin Credentials:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Email:</strong> superadmin@vsurvey.com</p>
            <p><strong>Password:</strong> superadmin123</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 sm:py-4 rounded-md text-sm sm:text-base font-medium transition-colors mt-6"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}