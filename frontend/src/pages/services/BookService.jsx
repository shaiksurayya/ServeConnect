import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

  useEffect(() => {
    fetch(`http://localhost:8080/api/services/${id}`)
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

    const bookingData = {
      serviceId: service.serviceId,
      bookingDate: form.date,
      bookingTime: form.time,
      address: form.address,
    };

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("http://localhost:8080/api/bookings/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login/customer");
        return;
      }

      if (!response.ok) {
        let message = "Booking failed. Please try again.";
        try {
          const errorBody = await response.json();
          if (errorBody?.message) message = errorBody.message;
        } catch (_) {
          // response wasn't JSON, keep the default message
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

      <p className="mt-2">
        Provider : {service.providerName}
      </p>

      <p className="mb-4">
        Price : ₹{service.price}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full border p-2 rounded"
          required
        />

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>

      </form>

    </div>
  );
}