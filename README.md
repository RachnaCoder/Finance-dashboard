
# Finance Dashboard Application

A full-stack finance dashboard application built using React, TypeScript, and Express. This project demonstrates role-based access control (RBAC), financial data management, and interactive dashboard analytics in a structured and scalable architecture.

---

## Overview

The Finance Dashboard allows users to view and manage financial records based on their assigned roles. It includes a backend API for handling data and a frontend interface for visualization and interaction.

The system supports three roles:
- Admin
- Analyst
- Viewer

Each role has different permissions, ensuring secure and controlled access to features.

---

## Demo Login Credentials

Use the following credentials to explore different roles:

- Admin: `admin@example.com`
- Analyst: `analyst@example.com`
- Viewer: `viewer@example.com`
- Password:`password123`
---

## Tech Stack

### Frontend
- React (with TypeScript)
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript

### Other Tools
- Zod (for validation)
- REST API architecture

---

## Features

- Role-based authentication and authorization
- Interactive financial dashboard with summaries
- CRUD operations for financial records
- Filtering and categorization of records
- Centralized error handling
- Input validation using schema-based approach
- Clean and responsive UI

---

## Roles and Permissions

| Feature              | Viewer | Analyst | Admin |
|---------------------|--------|---------|-------|
| View Dashboard      | Yes    | Yes     | Yes   |
| View Records        | Yes    | Yes     | Yes   |
| Filter Records      | Yes    | Yes     | Yes   |
| Create Records      | No     | No      | Yes   |
| Edit Records        | No     | No      | Yes   |
| Delete Records      | No     | No      | Yes   |
| Manage Users        | No     | No      | Yes   |

---

## Project Structure

```
Finance-dashboard/
│
├── Backend/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── services/
│   ├── server.ts
│   └── tsconfig.json
│
├── Frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── vite.config.ts
│
└── README.md
```

---

## API Endpoints

### Users
- `GET /api/users` – Retrieve all users (Admin only)
- `POST /api/users` – Create a new user (Admin only)
- `PATCH /api/users/:id` – Update user details (Admin only)
- `DELETE /api/users/:id` – Delete a user (Admin only)

### Records
- `GET /api/records` – Retrieve all financial records
- `POST /api/records` – Create a new record (Admin only)
- `PUT /api/records/:id` – Update a record (Admin only)
- `DELETE /api/records/:id` – Delete a record (Admin only)

### Dashboard
- `GET /api/dashboard/summary` – Get financial summary (income, expenses, balance, categories)

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

---

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/finance-dashboard.git
   ```

2. Navigate to the project:
   ```
   cd finance-dashboard
   ```

---

### Backend Setup

```
cd Backend
npm install
npm run build
npm start
```

---

### Frontend Setup

```
cd Frontend
npm install
npm run dev
```

---

### Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=[http://localhost:3000](https://finance-dashboard-d11g.onrender.com/)
```


---

## Deployment

### Frontend
Deploy using platforms like Vercel.

### Backend
Deploy using platforms like Render.

---

## Assumptions and Limitations

- Authentication is simulated using predefined user roles.
- No persistent database is used; data is stored in memory.
- Data resets when the server restarts.
- Designed primarily for demonstration and learning purposes.

---

## Future Improvements

- Integrate a real database (MongoDB or PostgreSQL)
- Implement JWT-based authentication
- Add user registration and secure login
- Improve dashboard analytics with charts
- Add pagination and advanced filtering
- Enhance security and validation layers

---

## Conclusion

This project demonstrates a structured approach to building a full-stack application with role-based access control. It highlights best practices in API design, frontend-backend integration, and scalable architecture.
