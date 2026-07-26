import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from "react";

const categories = ['AC Repair', 'Electrician', 'Tutor', 'Beautician', 'Plumbing']

export default function Services() {
  const navigate = useNavigate()
  const [allServices, setAllServices] = useState([]);
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [minRating, setMinRating] = useState(0)

  useEffect(() => {
  fetch("http://localhost:8080/api/services")
    .then((response) => {
      console.log("Status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("Services from backend:", data);
      console.log("Length:", data.length);
      setAllServices(data);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}, []);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  // const filtered = allServices.filter((s) => {
  //   const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase())
  //   const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(s.categoryName)
  //   const matchesPrice = s.price <= maxPrice
  //   const matchesRating = true;
  //   return matchesSearch && matchesCategory && matchesPrice && matchesRating
  // })

  const filtered = allServices;

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[220px_1fr] gap-8">
        {/* Filters */}
        <aside className="space-y-6">
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service..."
              className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-2">Category</h3>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm text-sub cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="accent-primary"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-2">Price</h3>
            <input
              type="range"
              min="100"
              max="1500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="text-xs text-sub mt-1">Up to ₹{maxPrice}</div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-2">Rating</h3>
            <div className="flex gap-1">
              {[4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? 0 : r)}
                  className={`text-xs px-2 py-1 rounded-full border ${minRating === r ? 'bg-primary text-white border-primary' : 'border-line text-sub'}`}
                >
                  {r}★+
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <h1 className="font-display font-700 text-xl text-ink mb-6">
            {filtered.length} service{filtered.length !== 1 ? 's' : ''} found
          </h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <div key={s.serviceId} className="bg-white border border-line rounded-xl p-5">
                <div className="text-sm font-semibold text-ink">{s.title}</div>
                <div className="text-sm text-sub mt-1">
  Provider: {s.providerName}
</div>
                <div className="text-lg font-display font-700 text-ink mt-2">₹{s.price}</div>
                <div className="text-xs text-sub mt-0.5">{s.duration} mins</div>
                <div className={`text-xs font-medium mt-1 ${s.availability ? 'text-green-600' : 'text-red-500'}`}>
                  {s.availability ? 'Available' : 'Currently unavailable'}
                </div>
                <button
                  onClick={() => navigate(`/book/${s.serviceId}`)}
                  disabled={!s.availability}
                  className="w-full mt-4 text-sm font-medium text-white bg-primary rounded-lg py-2 hover:bg-primaryDark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-sub col-span-full">No services match your filters.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
