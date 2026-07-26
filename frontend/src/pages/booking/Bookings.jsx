// const statusStyles = {
//   REQUESTED: 'bg-amber/10 text-amber',
//   ACCEPTED: 'bg-primary/10 text-primary',
//   IN_PROGRESS: 'bg-primary/10 text-primary',
//   COMPLETED: 'bg-green-100 text-green-700',
//   CANCELLED: 'bg-red-100 text-red-600',
// }

// const bookings = [
//   {
//     id: 'BK-1042',
//     service: 'Electrical wiring check',
//     provider: 'Ramesh Kumar',
//     date: '22 Jul 2026',
//     time: '11:00 AM',
//     address: 'HSR Layout, Bangalore',
//     status: 'ACCEPTED',
//     payment: 'PENDING',
//     amount: '₹299',
//   },
//   {
//     id: 'BK-1039',
//     service: 'Bathroom leak fix',
//     provider: 'Suresh Yadav',
//     date: '18 Jul 2026',
//     time: '4:30 PM',
//     address: 'Koramangala, Bangalore',
//     status: 'COMPLETED',
//     payment: 'PAID',
//     amount: '₹450',
//   },
//   {
//     id: 'BK-1031',
//     service: 'Bridal makeup trial',
//     provider: 'Priya Sharma',
//     date: '10 Jul 2026',
//     time: '9:00 AM',
//     address: 'Indiranagar, Bangalore',
//     status: 'CANCELLED',
//     payment: 'PENDING',
//     amount: '₹1,200',
//   },
// ]

// export default function Bookings() {
//   return (
//     <div className="bg-surface min-h-[calc(100vh-73px)]">
//       <div className="max-w-5xl mx-auto px-6 py-12">
//         <h1 className="font-display font-700 text-2xl text-ink">My Bookings</h1>
//         <p className="text-sm text-sub mt-1 mb-8">Track and manage your service requests.</p>

//         <div className="space-y-4">
//           {bookings.map((b) => (
//             <div key={b.id} className="bg-white border border-line rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <div className="flex items-center gap-3">
//                   <span className="text-sm font-semibold text-ink">{b.service}</span>
//                   <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[b.status]}`}>
//                     {b.status.replace('_', ' ')}
//                   </span>
//                 </div>
//                 <div className="text-xs text-sub mt-1">
//                   with {b.provider} · {b.date}, {b.time}
//                 </div>
//                 <div className="text-xs text-sub mt-0.5">📍 {b.address}</div>
//               </div>

//               <div className="flex items-center gap-6 sm:text-right">
//                 <div>
//                   <div className="text-sm font-semibold text-ink">{b.amount}</div>
//                   <div className="text-xs text-sub">{b.payment === 'PAID' ? 'Paid' : 'Pay on service'}</div>
//                 </div>
//                 <button className="text-xs font-medium text-primary border border-primary rounded-lg px-3 py-1.5 hover:bg-primaryLight transition-colors whitespace-nowrap">
//                   View details
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         <p className="text-xs text-sub text-center mt-8">
//           This is sample data — bookings will load from your account once login is connected.
//         </p>
//       </div>
//     </div>
//   )
// }


import { useEffect, useState } from "react";

const statusStyles = {
  REQUESTED: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetchBookings();
  // }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    console.log("USER =", user);
    console.log("USER ID =", user.userId);

    fetchBookings();
}, []);

  const fetchBookings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await fetch(
        `http://localhost:8080/api/bookings/customer/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();

      console.log("Bookings:", data);

      setBookings(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-display font-700 text-2xl text-ink">
          My Bookings
        </h1>

        <p className="text-sm text-sub mt-1 mb-8">
          Track and manage your service requests.
        </p>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-line p-10 text-center">
            <h2 className="text-lg font-semibold">No Bookings Found</h2>
            <p className="text-sub mt-2">
              You haven't booked any service yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.bookingId}
                className="bg-white border border-line rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-ink">
                      {b.serviceTitle}
                    </span>

                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        statusStyles[b.status]
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="text-xs text-sub mt-1">
                    Provider: <strong>{b.providerName}</strong>
                  </div>

                  <div className="text-xs text-sub mt-1">
                    Customer: {b.customerName}
                  </div>

                  <div className="text-xs text-sub mt-1">
                    📅 {b.bookingDate}
                  </div>

                  <div className="text-xs text-sub mt-1">
                    🕒 {b.bookingTime}
                  </div>

                  <div className="text-xs text-sub mt-1">
                    📍 {b.address}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:text-right">
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      ₹{b.totalAmount}
                    </div>

                    <div className="text-xs text-sub">
                      {b.paymentMethod}
                    </div>
                  </div>

                  <button className="text-xs font-medium text-primary border border-primary rounded-lg px-3 py-1.5 hover:bg-primaryLight transition-colors whitespace-nowrap">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}