import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    date: "",
    time: "",
    address: "",
  });

  const [confirmed, setConfirmed] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`${API_URL}/api/services/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Service not found");
        return res.json();
      })
      .then((data) => {
        setService(data);
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Unable to load this service. It may no longer be available.");
      });
  }, [id]);

  if (loadError) {
    return (
      <div className="text-center mt-10 text-red-600">
        <h2>{loadError}</h2>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center mt-10">
        <h2>Loading...</h2>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/customer");
      return;
    }

    if (!service.availability) {
      setSubmitError("This service is currently unavailable for booking.");
      return;
    }

    if (form.date < todayStr) {
      setSubmitError("Booking date cannot be in the past.");
      return;
    }

    const bookingData = {
      serviceId: service.serviceId,
      bookingDate: form.date,
      bookingTime: form.time,
      address: form.address,
    };

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${API_URL}/api/bookings/customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        let message = "Booking failed. Please try again.";
        try {
          const errorBody = await response.json();
          if (errorBody?.message) message = errorBody.message;
        } catch (_) {
          // response wasn't JSON, keep default
        }
        setSubmitError(message);
        return;
      }

      await response.json();
      setConfirmed(true);
    } catch (err) {
      console.error(err);
      setSubmitError("Booking failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border text-center">
          <h2 className="text-2xl font-bold mb-3">✅ Booking Confirmed</h2>

          <p>
            {service.title} booked successfully.
          </p>

          <button
            onClick={() => navigate("/bookings")}
            className="mt-5 bg-primary text-white px-4 py-2 rounded"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-xl border">

      <h2 className="text-2xl font-bold">
        {service.title}
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Provider: <span className="font-semibold text-gray-800">{service.providerName}</span>
      </p>

      <p className="mt-1 font-semibold text-lg text-ink">
        Price: ₹{service.price}
      </p>

      {!service.availability && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          ⚠️ This service is currently marked as unavailable by the provider and cannot be booked.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">

        <div>
          <label className="text-xs text-gray-500 block mb-1">Booking Date</label>
          <input
            type="date"
            name="date"
            min={todayStr}
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded text-sm"
            required
            disabled={!service.availability}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Booking Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full border p-2 rounded text-sm"
            required
            disabled={!service.availability}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Service Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border p-2 rounded text-sm"
            required
            disabled={!service.availability}
          />
        </div>

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !service.availability}
          className="w-full bg-primary hover:bg-primaryDark text-white p-2 rounded. font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Booking..." : service.availability ? "Confirm Booking" : "Service Unavailable"}
        </button>

      </form>

    </div>
  );
}