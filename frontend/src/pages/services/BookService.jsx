import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

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
        if (!res.ok) {
          throw new Error("Service not found");
        }

        return res.json();
      })
      .then((data) => {
        console.log("Service data:", data);
        setService(data);
      })
      .catch((err) => {
        console.error(err);
        setLoadError(
          "Unable to load this service. It may no longer be available."
        );
      });
  }, [id]);

  /*
   * Convert 24-hour time to AM/PM
   *
   * Example:
   * 09:00 -> 09:00 AM
   * 13:30 -> 01:30 PM
   */
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);

    const period = hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 === 0 ? 12 : hours % 12;

    return `${String(displayHour).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")} ${period}`;
  };

  /*
   * Generate 30-minute slots automatically
   *
   * Example:
   * 09:00 -> 18:00
   *
   * Generates:
   * 09:00
   * 09:30
   * 10:00
   * ...
   * 18:00
   */
  const generateTimeSlots = () => {
    if (
      !service?.workingStartTime ||
      !service?.workingEndTime
    ) {
      return [];
    }

    const start = service.workingStartTime.substring(0, 5);
    const end = service.workingEndTime.substring(0, 5);

    const [startHour, startMinute] = start
      .split(":")
      .map(Number);

    const [endHour, endMinute] = end
      .split(":")
      .map(Number);

    const startTotalMinutes =
      startHour * 60 + startMinute;

    const endTotalMinutes =
      endHour * 60 + endMinute;

    const slots = [];

    for (
      let minutes = startTotalMinutes;
      minutes <= endTotalMinutes;
      minutes += 30
    ) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      const timeValue = `${String(hour).padStart(
        2,
        "0"
      )}:${String(minute).padStart(2, "0")}`;

      slots.push({
        value: timeValue,
        label: formatTime(timeValue),
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

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
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setSubmitError("");
  };

  const handleDateChange = (e) => {
    setForm({
      ...form,
      date: e.target.value,
      time: "",
    });

    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login/customer");
      return;
    }

    if (!service.availability) {
      setSubmitError(
        "This service is currently unavailable for booking."
      );
      return;
    }

    if (!form.date || !form.time) {
      setSubmitError(
        "Please select a booking date and time."
      );
      return;
    }

    /*
     * Prevent booking in the past
     */
    const selectedDateTime = new Date(
      `${form.date}T${form.time}`
    );

    if (selectedDateTime < new Date()) {
      setSubmitError(
        "Booking date and time cannot be in the past."
      );
      return;
    }

    /*
     * Validate provider working hours
     */
    if (
      !service.workingStartTime ||
      !service.workingEndTime
    ) {
      setSubmitError(
        "Provider working hours are not available."
      );
      return;
    }

    const startTime =
      service.workingStartTime.substring(0, 5);

    const endTime =
      service.workingEndTime.substring(0, 5);

    if (
      form.time < startTime ||
      form.time > endTime
    ) {
      setSubmitError(
        `Please select a time between ${formatTime(
          startTime
        )} and ${formatTime(endTime)}.`
      );
      return;
    }

    /*
     * Send booking request
     */
    const bookingData = {
      serviceId: service.serviceId,
      bookingDate: form.date,
      bookingTime: form.time,
      address: form.address,
    };

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/customer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (!response.ok) {
        let message =
          "Booking failed. Please try again.";

        try {
          const errorBody = await response.json();

          if (errorBody?.message) {
            message = errorBody.message;
          }
        } catch (_) {
          // Response wasn't JSON
        }

        setSubmitError(message);
        return;
      }

      await response.json();

      setConfirmed(true);
    } catch (err) {
      console.error(err);

      setSubmitError(
        "Booking failed. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Confirmation screen
   */
  if (confirmed) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border text-center">

          <h2 className="text-2xl font-bold mb-3">
            ✅ Booking Confirmed
          </h2>

          <p>
            {service.title} booked successfully.
          </p>

          <p className="mt-2 text-gray-600">
            {form.date} at {formatTime(form.time)}
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
        Provider:{" "}
        <span className="font-semibold text-gray-800">
          {service.providerName}
        </span>
      </p>

      <p className="mt-1 font-semibold text-lg text-ink">
        Price: ₹{service.price}
      </p>

      {/* Provider working hours */}
      {service.workingStartTime &&
        service.workingEndTime && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            🕒 Provider working hours:{" "}
            <span className="font-semibold">
              {formatTime(
                service.workingStartTime.substring(0, 5)
              )}
              {" - "}
              {formatTime(
                service.workingEndTime.substring(0, 5)
              )}
            </span>
          </div>
        )}

      {!service.availability && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          ⚠️ This service is currently marked as unavailable
          by the provider and cannot be booked.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 mt-4"
      >

        {/* Booking Date */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Booking Date
          </label>

          <input
            type="date"
            name="date"
            min={todayStr}
            value={form.date}
            onChange={handleDateChange}
            className="w-full border p-2 rounded text-sm"
            required
            disabled={!service.availability}
          />
        </div>

        {/* Booking Time */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Booking Time
          </label>

          <select
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full border p-2 rounded text-sm bg-white"
            required
            disabled={
              !service.availability ||
              !form.date ||
              timeSlots.length === 0
            }
          >
            <option value="">
              {form.date
                ? "Select a time"
                : "Select date first"}
            </option>

            {timeSlots.map((slot) => (
              <option
                key={slot.value}
                value={slot.value}
              >
                {slot.label}
              </option>
            ))}
          </select>

          {form.date &&
            timeSlots.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Available every 30 minutes during provider
                working hours.
              </p>
            )}

          {form.date &&
            timeSlots.length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                Provider working hours are not configured.
              </p>
            )}
        </div>

        {/* Address */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Service Address
          </label>

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

        {/* Error */}
        {submitError && (
          <p className="text-sm text-red-600">
            {submitError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={
            submitting || !service.availability
          }
          className="w-full bg-primary hover:bg-primaryDark text-white p-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Booking..."
            : service.availability
            ? "Confirm Booking"
            : "Service Unavailable"}
        </button>

      </form>
    </div>
  );
}
