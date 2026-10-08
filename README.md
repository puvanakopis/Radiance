# ✨ Radiance — Botanical Skincare E-Commerce Platform

> 🌐 **Live Demo**: [https://radiance-snowy.vercel.app/](https://radiance-snowy.vercel.app/)

## 🌿 Project Overview

Radiance is a modern, full-stack botanical skincare e-commerce application designed and developed to fulfill the Cosmetics & Beauty Products Store business scenario. The platform delivers a luxurious, nature-inspired shopping experience for customers seeking organic and plant-powered beauty products, paired with an administrative dashboard for store managers.

The system covers the entire e-commerce lifecycle: product discovery, dynamic filtering, real-time cart and persistent wishlist management, dual-mode checkout (PayHere Online Payment and Order via WhatsApp), customer accounts, order tracking, and administrative control over inventory, orders, and customer data.

---

## 🌟 Features

### 🛍️ Customer Experience
- **Elegant Botanical Design**: Clean, responsive, glassmorphic UI styled with Tailwind CSS and animated using Framer Motion.
- **Product Discovery**: Rich product browsing with category filtering, detailed ingredient lists, benefits, and skin-type recommendations.
- **Cart & Wishlist**: Real-time cart state management and persistent user wishlists.
- **Seamless Checkout**: Multi-step checkout supporting Cash on Delivery (COD) and online card payments.
- **Payment Gateway Integration**: Integrated with **PayHere** payment gateway (Sandbox & Production ready).
- **Order Tracking**: Real-time order progress tracking and history in the user account portal.
- **User Authentication**: Secure signup, login, profile management, and password reset flows via OTP email verification.
- **Instant WhatsApp Support**: Direct integration with WhatsApp business channels for rapid customer inquiries.

### 🛡️ Admin Dashboard (`/admin`)
- **Sales & Analytics Overview**: Key performance metrics including total revenue, order counts, customer volume, and sales trends.
- **Product Management**: Full CRUD operations for products with inventory control, category tagging, pricing, discount management, and ingredient highlights.
- **Order Management**: Comprehensive order lifecycle tracking (Pending, Processing, Shipped, Delivered, Cancelled) and payment status verification.
- **Customer Management**: Detailed directory of registered customers, purchase history, and account activity.

### 🔒 Security & Performance
- **Token-based Authentication**: JWT authentication with protected routes for users and administrators.
- **Password Protection**: Salted password hashing with `bcryptjs`.
- **API Security**: Request security using `helmet`, configurable `cors`, and `express-rate-limit`.
- **Serverless Ready**: Modular structure with database connection pooling optimized for Vercel deployment.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations & Icons**: [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Utilities**: `canvas-confetti`, `clsx`, `tailwind-merge`, `qrcode.react`
- **Language**: TypeScript

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js 4](https://expressjs.com/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) with [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: `jsonwebtoken` (JWT), `bcryptjs`
- **Email Service**: `nodemailer` (SMTP)
- **Security**: `helmet`, `cors`, `express-rate-limit`

---

## 📁 Project Architecture

```text
Radiance/
├── backend/
│   ├── api/                     # Vercel serverless entry point
│   ├── src/
│   │   ├── config/              # DB connection & environment configurations
│   │   ├── controllers/         # Request handling & business logic
│   │   ├── middleware/          # Auth guards, validation, rate limiting & error handling
│   │   ├── models/              # Mongoose schemas (Admin, Customer, Product, Order, OTP)
│   │   ├── routes/              # Express API route declarations
│   │   ├── scripts/             # Database seeding scripts (Admin & Products)
│   │   ├── utils/               # Helper utilities (Email, JWT, PayHere hash, etc.)
│   │   └── server.js            # Express app entry & middleware setup
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
│
├── frontend/
│   ├── public/                  # Static assets & images
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── (admin)/admin    # Admin portal pages (Dashboard, Products, Orders, Customers)
│   │   │   ├── (auth)/          # Authentication pages (Login, Register, Forgot Password)
│   │   │   ├── (private)/       # Protected customer pages (Account, Orders, Wishlist, Checkout)
│   │   │   └── (public)/        # Public pages (Home, Products, About, Contact)
│   │   ├── components/          # Reusable UI, Layout, Modal, and Form components
│   │   ├── context/             # Global React contexts (AuthContext, CartContext, WishlistContext)
│   │   ├── services/            # Client-side API request services
│   │   └── types/               # TypeScript interfaces & types
│   ├── package.json
│   ├── next.config.ts
│   └── .env.example
│
└── README.md
```

---

## 🗄️ Database Design & Schemas

The application uses **MongoDB** with **Mongoose ODM** to manage data persistence. The schema is optimized for cosmetics e-commerce, supporting variable product attributes (skin types, botanical ingredients, sizes/volumes), customer address books, persistent wishlists, and order lifecycle tracking.

### Entity Relationship Diagram

```
+-------------------+          +-------------------+          +-------------------+
|     Customer      | 1      * |       Order       | *      * |      Product      |
+-------------------+----------+-------------------+----------+-------------------+
| _id               |          | _id               |          | _id               |
| firstName         |          | orderNumber       |          | name              |
| lastName          |          | customer (FK)     |          | slug              |
| email (unique)    |          | items: [          |          | category          |
| password (hash)   |          |   { product,      |          | price             |
| phone             |          |     name,         |          | discountPrice     |
| addresses: [      |          |     size,         |          | stockQuantity     |
|   { street, city, |          |     price,        |          | sizes / volume    |
|     district }    |          |     quantity }    |          | ingredients: []   |
| ]                 |          | ]                 |          | skinTypes: []     |
| wishlist: [FK]    |          | subtotal          |          | benefits: []      |
| isActive          |          | deliveryFee       |          | images: []        |
+-------------------+          | discount          |          | isFeatured        |
                               | totalAmount       |          +-------------------+
+-------------------+          | paymentMethod     |
|       Admin       |          | paymentStatus     |
+-------------------+          | orderStatus       |
| _id               |          | shippingAddress   |
| email (unique)    |          | timeline: []      |
| password (hash)   |          +-------------------+
| role: 'superadmin'|
+-------------------+
```

### Schema Breakdown

1. **`Product` (`product.model.js`)**:
   - **Catalog Details**: `name`, `slug`, `tagline`, `description`, `category` (Cleansers, Serums, Moisturizers, Toners, Masks, Sunscreens), `subCategory`.
   - **Pricing & Inventory**: `price`, `discountPrice`, `stockQuantity`, `sku`, `lowStockThreshold`.
   - **Cosmetics Specifics**: `ingredients` (array of botanical extracts), `skinTypes` (Oily, Dry, Sensitive, Combination), `benefits`, `usageDirections`, `volume`, `sizes`.
   - **Display Flags**: `images`, `rating`, `reviewCount`, `isFeatured`, `isBestSeller`, `isActive`.

2. **`Customer` (`customer.model.js`)**:
   - **Account Details**: `firstName`, `lastName`, `email` (unique index), `password` (bcrypt hashed), `phone`.
   - **Address Book**: Subdocument array of shipping addresses with default address flag.
   - **Wishlist**: Array of referenced `Product` ObjectIds.

3. **`Order` (`order.model.js`)**:
   - **Reference & Parties**: `orderNumber` (e.g., `RAD-10001`), `customer` (ObjectId reference to Customer), `customerEmail`, `customerPhone`.
   - **Purchased Items**: Embedded array of item snapshots containing `productId`, `name`, `size`, `unitPrice`, and `quantity`.
   - **Financials**: `subtotal`, `deliveryFee`, `discount`, `totalAmount`.
   - **Status & Method**:
     - `paymentMethod`: `'payhere'` | `'whatsapp'` | `'cod'`
     - `paymentStatus`: `'pending'` | `'paid'` | `'failed'`
     - `orderStatus`: `'pending'` | `'processing'` | `'shipped'` | `'delivered'` | `'cancelled'`
   - **Fulfillment**: `shippingAddress`, `notes`, `timeline` tracking timestamped lifecycle events.

4. **`Admin` (`admin.model.js`)**:
   - Stores administrator credentials with hashed passwords and role designations (`'superadmin'` | `'manager'`).

5. **`OTP` (`otp.model.js`)**:
   - Stores 6-digit verification codes for password reset workflows with automated MongoDB TTL index expiration (10 minutes).

6. **`Counter` (`counter.model.js`)**:
   - Atomic sequence counter ensuring sequentially incremented, collision-free order numbers.

---

## 📦 Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [MongoDB](https://www.mongodb.com/) (Local server or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI)
- Package Manager: `npm`, `pnpm`, or `yarn`

---

## 🚀 Installation & Setup

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   **`backend/.env` format:**
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Database
   DATABASE_URL=mongodb://localhost:27017/radiance

   # Authentication Security
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # PayHere Gateway Credentials
   PAYHERE_MERCHANT_ID=1211149
   PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
   PAYHERE_SANDBOX=true
   PAYHERE_NOTIFY_URL=http://localhost:5000/api/payments/payhere/notify

   # Store Settings
   WHATSAPP_BUSINESS_NUMBER=+94771234567
   STORE_CURRENCY=LKR
   FREE_DELIVERY_THRESHOLD=7500
   DEFAULT_DELIVERY_FEE=450

   # Email / SMTP Credentials
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_SECURE=false
   SMTP_FROM="Radiance Botanical Skincare" <noreply@radiance.lk>

   # Initial Admin Credentials (for seed script)
   ADMIN_EMAIL=admin@radiance.com
   ADMIN_PASSWORD=Admin@123456
   ADMIN_FIRST_NAME=Master
   ADMIN_LAST_NAME=Admin
   ```

4. Seed initial database records (optional but recommended):
   ```bash
   npm run seed:admin      # Seeds default administrator account
   npm run seed:products   # Seeds initial skincare catalog
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   > The API will be running at `http://localhost:5000`.

---

### 2. Frontend Setup

1. In a new terminal window, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend/` directory (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   **`frontend/.env` format:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_WHATSAPP_NUMBER=+94712621098
   NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=+94712621098
   ```

4. Run the frontend development server:
   ```bash
   npm run dev
   ```
   > The web application will be accessible at `http://localhost:3000`.

---

## 🌿 Database Seeding

The backend includes automated seeding scripts to get your development environment populated quickly:

```bash
# In the backend directory:
npm run seed:admin     # Seeds master administrator account
npm run seed:products  # Seeds products with categories, pricing, images, and descriptions
```

**Default Admin Credentials** (can be configured in `backend/.env`):
- **Email**: `admin@radiance.com`
- **Password**: `Admin@123456`
- **Admin Portal**: `http://localhost:3000/admin`

---

## ⚙️ Environment Variables

### Backend `.env`

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Environment runtime mode | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/radiance` |
| `JWT_SECRET` | Secret key for signing tokens | `your_jwt_secret_key` |
| `JWT_EXPIRES_IN` | JWT token validity lifespan | `7d` |
| `PAYHERE_MERCHANT_ID` | PayHere Merchant ID | `1211149` |
| `PAYHERE_MERCHANT_SECRET`| PayHere Merchant Secret | `your_secret` |
| `PAYHERE_SANDBOX` | Toggle sandbox mode | `true` |
| `PAYHERE_NOTIFY_URL` | Webhook URL for payment notifications | `http://localhost:5000/api/payments/payhere/notify` |
| `STORE_CURRENCY` | Default store currency | `LKR` |
| `FREE_DELIVERY_THRESHOLD`| Order amount eligible for free shipping | `7500` |
| `DEFAULT_DELIVERY_FEE` | Standard delivery charge | `450` |
| `SMTP_HOST` | Outgoing SMTP email server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email username | `your_email@gmail.com` |
| `SMTP_PASS` | Email app-specific password | `your_app_password` |
| `ADMIN_EMAIL` | Default seed admin email | `admin@radiance.com` |
| `ADMIN_PASSWORD` | Default seed admin password | `Admin@123456` |

### Frontend `.env`

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Contact phone number for WhatsApp | `+94712621098` |
| `NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER` | WhatsApp Business support number | `+94712621098` |

---

## 📡 API Endpoints Overview

| Base Path | Description | Access |
| :--- | :--- | :--- |
| `/api/auth` | User registration, login, admin authentication, OTP verification, password reset | Public / Protected |
| `/api/products` | Browse catalog, search, filter, product details, admin CRUD | Public / Admin |
| `/api/cart` | Retrieve, add, update, and remove cart items | Customer |
| `/api/wishlist` | Manage saved favorite products | Customer |
| `/api/orders` | Place orders, retrieve customer order history, admin order status updates | Customer / Admin |
| `/api/customers` | Customer profile management, admin customer listing | Customer / Admin |
| `/api/payments` | PayHere checkout initialization, hash calculation, IPN notification webhook | Customer / PayHere Webhook |
| `/api/health` | Service health status check | Public |

---

## 🚢 Deployment

### Vercel Deployment
Both `frontend` and `backend` directories include custom `vercel.json` configurations ready for zero-config serverless deployment on Vercel:

1. **Deploy Backend**:
   - Point your Vercel project root directory to `backend`.
   - Add backend environment variables in the Vercel dashboard.
2. **Deploy Frontend**:
   - Point your Vercel project root directory to `frontend`.
   - Add `NEXT_PUBLIC_API_URL` targeting your deployed backend URL.

---

## 💬 Support & Inquiries

For questions, issues, or assistance:
- 🌿 **Brand**: Radiance Botanical Skincare
- 💬 **WhatsApp Support**: Available directly through the storefront interface

---

<p align="center">
  Crafted with 🌿 & 💚 for pure, botanical radiance.
</p>

