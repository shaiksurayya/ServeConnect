import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// Convert "09:00" -> "09:00 AM"
const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")} ${period}`;
};

// Generate time options from 00:00 to 23:30
const generateTimeOptions = () => {
  const options = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;

      options.push({
        value,
        label: formatTime(value),
      });
    }
  }

  return options;
};

const timeOptions = generateTimeOptions();

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    experience: "",
    description: "",
    workingStartTime: "",
    workingEndTime: "",
  });

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

      const userId = localUser.userId || localUser.id;

      if (!userId) {
        throw new Error("User ID is missing");
      }

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

      setUser(data);

      if (data.role === "PROVIDER") {
        const providerResponse = await fetch(
          `${API_URL}/api/provider/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (providerResponse.ok) {
          const providerData = await providerResponse.json();

          setUser({
            ...data,
            ...providerData,
          });

          setForm({
            name: providerData.name || data.name || "",
            phone: providerData.phone || data.phone || "",
            address:
              providerData.address ||
              data.address ||
              "",
            experience:
              providerData.experience ?? "",
            description:
              providerData.description || "",
            workingStartTime:
              providerData.workingStartTime || "",
            workingEndTime:
              providerData.workingEndTime || "",
          });
        }
      } else {
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          experience: "",
          description: "",
          workingStartTime: "",
          workingEndTime: "",
        });
      }
    } catch (error) {
      console.error("Profile error:", error);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  const saveProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login/customer");
      return;
    }

    // Validate working hours
    if (
      form.workingStartTime &&
      form.workingEndTime &&
      form.workingStartTime >= form.workingEndTime
    ) {
      setError(
        "Working end time must be after working start time."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/provider/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        let errorMessage =
          "Failed to update profile.";

        try {
          const errorBody = await response.json();

          if (errorBody?.message) {
            errorMessage = errorBody.message;
          }
        } catch (_) {
          // Response wasn't JSON
        }

        setError(errorMessage);
        return;
      }

      setMessage(
        "Profile updated successfully."
      );

      setEditing(false);

      await fetchUser();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
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

  const isProvider = user.role === "PROVIDER";

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-md mx-auto px-6 py-12">

        <div className="bg-white border border-line rounded-2xl p-6">

          {/* Profile Header */}
          <div className="text-center">

            <div className="w-20 h-20 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>

            <h1 className="text-2xl font-bold mt-4">
              {user.name}
            </h1>

            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {user.role}
            </span>

          </div>

          {/* Messages */}
          {message && (
            <div className="mt-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {!editing ? (
            <>
              {/* Profile Information */}
              <div className="text-left mt-8 space-y-4">

                <div>
                  <p className="text-xs text-gray-500">
                    Email
                  </p>
                  <p className="font-medium">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Phone
                  </p>
                  <p className="font-medium">
                    {user.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Address
                  </p>
                  <p className="font-medium">
                    {user.address || "Not provided"}
                  </p>
                </div>

                {/* Provider Working Hours */}
                {isProvider && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Working Hours
                    </p>

                    <p className="font-medium">
                      {user.workingStartTime &&
                      user.workingEndTime
                        ? `${formatTime(
                            user.workingStartTime
                          )} - ${formatTime(
                            user.workingEndTime
                          )}`
                        : "Not configured"}
                    </p>
                  </div>
                )}

                {isProvider && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">
                        Experience
                      </p>

                      <p className="font-medium">
                        {user.experience !== null &&
                        user.experience !== undefined
                          ? `${user.experience} years`
                          : "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Description
                      </p>

                      <p className="font-medium">
                        {user.description ||
                          "Not provided"}
                      </p>
                    </div>
                  </>
                )}

              </div>

              {/* Edit */}
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                  setError("");
                }}
                className="w-full mt-6 bg-primary text-white rounded-lg py-2.5 hover:bg-primaryDark transition-colors"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              {/* Edit Form */}
              <div className="mt-8 space-y-4">

                <div>
                  <label className="text-xs text-gray-500">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg mt-1"
                  />
                </div>

                {isProvider && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500">
                        Experience (years)
                      </label>

                      <input
                        type="number"
                        name="experience"
                        min="0"
                        value={form.experience}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">
                        Description
                      </label>

                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg mt-1"
                        rows="3"
                      />
                    </div>

                    {/* Working Hours */}
                    <div className="border-t pt-4">

                      <h3 className="font-semibold mb-3">
                        Working Hours
                      </h3>

                      <div>
                        <label className="text-xs text-gray-500">
                          Start Time
                        </label>

                        <select
                          name="workingStartTime"
                          value={form.workingStartTime}
                          onChange={handleChange}
                          className="w-full border p-2 rounded-lg mt-1 bg-white"
                        >
                          <option value="">
                            Select start time
                          </option>

                          {timeOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-3">
                        <label className="text-xs text-gray-500">
                          End Time
                        </label>

                        <select
                          name="workingEndTime"
                          value={form.workingEndTime}
                          onChange={handleChange}
                          className="w-full border p-2 rounded-lg mt-1 bg-white"
                        >
                          <option value="">
                            Select end time
                          </option>

                          {timeOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Customers will only be able to
                        book services during these hours.
                      </p>

                    </div>
                  </>
                )}

              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3 mt-6">

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 bg-primary text-white rounded-lg py-2.5 hover:bg-primaryDark disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Profile"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setMessage("");
                  }}
                  disabled={saving}
                  className="flex-1 border border-line rounded-lg py-2.5 hover:border-primary hover:text-primary"
                >
                  Cancel
                </button>

              </div>
            </>
          )}

          {/* Navigation */}
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
