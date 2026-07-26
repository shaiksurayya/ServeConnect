import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);

  const [form, setForm] = useState({
    date: "",
    time: "",
    address: "",
  });

  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/services/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded Service:", data);
        setService(data);
      })
      .catch((err) => console.log(err));
  }, [id]);

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

    const user = JSON.parse(localStorage.getItem("user"));

    const bookingData = {
      customerId: user.userId,
      providerId: service.providerId,
      serviceId: service.serviceId,
      bookingDate: form.date,
      bookingTime: form.time,
      address: form.address,
    };

    console.log("Sending Booking:", bookingData);

    try {
      const response = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        alert("Booking Failed");
        return;
      }

      const result = await response.json();

      console.log("Booking Success:", result);

      setConfirmed(true);
    } catch (err) {
      console.log(err);
      alert("Booking Failed");
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

        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded"
        >
          Confirm Booking
        </button>

      </form>

    </div>
  );
}