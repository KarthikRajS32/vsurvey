import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2 } from "@/components/ui/icons"
import { supabase } from './supabaseClient'

const SurveyPersonnel = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  })
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    const savedUsers = localStorage.getItem('surveyUsers')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  const saveUsersToStorage = (updatedUsers) => {
    localStorage.setItem('surveyUsers', JSON.stringify(updatedUsers))
    // Trigger custom event to sync across components
    window.dispatchEvent(new Event('usersUpdated'))
  }
  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
      
      if (error) throw error
      setMessage('Check your email for the login link!')
    } catch (error) {
      setMessage(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
    
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setMessage('Please fill in all required fields')
      return
    }

    const newUser = {
      id: Date.now(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      isActive: true
    }

    const updatedUsers = [newUser, ...users]
    setUsers(updatedUsers)
    saveUsersToStorage(updatedUsers)
    setFormData({ fullName: '', email: '' })
    setMessage('User created successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    )
    setUsers(updatedUsers)
    saveUsersToStorage(updatedUsers)
  }

  const openDeleteModal = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      const updatedUsers = users.filter(u => u.id !== userToDelete.id)
      setUsers(updatedUsers)
      saveUsersToStorage(updatedUsers)
    }
    setIsDeleteModalOpen(false)
    setUserToDelete(null)
  }

  const cancelDelete = () => {
    setIsDeleteModalOpen(false)
    setUserToDelete(null)
  }
  

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 xl:px-5 xl:ml-10">
      <div className="flex-1 min-w-0">
        <div className="mb-4 md:mb-6">
          <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium">Survey Users Management</h1>
          <h1 className="text-sm md:text-base lg:text-lg text-gray-400 font-extralight mt-1">Create and manage survey users</h1>
        </div>
        <Card className="shadow-lg rounded-none">
          <CardHeader>
            <CardTitle className="text-base md:text-lg lg:text-xl text-gray-800">User Creation Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs md:text-sm font-bold text-black mb-2">FULL NAME</label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter full name"
                  required
                  className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-bold text-black mb-2">EMAIL</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                  className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
                />
              </div>
              <Button 
                type="submit"
                onClick = {()=> {handleLogin()}}
                className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700 p-4 text-sm"
              >
                Create Survey User
              </Button>
            </form>
            {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
          </CardContent>
        </Card>
      </div>
      
      <div className="w-full lg:w-80 lg:flex-shrink-0">
        <div className="lg:w-80 lg:shadow-lg lg:h-screen lg:fixed lg:right-0 lg:top-0 lg:z-40 lg:bg-white lg:overflow-y-auto w-full bg-transparent">
          <div className="lg:p-4 lg:mt-20 p-4 space-y-3">
            <div className="mb-3">
              <CardTitle className="text-base lg:text-lg font-semibold text-gray-800 lg:text-center">
                Survey Users
              </CardTitle>
            </div>
            <CardContent className="p-0">
              <div className="space-y-2 lg:space-y-3">
                {users.length === 0 ? (
                  <div className="p-3 lg:p-4 border border-gray-300 rounded-lg bg-white">
                    <p className="text-gray-500 text-xs">
                      No users created yet
                    </p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="p-3 lg:p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium text-gray-800 text-xs lg:text-sm break-words mb-2">
                        {user.fullName}
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between py-1">
                          <span className={`text-xs break-words flex-1 ${
                            user.isActive ? "text-gray-600" : "line-through text-gray-400"
                          }`}>
                            {user.email}
                          </span>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant={user.isActive ? "destructive" : "default"}
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                              className="text-xs px-2 py-1"
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(user)}
                              className="p-1 h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={() => {}}>
        <DialogContent className="w-full max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            {userToDelete && (
              <div className="p-3 bg-gray-50 rounded border">
                <p className="font-medium text-sm">{userToDelete.fullName}</p>
                <p className="text-xs text-gray-500 mt-1">{userToDelete.email}</p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button onClick={confirmDelete} variant="destructive" className="flex-1">
                Delete
              </Button>
              <Button onClick={cancelDelete} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SurveyPersonnel