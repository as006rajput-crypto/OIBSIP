
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/orders";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const statuses = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrders = async () => {
    try {
      setError("");
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to fetch orders.");
      }

      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update failed.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-label">PIZZAHUB MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage customer orders and delivery status.</p>
        </div>

        <button className="admin-refresh" onClick={fetchOrders}>
          ↻ Refresh Orders
        </button>
      </header>

      <section className="admin-stats">
        <div className="admin-stat-card">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="admin-stat-card">
          <span>Pending Orders</span>
          <h2>{orders.filter((order) => order.status === "Pending").length}</h2>
        </div>

        <div className="admin-stat-card">
          <span>Delivered Orders</span>
          <h2>{orders.filter((order) => order.status === "Delivered").length}</h2>
        </div>

        <div className="admin-stat-card">
          <span>Total Revenue</span>
          <h2>
            ₹
            {orders
              .filter((order) => order.status !== "Cancelled")
              .reduce((total, order) => total + order.totalAmount, 0)}
          </h2>
        </div>
      </section>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-orders-section">
        <div className="admin-section-heading">
          <h2>Customer Orders</h2>
          <span>{orders.length} Orders</span>
        </div>

        {orders.length === 0 ? (
          <div className="admin-empty">No orders found.</div>
        ) : (
          <div className="admin-orders-grid">
            {orders.map((order) => (
              <article className="admin-order-card" key={order._id}>
                <div className="admin-order-top">
                  <div>
                    <span className="admin-order-number">ORDER ID</span>
                    <h3>#{order._id.slice(-8).toUpperCase()}</h3>
                  </div>

                  <span
                    className={`admin-status status-${order.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="admin-customer">
                  <h3>{order.customer.name}</h3>
                  <p>📞 {order.customer.phone}</p>
                  <p>
                    📍 {order.customer.address}, {order.customer.city} -{" "}
                    {order.customer.pincode}
                  </p>
                </div>

                <div className="admin-order-items">
                  <h4>Order Items</h4>
                  {order.items.map((item, index) => (
                    <div className="admin-item-row" key={item._id || index}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                <div className="admin-order-total">
                  <span>Total Amount</span>
                  <strong>₹{order.totalAmount}</strong>
                </div>

                <div className="admin-payment">
                  Payment: {order.paymentMethod}
                </div>

                <div className="admin-status-control">
                  <label htmlFor={`status-${order._id}`}>
                    Update Order Status
                  </label>

                  <select
                    id={`status-${order._id}`}
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(event) =>
                      updateStatus(order._id, event.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {updatingId === order._id && (
                    <small>Updating status...</small>
                  )}
                </div>

                <p className="admin-order-date">
                  Ordered: {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
