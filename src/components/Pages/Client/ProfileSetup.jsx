import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Upload } from "@/components/ui/icons";
import { completeProfileSetup } from "../../../services/clientStatusService";
import { db } from '../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const ProfileSetup = ({
  email,
  onComplete,
  isEdit = false,
  existingProfile = null,
  setActiveTab,
}) => {
  const [formData, setFormData] = useState({
    profileImage: existingProfile?.profileImage || null,
    name: existingProfile?.name || "",
    email: email,
    company_name: existingProfile?.company_name || "",
    company_size: existingProfile?.company_size || "",
    industry: existingProfile?.industry || "",
    phone: existingProfile?.phone || "",
    address: existingProfile?.address || "",
  });
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const superadminId = "U0UjGVvDJoDbLtWAhyjp";
        const clientsRef = collection(db, "superadmin", superadminId, "clients");
        const q = query(clientsRef, where("email", "==", email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const clientData = snapshot.docs[0].data();
          setFormData(prev => ({
            ...prev,
            company_name: clientData.company_name || ""
          }));
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    if (!isEdit) {
      fetchClientData();
    }
  }, [email, isEdit]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, profileImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.company_name.trim() ||
      !formData.phone.trim()
    ) {
      setMessage("Please fill in all required fields");
      return;
    }

    // Save profile to localStorage
    const profileData = {
      profileImage: formData.profileImage,
      name: formData.name.trim(),
      email: formData.email,
      company_name: formData.company_name.trim(),
      company_size: formData.company_size.trim(),
      industry: formData.industry.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      setupComplete: true,
    };

    localStorage.setItem(`profile_${email}`, JSON.stringify(profileData));

    // Save profile data to Firestore
    if (!isEdit) {
      await completeProfileSetup(email, profileData);
    }

    if (!isEdit && setActiveTab) {
      setActiveTab("Users");
    }
    onComplete(profileData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isEdit ? "Edit Profile" : "Complete Your Profile"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                PROFILE UPLOAD
              </label>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
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
              <label className="block text-sm font-bold text-black mb-2">
                NAME
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
                required
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                EMAIL
              </label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                COMPANY NAME
              </label>
              <Input
                type="text"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                placeholder="Enter company name"
                required
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                COMPANY SIZE
              </label>
              <Input
                type="text"
                value={formData.company_size}
                onChange={(e) =>
                  setFormData({ ...formData, company_size: e.target.value })
                }
                placeholder="Enter company size"
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                INDUSTRY
              </label>
              <Input
                type="text"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="Enter industry"
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                PHONE
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
                required
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                ADDRESS
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter address"
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-700 p-4 text-sm"
            >
              {isEdit ? "Update Profile" : "Complete Setup"}
            </Button>
          </form>
          {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
