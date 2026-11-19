import { useState } from 'react'
import './App.css'
import AdminDashboard from "./assets/admin/AdminDashboard";

const pizzas = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Classic cheese pizza with fresh mozzarella and tomato sauce.',
    price: 199,
    category: 'Classic',
    image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700'
  },
  {
    id: 2,
    name: 'Farmhouse Pizza',
    description: 'Loaded with capsicum, onion, tomato and delicious cheese.',
    price: 299,
    category: 'Veg Special',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700'
  },
  {
    id: 3,
    name: 'Pepperoni Pizza',
    description: 'Delicious pizza topped with spicy pepperoni and mozzarella.',
    price: 349,
    category: 'Non-Veg',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=700'
  },
  {
    id: 4,
    name: 'Cheese Burst Pizza',
    description: 'Extra cheese, rich creamy flavour and a crispy crust.',
    price: 279,
    category: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=700'
  },
  {
    id: 5,
    name: 'Veggie Supreme',
    description: 'A delicious combination of fresh vegetables and herbs.',
    price: 319,
    category: 'Veg Special',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=700'
  },
  {
    id: 6,
    name: 'Chicken Tikka Pizza',
    description: 'Indian-style chicken tikka with spicy sauce and cheese.',
    price: 379,
    category: 'Non-Veg',
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=700'
  }
]

// CUSTOMER WEBSITE
function CustomerApp() {
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderReviewed, setOrderReviewed] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [savedOrder, setSavedOrder] = useState(null)
  const [orderError, setOrderError] = useState('')

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'Cash on Delivery'
  })

  // Add pizza to cart
  const addToCart = (pizza) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item.id === pizza.id
      )

      if (existingItem) {
        return previousCart.map((item) =>
          item.id === pizza.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...previousCart, { ...pizza, quantity: 1 }]
    })
  }

  // Increase quantity
  const increaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  // Remove item
  const removeItem = (id) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    )
  }

  // Open cart
  const openCart = () => {
    setShowCart(true)
    setShowCheckout(false)
    setOrderReviewed(false)
    setOrderError('')

    setTimeout(() => {
      document.getElementById('cart')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 150)
  }

  // Cart calculations
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  // Customer form input
  const handleCustomerChange = (event) => {
    const { name, value } = event.target

    setCustomer((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  // Checkout form submit
  const handleCheckoutSubmit = (event) => {
    event.preventDefault()
    setOrderError('')
    setOrderReviewed(true)

    setTimeout(() => {
      document.getElementById('order-review')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  // Place order and save it to MongoDB
  const handlePlaceOrder = async () => {
    if (isPlacingOrder || cart.length === 0) return

    setIsPlacingOrder(true)
    setOrderError('')

    const orderData = {
      customer,
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: totalPrice,
      paymentMethod: customer.paymentMethod
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(
          'Backend ne JSON response nahi diya. Backend server aur API route check karein.'
        )
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to place your order.')
      }

      setSavedOrder(data.order)
      setOrderPlaced(true)
      setCart([])
    } catch (error) {
      console.error('Place Order Error:', error)
      setOrderError(
        error.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          🍕 Pizza<span>Hub</span>
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#menu">Menu</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="nav-actions">
          <button
            className="cart-nav-btn"
            onClick={openCart}
          >
            🛒 Cart ({cartCount})
          </button>

          <button
            className="nav-btn"
            onClick={() => {
              window.location.href = '/admin-login'
            }}
          >
            Admin Login
          </button>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero-section" id="home">
          <div className="hero-content">
            <span className="tagline">
              🔥 FRESHLY BAKED EVERY DAY
            </span>

            <h1>
              Delicious Pizza,
              <br />
              <span>Delivered Fast.</span>
            </h1>

            <p>
              Experience the taste of authentic pizza made with fresh
              ingredients, delicious cheese and unforgettable flavours.
            </p>

            <div className="hero-buttons">
              <a href="#menu" className="order-btn">
                Order Now →
              </a>

              <a href="#menu" className="menu-btn">
                Explore Menu
              </a>
            </div>

            <div className="hero-info">
              <div>
                <strong>30 Min</strong>
                <small>Fast Delivery</small>
              </div>

              <div>
                <strong>100%</strong>
                <small>Fresh Ingredients</small>
              </div>

              <div>
                <strong>4.9 ★</strong>
                <small>Customer Rating</small>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="pizza-circle">🍕</div>
            <span className="floating-label">
              HOT & FRESH 🔥
            </span>
          </div>
        </section>

        {/* MENU SECTION */}
        <section className="menu-section" id="menu">
          <span className="tagline">OUR SPECIALITIES</span>
          <h2>Explore Our Menu</h2>

          <p>
            Fresh taste, amazing flavours and happiness in every bite.
          </p>

          <div className="pizza-grid">
            {pizzas.map((pizza) => (
              <div className="pizza-card" key={pizza.id}>
                <div className="pizza-card-image">
                  <img src={pizza.image} alt={pizza.name} />

                  <span className="pizza-category">
                    {pizza.category}
                  </span>
                </div>

                <div className="pizza-card-content">
                  <h3>{pizza.name}</h3>
                  <p>{pizza.description}</p>

                  <div className="pizza-card-bottom">
                    <strong>₹{pizza.price}</strong>

                    <button
                      className="add-btn"
                      onClick={() => addToCart(pizza)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CART SECTION */}
        {showCart && (
          <section className="cart-section" id="cart">
            <div className="cart-heading">
              <div>
                <span className="tagline">YOUR ORDER</span>
                <h2>Shopping Cart 🛒</h2>
              </div>

              <button
                className="close-cart-btn"
                onClick={() => {
                  setShowCart(false)
                  setShowCheckout(false)
                  setOrderReviewed(false)
                  setOrderPlaced(false)
                  setOrderError('')
                }}
              >
                ✕ Close
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div>🛒</div>
                <h3>Your Cart is Empty</h3>

                <p>
                  Add your favourite pizza to get started!
                </p>

                <button
                  className="add-btn"
                  onClick={() => {
                    setShowCart(false)

                    document.getElementById('menu')?.scrollIntoView({
                      behavior: 'smooth'
                    })
                  }}
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <img src={item.image} alt={item.name} />

                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <p>₹{item.price} each</p>

                        <div className="quantity-controls">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            −
                          </button>

                          <strong>{item.quantity}</strong>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-right">
                        <strong>
                          ₹{item.price * item.quantity}
                        </strong>

                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          🗑 Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <div>
                    <span>Total Items</span>
                    <strong>{cartCount}</strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong>₹{totalPrice}</strong>
                  </div>

                  <button
                    className="checkout-btn"
                    onClick={() => {
                      setShowCheckout(true)
                      setOrderReviewed(false)
                      setOrderPlaced(false)
                      setOrderError('')

                      setTimeout(() => {
                        document.getElementById('checkout')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        })
                      }, 150)
                    }}
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* CHECKOUT SECTION */}
        {showCart && showCheckout && cart.length > 0 && (
          <section className="cart-section checkout-section" id="checkout">
            <div className="cart-heading">
              <div>
                <span className="tagline">DELIVERY DETAILS</span>
                <h2>Checkout 🛵</h2>
              </div>
            </div>

            {orderPlaced ? (
              <div className="order-review" id="order-review">
                <h3>🎉 Order Placed Successfully!</h3>

                <p>
                  Thank you for ordering from PizzaHub.
                  Your order has been saved successfully.
                </p>

                {savedOrder && (
                  <>
                    <div className="review-customer">
                      <h4>Order Information</h4>

                      <p>
                        <strong>Order ID:</strong> {savedOrder._id}
                      </p>

                      <p>
                        <strong>Name:</strong> {savedOrder.customer.name}
                      </p>

                      <p>
                        <strong>Mobile:</strong> {savedOrder.customer.phone}
                      </p>

                      <p>
                        <strong>Payment:</strong> {savedOrder.paymentMethod}
                      </p>

                      <p>
                        <strong>Status:</strong> {savedOrder.status}
                      </p>
                    </div>

                    <div className="review-total">
                      <span>Total Amount</span>
                      <strong>₹{savedOrder.totalAmount}</strong>
                    </div>
                  </>
                )}

                <p className="review-note">
                  Your order details have been stored in our database.
                </p>

                <button
                  className="checkout-btn"
                  onClick={() => {
                    setShowCart(false)
                    setShowCheckout(false)
                    setOrderReviewed(false)
                    setOrderPlaced(false)
                    setSavedOrder(null)
                    setOrderError('')
                  }}
                >
                  Continue Shopping →
                </button>
              </div>
            ) : !orderReviewed ? (
              <form
                className="checkout-form"
                onSubmit={handleCheckoutSubmit}
              >
                <h3>Customer Information</h3>

                <label htmlFor="customer-name">Full Name</label>
                <input
                  id="customer-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={customer.name}
                  onChange={handleCustomerChange}
                  required
                />

                <label htmlFor="customer-phone">Mobile Number</label>
                <input
                  id="customer-phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter 10-digit mobile number"
                  value={customer.phone}
                  onChange={handleCustomerChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />

                <label htmlFor="customer-address">Delivery Address</label>
                <textarea
                  id="customer-address"
                  name="address"
                  placeholder="House number, street, area..."
                  value={customer.address}
                  onChange={handleCustomerChange}
                  rows="3"
                  required
                />

                <label htmlFor="customer-city">City</label>
                <input
                  id="customer-city"
                  type="text"
                  name="city"
                  placeholder="Enter your city"
                  value={customer.city}
                  onChange={handleCustomerChange}
                  required
                />

                <label htmlFor="customer-pincode">PIN Code</label>
                <input
                  id="customer-pincode"
                  type="text"
                  name="pincode"
                  placeholder="Enter 6-digit PIN code"
                  value={customer.pincode}
                  onChange={handleCustomerChange}
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />

                <label htmlFor="payment-method">Payment Method</label>
                <select
                  id="payment-method"
                  name="paymentMethod"
                  value={customer.paymentMethod}
                  onChange={handleCustomerChange}
                >
                  <option value="Cash on Delivery">
                    Cash on Delivery
                  </option>
                </select>

                <button type="submit" className="checkout-btn">
                  Review Your Order →
                </button>
              </form>
            ) : (
              <div className="order-review" id="order-review">
                <h3>Review Your Order 📋</h3>

                <div className="review-customer">
                  <h4>Delivery Information</h4>
                  <p><strong>Name:</strong> {customer.name}</p>
                  <p><strong>Mobile:</strong> {customer.phone}</p>
                  <p><strong>Address:</strong> {customer.address}</p>
                  <p><strong>City:</strong> {customer.city}</p>
                  <p><strong>PIN Code:</strong> {customer.pincode}</p>
                  <p><strong>Payment:</strong> {customer.paymentMethod}</p>
                </div>

                <div className="review-items">
                  <h4>Order Items</h4>

                  {cart.map((item) => (
                    <div className="review-item" key={item.id}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <strong>
                        ₹{item.price * item.quantity}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="review-total">
                  <span>Total Amount</span>
                  <strong>₹{totalPrice}</strong>
                </div>

                {orderError && (
                  <p role="alert" style={{ color: 'red', marginTop: '15px' }}>
                    {orderError}
                  </p>
                )}

                <p className="review-note">
                  Please verify your delivery details before placing your order.
                </p>

                <button
                  className="checkout-btn"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder
                    ? 'Placing Order...'
                    : 'Place Order ✓'}
                </button>

                <button
                  className="checkout-btn"
                  onClick={() => {
                    setOrderReviewed(false)
                    setOrderError('')
                  }}
                  disabled={isPlacingOrder}
                  style={{ marginTop: '12px' }}
                >
                  ← Edit Details
                </button>
              </div>
            )}
          </section>
        )}

        {/* ABOUT SECTION */}
        <section className="about-section" id="about">
          <span className="tagline">ABOUT PIZZAHUB</span>
          <h2>Fresh Pizza. Happy Moments.</h2>

          <p>
            At PizzaHub, we bring together delicious flavours, quality
            ingredients and freshly prepared pizzas. Choose your favourite
            from our menu and enjoy a great meal at home.
          </p>

          <div className="about-highlights">
            <div>
              <h3>🍅 Fresh Ingredients</h3>
              <p>Prepared with carefully selected ingredients.</p>
            </div>

            <div>
              <h3>🔥 Made Fresh</h3>
              <p>Every order is prepared with care.</p>
            </div>

            <div>
              <h3>🛵 Easy Ordering</h3>
              <p>Browse the menu and place your order online.</p>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="contact-section" id="contact">
          <span className="tagline">GET IN TOUCH</span>
          <h2>Contact PizzaHub</h2>

          <p>
            Have a question about your order? Keep your Order ID handy
            and contact the PizzaHub team through the official contact
            details shared by the restaurant.
          </p>

          <a href="#menu" className="order-btn">
            Explore Our Menu →
          </a>
        </section>
      </main>
    </div>
  )
}
// ADMIN LOGIN PAGE
function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoggingIn(true)

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(
          'Admin API se JSON response nahi mila. Backend par /api/admin/login route check karein.'
        )
      }

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || 'Invalid username or password.')
      }

      localStorage.setItem('adminToken', data.token)
      window.location.replace('/admin')

    } catch (error) {
      console.error('Admin Login Error:', error)
      setError(error.message || 'Unable to connect to the server.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">🍕</div>

        <h1>PizzaHub Admin</h1>
        <p>Sign in to manage customer orders</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-username">Username</label>

          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter admin username"
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Signing In...' : 'Login to Dashboard'}
          </button>
        </form>

        <button
          type="button"
          className="back-home"
          onClick={() => (window.location.href = '/')}
        >
          ← Back to Main Website
        </button>
      </div>
    </div>
  )
}

// MAIN APP ROUTING
function App() {
  const currentPath = window.location.pathname

  if (currentPath === '/admin-login') {
    return <AdminLogin />
  }

  if (currentPath === '/admin') {
    if (!localStorage.getItem('adminToken')) {
      window.location.replace('/admin-login')
      return null
    }

    return <AdminDashboard />
  }

  return <CustomerApp />
}

export default App