import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Upload } from "@/components/ui/icons"

const ProfileSetupForm = ({ email, onComplete, isEdit = false, existingProfile = null }) => {
  const [formData, setFormData] = useState({
    profileImage: existingProfile?.profileImage || null,
    name: existingProfile?.name || '',
    email: email,
    education: existingProfile?.education || '',
    description: existingProfile?.description || ''
  })
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, profileImage: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.name.trim() || !formData.education.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    const profileData = {
      profileImage: formData.profileImage,
      name: formData.name.trim(),
      email: formData.email,
      education: formData.education.trim(),
      description: formData.description.trim(),
      setupComplete: true
    }
    
    localStorage.setItem(`profile_${email}`, JSON.stringify(profileData))
    onComplete(profileData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {isEdit ? 'Edit Profile' : 'Complete Your Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">PROFILE UPLOAD</label>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-black mb-2">NAME</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your name"
                required
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-black mb-2">EMAIL</label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-black mb-2">EDUCATION</label>
              <Input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                placeholder="Enter your education"
                required
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-black mb-2">DESCRIPTION</label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter description"
                required
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700 p-4 text-sm"
            >
              {isEdit ? 'Update Profile' : 'Complete Setup'}
            </Button>
          </form>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileSetupForm