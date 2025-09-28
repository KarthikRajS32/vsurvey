import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit3, Trash2, User, Upload } from "@/components/ui/icons";
import TopBar from "../TapBar/TopBar";
import Sidebar from "../SideBar/Sidebar";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('admins');
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [clientAdmins, setClientAdmins] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: ''
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);



  useEffect(() => {
    const savedAdmins = localStorage.getItem('clientAdmins');
    if (savedAdmins) {
      setClientAdmins(JSON.parse(savedAdmins));
    }
  }, []);

  const saveAdminsToStorage = (updatedAdmins) => {
    localStorage.setItem('clientAdmins', JSON.stringify(updatedAdmins));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setMessage('Please fill in all required fields');
      return;
    }

    const newAdmin = {
      id: Date.now(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      isActive: true
    };

    const updatedAdmins = [newAdmin, ...clientAdmins];
    setClientAdmins(updatedAdmins);
    saveAdminsToStorage(updatedAdmins);
    setFormData({ fullName: '', email: '' });
    setMessage('Client Admin created successfully!');
    
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleAdminStatus = (adminId) => {
    const updatedAdmins = clientAdmins.map(admin => 
      admin.id === adminId ? { ...admin, isActive: !admin.isActive } : admin
    );
    setClientAdmins(updatedAdmins);
    saveAdminsToStorage(updatedAdmins);
  };





  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      fullName: admin.fullName,
      email: admin.email
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.fullName.trim() || !editFormData.email.trim()) return;

    const updatedAdmins = clientAdmins.map(admin =>
      admin.id === editingAdmin.id
        ? {
            ...admin,
            fullName: editFormData.fullName.trim(),
            email: editFormData.email.trim()
          }
        : admin
    );
    setClientAdmins(updatedAdmins);
    saveAdminsToStorage(updatedAdmins);
    setIsEditModalOpen(false);
    setEditingAdmin(null);
  };

  const openDeleteModal = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (adminToDelete) {
      const updatedAdmins = clientAdmins.filter(admin => admin.id !== adminToDelete.id);
      setClientAdmins(updatedAdmins);
      saveAdminsToStorage(updatedAdmins);
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
    }
  };

  const filteredAdmins = clientAdmins.filter(admin =>
    admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    window.location.reload();
  };

  const renderContent = () => {
    return (
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <div className="mb-4 md:mb-6">
            <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium">Super Admin Dashboard</h1>
            <h1 className="text-sm md:text-base lg:text-lg text-gray-400 font-extralight mt-1">Manage client administrators</h1>
          </div>
          
          <Card className="shadow-lg rounded-none">
            <CardHeader>
              <CardTitle className="text-base md:text-lg lg:text-xl text-gray-800">Client Admin Creation Form</CardTitle>
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
                  className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700 p-4 text-sm"
                >
                  Create Client Admin
                </Button>
              </form>
              {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-80 lg:flex-shrink-0">
          <AdminsList 
            clientAdmins={filteredAdmins} 
            toggleAdminStatus={toggleAdminStatus}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar setActiveTab={setActiveTab} onLogout={handleLogout} isSuperAdmin={true} />
      <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="lg:ml-64 pt-16 sm:pt-20 md:pt-24 p-4 sm:p-6 md:p-8 mt-10">
        {renderContent()}
      </main>
      
      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Client Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-black mb-2">FULL NAME</label>
              <Input
                type="text"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                required
                className="rounded-[5px] border-gray-400 p-2 sm:p-3 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-black mb-2">EMAIL</label>
              <Input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                required
                className="rounded-[5px] border-gray-400 p-2 sm:p-3 text-sm w-full"
              />
            </div>
            <Button type="submit" className="w-full py-2 sm:py-3 text-sm sm:text-base">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="w-[90vw] max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900">{adminToDelete?.fullName}</strong>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1 py-2 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="w-full sm:w-auto order-1 sm:order-2 py-2 text-sm sm:text-base"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const SuperAdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'admins', label: 'Super Admin' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="hidden lg:block w-64 bg-white shadow-lg h-screen fixed left-0 top-0 pt-20 z-40">
      <nav className="mt-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-start px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
              activeTab === item.id ? 'bg-gray-100 border-r-2 border-black text-black font-medium' : 'text-gray-700'
            }`}
          >
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const AdminsList = ({ clientAdmins, toggleAdminStatus, openEditModal, openDeleteModal, searchTerm, setSearchTerm }) => {
  return (
    <div className="lg:w-80 lg:shadow-lg lg:h-screen lg:fixed lg:right-0 lg:top-0 lg:z-40 lg:bg-white lg:overflow-y-auto w-full bg-transparent">
      <div className="lg:p-4 lg:mt-20 p-4 space-y-3">
        <div className="mb-3">
          <CardTitle className="text-base lg:text-lg font-semibold text-gray-800 lg:text-center">
            Client Admins
          </CardTitle>
          <div className="mt-3">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="space-y-2 lg:space-y-3">
            {clientAdmins.length === 0 ? (
              <div className="p-3 lg:p-4 border border-gray-300 rounded-lg bg-white">
                <p className="text-gray-500 text-xs">
                  {searchTerm ? 'No admins found matching your search' : 'No client admins created yet'}
                </p>
              </div>
            ) : (
              clientAdmins.map((admin) => (
                <div key={admin.id} className="p-3 lg:p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="mb-2">
                    <h4 className="font-medium text-gray-800 text-xs lg:text-sm break-words">
                      {admin.fullName}
                    </h4>
                    <p className={`text-xs break-words ${
                      admin.isActive ? "text-gray-600" : "line-through text-gray-400"
                    }`}>
                      {admin.email}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant={admin.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleAdminStatus(admin.id)}
                      className="text-xs px-2 py-1"
                    >
                      {admin.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(admin)}
                        className="p-1 h-7 w-7"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(admin)}
                        className="p-1 h-7 w-7 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </div>
    </div>
  );
}
