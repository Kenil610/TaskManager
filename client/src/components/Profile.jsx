import React, { useState, useEffect } from "react";
import { User, Camera, Loader, X } from "lucide-react";
import Input from "./Input";
import Button from "./Button";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token not found in localStorage");
        }

        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUserDetails(data);
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        console.error("Failed to fetch profile data:", error.message);
        setToastMessage("Failed to load profile data");
        setToastType("error");
        showToastMessage();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setToastMessage("Image size should be less than 5MB");
        setToastType("error");
        showToastMessage();
        return;
      }

      if (!file.type.startsWith('image/')) {
        setToastMessage("Please upload an image file");
        setToastType("error");
        showToastMessage();
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfilePicture(null);
    setImagePreview(null);
  };

  const handleUpdateProfile = async () => {
    if (newPassword !== confirmPassword) {
      setToastMessage("Passwords do not match");
      setToastType("error");
      showToastMessage();
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setToastMessage("No token found, please login again.");
      setToastType("error");
      showToastMessage();
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (newPassword) {
        formData.append("password", newPassword);
      }
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating profile.");
      }

      const data = await response.json();
      setUserDetails(data);
      setShowUpdateProfile(false);
      setNewPassword("");
      setConfirmPassword("");
      setProfilePicture(null);
      setImagePreview(null);
      setToastMessage("Profile updated successfully!");
      setToastType("success");
      showToastMessage();
    } catch (error) {
      console.error("Error updating profile:", error);
      setToastMessage(error.message || "Error updating profile");
      setToastType("error");
      showToastMessage();
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">My Profile</h1>

          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {showUpdateProfile && imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-100"
                  />
                  <Button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors duration-200"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : userDetails?.profilePicture ? (
                <img
                  src={`http://localhost:5000/${userDetails.profilePicture}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-100 transition-all duration-300 group-hover:ring-blue-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-4 ring-blue-100">
                  <User size={48} className="text-white" />
                </div>
              )}
              {showUpdateProfile && (
                <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors duration-200">
                  <Camera size={20} className="text-white" />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mt-4">{userDetails?.name}</h2>
            <p className="text-gray-600">{userDetails?.email}</p>
          </div>

          {!showUpdateProfile ? (
            <Button
              onClick={() => setShowUpdateProfile(true)}
              className="w-full py-3 bg-blue-500 rounded-lg text-white font-medium hover:bg-blue-600 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                />

              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-green-500 rounded-lg text-white font-medium hover:bg-green-600 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Updating...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowUpdateProfile(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setProfilePicture(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 py-3 bg-gray-500 rounded-lg text-white font-medium hover:bg-gray-600 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div
          className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${toastType === "error" ? "bg-red-500" : "bg-green-500"
            }`}
        >
          <p className="text-white font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}


export default Profile;