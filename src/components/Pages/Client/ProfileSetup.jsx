import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Upload } from "@/components/ui/icons";
import { completeProfileSetup } from "../../../services/clientStatusService";
import { db } from '../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const countryCodes = [
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+36", flag: "🇭🇺", name: "Hungary" },
  { code: "+40", flag: "🇷🇴", name: "Romania" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
];

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
    countryCode: existingProfile?.countryCode || "+1",
    phone: existingProfile?.phone || "",
    address: existingProfile?.address || "",
  });
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef(null);
  
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  ).sort((a, b) => {
    // Prioritize codes that start with the search term
    const aStartsWithSearch = a.code.startsWith(searchTerm);
    const bStartsWithSearch = b.code.startsWith(searchTerm);
    if (aStartsWithSearch && !bStartsWithSearch) return -1;
    if (!aStartsWithSearch && bStartsWithSearch) return 1;
    return 0;
  });

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
            profileImage: clientData.profileImage || prev.profileImage,
            name: clientData.name || prev.name,
            company_name: clientData.company_name || prev.company_name,
            company_size: clientData.company_size || prev.company_size,
            industry: clientData.industry || prev.industry,
            countryCode: clientData.countryCode || prev.countryCode,
            phone: clientData.phone || prev.phone,
            address: clientData.address || prev.address
          }));
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClientData();
  }, [email]);

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

    // Save profile data to Firestore
    const profileData = {
      profileImage: formData.profileImage,
      name: formData.name.trim(),
      email: formData.email,
      company_name: formData.company_name.trim(),
      company_size: formData.company_size.trim(),
      industry: formData.industry.trim(),
      countryCode: formData.countryCode,
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      setupComplete: true,
    };

    await completeProfileSetup(email, profileData);

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
              <select
                value={formData.company_size}
                onChange={(e) =>
                  setFormData({ ...formData, company_size: e.target.value })
                }
                className="rounded-[5px] border-gray-400 p-3 text-sm w-full border bg-white"
              >
                <option value="">Select company size</option>
                <option value="1-100">1-100</option>
                <option value="100-1000">100-1000</option>
                <option value="1000-10000">1000-10000</option>
                <option value="10000+">10000+</option>
              </select>
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
              <div className="flex relative">
                <div className="relative">
                  <input
                    type="text"
                    value={showDropdown ? searchTerm : (countryCodes.find(c => c.code === formData.countryCode)?.flag + " " + formData.countryCode)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      setSearchTerm("");
                      setShowDropdown(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowDropdown(false), 200);
                    }}
                    placeholder="Search country code"
                    className="rounded-l-[5px] border-gray-400 border border-r-0 p-3 text-sm bg-white w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showDropdown && (
                    <div className="absolute top-full left-0 w-80 bg-white border border-gray-400 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                          <div
                            key={country.code}
                            onClick={() => {
                              setFormData({ ...formData, countryCode: country.code });
                              setSearchTerm("");
                              setShowDropdown(false);
                            }}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          >
                            <span className="mr-2 text-lg">{country.flag}</span>
                            <span className="mr-2 font-medium">{country.code}</span>
                            <span className="text-gray-600">{country.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No countries found</div>
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  required
                  className="rounded-r-[5px] border-gray-400 border p-3 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
