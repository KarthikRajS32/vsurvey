import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ClientAdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Check Super Admin credentials
      if (formData.email === 'superadmin@gmail.com' && formData.password === 'superadmin123') {
        window.location.href = '/super-admin'
        return
      }
      
      // Check Client Admin credentials
      const clientAdmins = JSON.parse(localStorage.getItem('clientAdmins') || '[]')
      const clientAdmin = clientAdmins.find(admin => admin.email === formData.email)
      
      if (clientAdmin) {
        const isFirstTime = !localStorage.getItem(`profile_${formData.email}`)
        onLogin(formData.email, isFirstTime)
      } else {
        setMessage('Invalid email or password')
      }
    } catch (error) {
      setMessage('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">EMAIL</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                required
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">PASSWORD</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
                required
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700 p-4 text-sm"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientAdminLogin