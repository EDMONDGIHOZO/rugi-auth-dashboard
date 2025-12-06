# Rugi-auth dashboard

A modern, responsive React-based admin dashboard for managing a centralized authentication service. Built with React 18, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- 🔐 **Authentication**: Secure login with JWT token management
- 📊 **Dashboard**: Overview with statistics, charts, and recent activity
- 🚀 **Applications Management**: Create, edit, and manage OAuth applications
- 👥 **Users Management**: Manage users, assign roles, and track user activity
- 🛡️ **Roles Management**: View and manage roles across applications
- 📝 **Audit Logs**: Comprehensive audit logging with filtering and export
- ⚙️ **Settings**: Profile and API configuration management

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running at `http://localhost:3000` (or configure via environment variables)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rugi-auth-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_DASHBOARD_CLIENT_ID=your_client_id
VITE_DASHBOARD_CLIENT_SECRET=your_client_secret
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
  components/
    ui/              # shadcn/ui components
    layout/          # Layout components (Sidebar, Header, etc.)
    features/        # Feature-specific components
      apps/
      users/
  pages/             # Page components
    apps/
    users/
    roles/
    audit/
  contexts/          # React contexts (Auth)
  lib/               # Utilities, API client, constants
  types/             # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The dashboard expects the following backend endpoints:

### Authentication
- `POST /login` - Login and get tokens
- `POST /refresh` - Refresh access token
- `POST /revoke` - Revoke refresh token
- `GET /me` - Get current user info

### Applications
- `GET /apps` - List all applications
- `GET /apps/:id` - Get application details
- `POST /apps` - Create new application
- `PUT /apps/:id` - Update application
- `DELETE /apps/:id` - Delete application
- `GET /apps/:id/users` - Get users with roles for an app
- `POST /apps/:id/roles` - Create/verify role for app

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/roles` - Get all roles for a user
- `POST /users/:id/roles` - Assign role to user
- `DELETE /users/:id/roles/:roleId` - Remove role from user

### Audit Logs
- `GET /audit` - List audit logs with filters

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for the API (default: `http://localhost:3000`)
- `VITE_DASHBOARD_CLIENT_ID` - Client ID for dashboard authentication
- `VITE_DASHBOARD_CLIENT_SECRET` - Client secret for dashboard authentication

## Features in Detail

### Dashboard
- Overview cards showing total users, applications, and recent events
- Charts for user registrations, login activity, and app distribution
- Recent activity feed

### Applications Management
- List all applications with search and filtering
- Create new applications with client credentials
- Edit application details
- View application details with associated users and roles
- Delete applications

### Users Management
- List all users with search and filtering
- Create new users
- Edit user details (email, verification status, MFA)
- View user details with assigned roles
- Assign/remove roles to/from users
- Delete users

### Roles Management
- View all roles across the system
- See usage count for each role
- View role assignments

### Audit Logs
- View all audit log entries
- Filter by user, action, and date range
- Export logs to CSV or JSON
- Pagination support

## Development

### Adding New Features

1. Create components in the appropriate directory
2. Add routes in `src/App.tsx`
3. Add API methods in `src/lib/api.ts`
4. Add TypeScript types in `src/types/index.ts`

### Styling

The project uses Tailwind CSS with shadcn/ui components. Customize the theme in `src/index.css` and `tailwind.config.js`.

## License

MIT

