import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        throw new Error("User information or token is missing");
      }

      const localUser = JSON.parse(storedUser);

      // Support both customer and provider login formats
      const userId = localUser.userId || localUser.id;

      if (!userId) {
        throw new Error("User ID is missing");
      }

      console.log("Profile user:", localUser);
      console.log("Profile user ID:", userId);

      const response = await fetch(
        `${API_URL}/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch profile: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Profile data:", data);

      setUser(data);
    } catch (error) {
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Failed to load profile.
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white border border-line rounded-2xl p-6 text-center">

          <div className="w-20 h-20 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>

          <h1 className="text-2xl font-bold mt-4">
            {user.name}
          </h1>

          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {user.role}
          </span>

          <div className="text-left mt-8 space-y-4">

            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium">
                {user.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="font-medium">
                {user.address || "Not provided"}
              </p>
            </div>

          </div>

          <button
            type="button"
            className="w-full mt-6 bg-primary text-white rounded-lg py-2.5 hover:bg-primaryDark transition-colors"
          >
            Edit Profile
          </button>

          <div className="mt-4 space-y-2">

            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="w-full border border-line rounded-lg py-2 hover:border-primary hover:text-primary"
            >
              My Bookings
            </button>

            <button
              type="button"
              onClick={() => navigate("/reviews")}
              className="w-full border border-line rounded-lg py-2 hover:border-primary hover:text-primary"
            >
              My Reviews
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full border border-red-300 text-red-600 rounded-lg py-2 hover:bg-red-50"
            >
              Logout
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
