import { useEffect, useState } from "react";
import { getAllProviders } from "../services/providerService";
import { getAllContracts } from "../services/contractService";
import { getAllVehicles } from "../services/vehicleService";
import { getAllCustomers } from "../services/customerService";
import { getAllBookings } from "../services/bookingService";
import EmptyState from "../components/EmptyState";
import SkeletonRows from "../components/SkeletonRows";

function Dashboard() {
  const [stats, setStats] = useState({
    providers: 0,
    contracts: 0,
    vehicles: 0,
    customers: 0,
    bookings: 0,
    availableVehicles: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        providers,
        contracts,
        vehicles,
        customers,
        bookings,
      ] = await Promise.all([
        getAllProviders(),
        getAllContracts(),
        getAllVehicles(),
        getAllCustomers(),
        getAllBookings(),
      ]);

      const availableVehicles = vehicles.filter(
        (vehicle) =>
          vehicle.availabilityStatus === "AVAILABLE" && vehicle.active === true
      ).length;

      const confirmedBookings = bookings.filter(
        (booking) => booking.status === "CONFIRMED"
      ).length;

      const totalRevenue = bookings
        .filter(
          (booking) =>
            booking.status === "CONFIRMED" || booking.status === "COMPLETED"
        )
        .reduce((sum, booking) => sum + Number(booking.totalAmount), 0);

      setStats({
        providers: providers.length,
        contracts: contracts.length,
        vehicles: vehicles.length,
        customers: customers.length,
        bookings: bookings.length,
        availableVehicles,
        confirmedBookings,
        totalRevenue,
      });

      setRecentBookings(bookings.slice(-5).reverse());
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadDashboardData();
    });
  }, []);

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>DriveEase Dashboard</h1>
            <p>Overview of vehicles, customers, contracts, and booking performance.</p>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        {(isLoading
          ? Array.from({ length: 8 }).map((_, index) => ({ id: index, isSkeleton: true }))
          : [
              { label: "Providers", value: stats.providers },
              { label: "Contracts", value: stats.contracts },
              { label: "Vehicles", value: stats.vehicles },
              { label: "Available Vehicles", value: stats.availableVehicles },
              { label: "Customers", value: stats.customers },
              { label: "Total Bookings", value: stats.bookings },
              { label: "Confirmed Bookings", value: stats.confirmedBookings },
              { label: "Total Revenue", value: `Rs. ${stats.totalRevenue.toFixed(2)}` },
            ]).map((item, index) => (
          <div key={item.id || item.label || index} className="stat-card">
            {item.isSkeleton ? (
              <>
                <span className="skeleton-block skeleton-text" style={{ width: "45%", marginBottom: "10px" }} />
                <span className="skeleton-block" style={{ width: "72%", height: "30px" }} />
              </>
            ) : (
              <>
                <h3>{item.label}</h3>
                <p>{item.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="table-card dashboard-table">
        <h2>Recent Bookings</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Pickup Date</th>
              <th>Return Date</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <SkeletonRows rows={5} columns={6} />
            ) : recentBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">
                  <EmptyState
                    title="No Recent Bookings"
                    description="Bookings will appear here after reservations are created."
                  />
                </td>
              </tr>
            ) : (
              recentBookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td>{booking.bookingId}</td>
                  <td>{booking.customerName}</td>
                  <td>{booking.pickupDate}</td>
                  <td>{booking.returnDate}</td>
                  <td>
                    <strong>Rs. {Number(booking.totalAmount).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span
                      className={
                        booking.status === "CONFIRMED" ||
                        booking.status === "COMPLETED"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
