import { useState } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import loginImage from '../../../assets/1.png'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      // Check for super admin credentials
      if (email === 'superadmin@vsurvey.com' && password === 'superadmin123') {
        onLogin('superadmin')
      } else {
        // Check Client Admin credentials
        const clientAdmins = JSON.parse(localStorage.getItem('clientAdmins') || '[]')
        const clientAdmin = clientAdmins.find(admin => admin.email === email)
        
        if (clientAdmin) {
          const profileData = localStorage.getItem(`profile_${email}`)
          const isFirstTime = !profileData
          const profile = profileData ? JSON.parse(profileData) : null
          onLogin('client', { email, isFirstTime, profile })
        } else {
          alert('Invalid email or password')
        }
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200/20 rounded-full blur-2xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Image */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent leading-tight">
                V-Survey Platform
              </h1>
              <p className="text-xl text-gray-600 max-w-md mx-auto lg:mx-0">
                Advanced data collection and analytics for modern enterprises
              </p>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-80 h-80 mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={loginImage} 
                  alt="Survey Platform" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to access your dashboard</p>
                  
                  {/* Admin Credentials Display */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4 text-left">
                    <h3 className="text-xs font-semibold text-blue-800 mb-1">Super Admin Access:</h3>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p><strong>Email:</strong> superadmin@vsurvey.com</p>
                      <p><strong>Password:</strong> superadmin123</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white/70 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-white/70 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Authenticating...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Need access? 
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Contact your administrator
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login