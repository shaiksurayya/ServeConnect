import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function AddService() {
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    description: "",
    price: "",
    duration: "",
    availability: true,
  });

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load categories.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const requestData = {
        categoryId: Number(formData.categoryId),
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
        availability: formData.availability,
      };

      const response = await fetch(`${API_URL}/api/services/provider`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(errorData);
        alert("Unable to add service.");
        return;
      }

      alert("Service added successfully!");

      setFormData({
        categoryId: "",
        title: "",
        description: "",
        price: "",
        duration: "",
        availability: true,
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <h1 className="font-display font-bold text-3xl text-ink">
          Add New Service
        </h1>

        <p className="text-sm text-sub mt-2 mb-8">
          Add a service that you provide to customers.
        </p>

        <div className="bg-white border border-line rounded-xl p-6 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                disabled={categoryLoading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Service Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Home Cleaning"
                maxLength={100}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the service you provide..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (₹)
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Example: 500"
                min="0"
                step="0.01"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration (minutes)
              </label>

              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Example: 60"
                min="1"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">

              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                className="w-4 h-4"
              />

              <label className="text-sm font-medium">
                Service is currently available
              </label>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-medium"
            >
              {loading ? "Adding Service..." : "Add Service"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}
