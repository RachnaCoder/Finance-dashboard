# Finance Dashboard & Access Control Backend

A robust full-stack application built with Express and React, demonstrating role-based access control (RBAC), financial data processing, and dashboard analytics.

## Architecture

### Backend (Node.js + Express)
- **RESTful API**: Structured endpoints for users, records, and dashboard summaries.
- **RBAC Middleware**: Enforces permissions based on user roles (Admin, Analyst, Viewer).
- **In-Memory Database**: A centralized data store (simulating a real DB) with seed data.
- **Validation**: Strict input validation using `Zod`.
- **Error Handling**: Centralized async error handling and consistent API responses.

### Frontend (React + Tailwind CSS)
- **Role Simulation**: A login portal to switch between different user roles.
- **Dynamic Dashboard**: Real-time summary statistics and category breakdowns.
- **Interactive Records**: CRUD operations for financial entries (restricted by role).
- **Responsive Design**: Clean, modern UI built with Tailwind utility classes and Lucide icons.

## Roles & Permissions

| Feature | Viewer | Analyst | Admin |
|---------|--------|---------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Records | ✅ | ✅ | ✅ |
| Filter Records | ✅ | ✅ | ✅ |
| Create Records | ❌ | ❌ | ✅ |
| Edit Records | ❌ | ❌ | ✅ |
| Delete Records | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

## API Endpoints

### Users
- `GET /api/users`: List all users (Admin only)
- `POST /api/users`: Create new user (Admin only)
- `PATCH /api/users/:id`: Update user (Admin only)
- `DELETE /api/users/:id`: Delete user (Admin only)

### Records
- `GET /api/records`: List/Filter financial records
- `POST /api/records`: Create record (Admin only)
- `PUT /api/records/:id`: Update record (Admin only)
- `DELETE /api/records/:id`: Delete record (Admin only)

### Dashboard
- `GET /api/dashboard/summary`: Aggregated financial data (Income, Expense, Balance, Categories)

## Setup & Development

1. **Install Dependencies**: `npm install`
2. **Run Development Server**: `npm run dev`
3. **Access App**: `http://localhost:3000`

## Assumptions & Trade-offs
- **Authentication**: Mocked using a custom `x-user-id` header for simplicity in this assignment.
- **Persistence**: Data is stored in-memory and resets on server restart. In a production app, this would be replaced by PostgreSQL or MongoDB.
- **Validation**: Date formats are strictly enforced as ISO strings or YYYY-MM-DD.
