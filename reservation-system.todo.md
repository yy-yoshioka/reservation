# 予約管理システム Implementation Plan

## 🔎 Step 1: Comprehensive Application Structure Analysis

<analysis>
## ✅ Pages and Routes
- / (Landing Page)
- /login (Login Page)
- /signup (Signup Page)
- /dashboard (Main Dashboard)
- /dashboard/calendar (Calendar View)
- /dashboard/reservations (Reservation List View)
- /dashboard/reservations/[id] (Single Reservation View)
- /dashboard/reservations/new (Create New Reservation)
- /dashboard/reservations/[id]/edit (Edit Reservation)
- /dashboard/settings (User Settings)
- /dashboard/admin (Admin Panel - for admin users only)
- /dashboard/admin/users (User Management - for admin users only)

## ✅ API Endpoints
- GET /api/reservations - Get all reservations (with filtering options)
- GET /api/reservations/[id] - Get a specific reservation
- POST /api/reservations - Create a new reservation
- PUT /api/reservations/[id] - Update an existing reservation
- DELETE /api/reservations/[id] - Delete a reservation
- GET /api/availability - Get available time slots
- GET /api/users - Get all users (admin only)
- GET /api/users/[id] - Get a specific user (admin only)
- PUT /api/users/[id] - Update user details (admin only)
- GET /api/me - Get current user profile
- PUT /api/me - Update current user profile

## ✅ Reusable Components
- Layout Components:
  - MainLayout (includes navigation, header, footer)
  - DashboardLayout (dashboard-specific layout)
  - AuthLayout (for login/signup pages)
  
- UI Components:
  - Button (primary, secondary, danger variants)
  - Input (text, email, password, date, time)
  - Select (dropdown)
  - Modal (for confirmations, forms)
  - Alert (success, error, warning, info)
  - Card (for displaying information)
  - Badge (for status indicators)
  
- Calendar Components:
  - Calendar (main calendar component)
  - CalendarDay (single day view)
  - CalendarWeek (week view)
  - CalendarMonth (month view)
  - TimeSlot (individual time slot)
  
- Reservation Components:
  - ReservationForm (create/edit reservation)
  - ReservationList (list of reservations)
  - ReservationCard (individual reservation display)
  - ReservationFilter (filter options for reservations)
  
- Authentication Components:
  - LoginForm
  - SignupForm
  - PasswordResetForm
  
- Navigation Components:
  - Navbar
  - Sidebar
  - Breadcrumbs
  - Pagination

## ✅ Database Schema

### Tables

1. **users**
   - id: uuid (primary key)
   - email: string (unique)
   - password: string (hashed)
   - first_name: string
   - last_name: string
   - role: enum ('admin', 'staff', 'customer')
   - phone: string (nullable)
   - created_at: timestamp
   - updated_at: timestamp

2. **reservations**
   - id: uuid (primary key)
   - title: string
   - description: text (nullable)
   - start_time: timestamp
   - end_time: timestamp
   - customer_id: uuid (foreign key to users.id)
   - created_by: uuid (foreign key to users.id)
   - status: enum ('pending', 'confirmed', 'cancelled', 'completed')
   - created_at: timestamp
   - updated_at: timestamp

3. **reservation_details**
   - id: uuid (primary key)
   - reservation_id: uuid (foreign key to reservations.id)
   - special_requests: text (nullable)
   - number_of_people: integer (nullable)
   - additional_notes: text (nullable)

4. **availability_settings**
   - id: uuid (primary key)
   - day_of_week: integer (0-6, representing Sunday-Saturday)
   - start_time: time
   - end_time: time
   - is_available: boolean
   - created_at: timestamp
   - updated_at: timestamp

### Relationships
- A user can have many reservations (as a customer)
- A user can create many reservations (as staff/admin)
- A reservation belongs to one customer (user)
- A reservation is created by one user (staff/admin)
- A reservation has one reservation_detail record
- Availability settings define when reservations can be made

### Row-Level Security (RLS) Policies
- Users can only view and modify their own profile information
- Customers can only view and modify their own reservations
- Staff can view all reservations but only modify reservations they created
- Admins have full access to all records
- Availability settings can only be modified by admins
</analysis>

# Step 2: Implementation Brainstorming

<brainstorming>
For the 予約管理システム (Reservation Management System), I need to plan a logical implementation sequence that addresses all requirements while maintaining dependencies and ensuring a solid foundation.

### Logical Order Considerations:

1. **Foundation First**: We need to establish the core infrastructure before building features:
   - Database schema and RLS policies must be implemented first as they're foundational
   - Authentication and middleware setup should come early as they protect routes
   - Reusable components should be built before the pages that use them

2. **Authentication and Authorization Flow**:
   - The starter template has basic login/signup, but we need to extend it with:
     - Role-based access (admin, staff, customer)
     - Protected routes based on roles
     - Session persistence
     - Middleware for route protection

3. **Data Layer Before UI**:
   - API endpoints should be implemented before the UI components that consume them
   - Database triggers and functions for complex operations should be created early
   - Type definitions should be established before implementing components

4. **Core Features Before Extensions**:
   - Calendar and reservation management are core features
   - Admin functionality can come after the basic reservation system works
   - Settings and user management are secondary to the core reservation functionality

### Middleware, Auth, and Edge Cases:

1. **Authentication Middleware**:
   - Need middleware to check auth status on protected routes
   - Should redirect unauthenticated users to login
   - Must verify user roles for role-protected routes

2. **Form Validation**:
   - Client-side validation for immediate feedback
   - Server-side validation for security
   - Consider using a form library like React Hook Form with Zod for validation

3. **Error Handling**:
   - Global error boundary for unexpected errors
   - API error handling with proper status codes
   - User-friendly error messages
   - Logging for debugging

4. **Edge Cases**:
   - Handling timezone differences for reservations
   - Concurrent reservation attempts for the same slot
   - Session expiration during form submission
   - Network failures during API calls
   - Database constraints for overlapping reservations

5. **Authorization Concerns**:
   - RLS policies must be carefully designed to prevent data leakage
   - API endpoints need role checks before operations
   - UI should conditionally render based on permissions

6. **Performance Considerations**:
   - Calendar view might need optimization for many reservations
   - Consider pagination for reservation lists
   - Implement caching where appropriate

### Implementation Strategy:
- Start with database schema and RLS policies
- Implement authentication flow with role management
- Create core reusable components
- Build API endpoints with proper validation and error handling
- Implement the main pages and features
- Add admin functionality
- Implement settings and user management
- Add polish and optimizations
</brainstorming>

# Step 3: Detailed Implementation Plan

# Implementation Plan

## Project Setup and Configuration
- [x] Step 1: Project Structure and Type Definitions
  - **Task**: Set up the project structure and define TypeScript interfaces for the application
  - **Files**:
    - app/types/index.ts: Define interfaces for User, Reservation, ReservationDetails, etc.
    - app/lib/utils.ts: Create utility functions
  - **Step Dependencies**: None
  - **User Instructions**: None (using existing starter template)

## Database Schema and Security Setup
- [x] Step 2: Database Schema Implementation
  - **Task**: Create database tables, relationships, and initial seed data
  - **Files**:
    - supabase/migrations/001_initial_schema.sql: SQL for creating tables
    - supabase/seed.sql: Initial seed data for testing
  - **Step Dependencies**: Step 1
  - **User Instructions**: Execute SQL scripts in Supabase dashboard or via CLI

- [x] Step 3: Row-Level Security Policies
  - **Task**: Implement RLS policies for all tables to enforce access control
  - **Files**:
    - supabase/migrations/002_rls_policies.sql: SQL for RLS policies
  - **Step Dependencies**: Step 2
  - **User Instructions**: Execute SQL script in Supabase dashboard or via CLI

## Authentication and Authorization
- [x] Step 4: Authentication Context and Hooks
  - **Task**: Create authentication context and custom hooks for auth state management
  - **Files**:
    - app/contexts/AuthContext.tsx: Auth context provider
    - app/hooks/useAuth.ts: Custom hook for auth operations
    - app/hooks/useUser.ts: Hook for user data and operations
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

- [x] Step 5: Middleware and Route Protection
  - **Task**: Implement middleware for route protection and role-based access
  - **Files**:
    - app/middleware.ts: Next.js middleware for route protection
    - app/lib/auth.ts: Helper functions for auth checks
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

## Core UI Components
- [x] Step 6: Layout Components
  - **Task**: Create reusable layout components
  - **Files**:
    - app/components/layouts/MainLayout.tsx: Main application layout
    - app/components/layouts/DashboardLayout.tsx: Dashboard-specific layout
    - app/components/layouts/AuthLayout.tsx: Layout for auth pages
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

- [x] Step 7: Basic UI Components
  - **Task**: Create reusable UI components
  - **Files**:
    - app/components/ui/Button.tsx: Button component with variants
    - app/components/ui/Input.tsx: Input component with variants
    - app/components/ui/Select.tsx: Select/dropdown component
    - app/components/ui/Modal.tsx: Modal component
    - app/components/ui/Alert.tsx: Alert component with variants
    - app/components/ui/Card.tsx: Card component
    - app/components/ui/Badge.tsx: Badge component for status indicators
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

- [x] Step 8: Navigation Components
  - **Task**: Create navigation components
  - **Files**:
    - app/components/navigation/Navbar.tsx: Top navigation bar
    - app/components/navigation/Sidebar.tsx: Dashboard sidebar
    - app/components/navigation/Breadcrumbs.tsx: Breadcrumb navigation
    - app/components/navigation/Pagination.tsx: Pagination component
  - **Step Dependencies**: Step 7
  - **User Instructions**: None

## API Implementation
- [x] Step 9: API Utilities and Error Handling
  - **Task**: Create API utilities and error handling functions
  - **Files**:
    - app/lib/api.ts: API utility functions
    - app/lib/error.ts: Error handling utilities
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

- [x] Step 10: Reservation API Routes
  - **Task**: Implement reservation-related API endpoints
  - **Files**:
    - app/api/reservations/route.ts: GET and POST handlers
    - app/api/reservations/[id]/route.ts: GET, PUT, DELETE handlers
  - **Step Dependencies**: Step 2, Step 3, Step 9
  - **User Instructions**: None

- [x] Step 11: Availability API Routes
  - **Task**: Implement availability-related API endpoints
  - **Files**:
    - app/api/availability/route.ts: GET handler for available time slots
  - **Step Dependencies**: Step 2, Step 3, Step 9
  - **User Instructions**: None

- [x] Step 12: User API Routes
  - **Task**: Implement user-related API endpoints
  - **Files**:
    - app/api/users/route.ts: GET handler (admin only)
    - app/api/users/[id]/route.ts: GET, PUT handlers (admin only)
    - app/api/me/route.ts: GET, PUT handlers for current user
  - **Step Dependencies**: Step 2, Step 3, Step 9
  - **User Instructions**: None

## Calendar Components
- [x] Step 13: Calendar Core Components
  - **Task**: Implement core calendar components
  - **Files**:
    - app/components/calendar/Calendar.tsx: Main calendar component
    - app/components/calendar/CalendarDay.tsx: Day view component
    - app/components/calendar/CalendarWeek.tsx: Week view component
    - app/components/calendar/CalendarMonth.tsx: Month view component
    - app/components/calendar/TimeSlot.tsx: Time slot component
  - **Step Dependencies**: Step 7, Step 9
  - **User Instructions**: None

## Reservation Components
- [ ] Step 14: Reservation Components
  - **Task**: Implement reservation-related components
  - **Files**:
    - app/components/reservations/ReservationForm.tsx: Form for creating/editing reservations
    - app/components/reservations/ReservationList.tsx: List of reservations
    - app/components/reservations/ReservationCard.tsx: Individual reservation display
    - app/components/reservations/ReservationFilter.tsx: Filter for reservations
  - **Step Dependencies**: Step 7, Step 9, Step 10
  - **User Instructions**: None

## Page Implementation
- [ ] Step 15: Landing and Auth Pages
  - **Task**: Enhance landing page and auth pages
  - **Files**:
    - app/page.tsx: Landing page
    - app/login/page.tsx: Login page (enhance existing)
    - app/signup/page.tsx: Signup page (enhance existing)
  - **Step Dependencies**: Step 6, Step 7
  - **User Instructions**: None

- [ ] Step 16: Dashboard Home Page
  - **Task**: Implement dashboard home page
  - **Files**:
    - app/dashboard/page.tsx: Dashboard home page
  - **Step Dependencies**: Step 6, Step 8, Step 13, Step 14
  - **User Instructions**: None

- [ ] Step 17: Calendar View Page
  - **Task**: Implement calendar view page
  - **Files**:
    - app/dashboard/calendar/page.tsx: Calendar view page
  - **Step Dependencies**: Step 13, Step 14
  - **User Instructions**: None

- [ ] Step 18: Reservation List Pages
  - **Task**: Implement reservation list and detail pages
  - **Files**:
    - app/dashboard/reservations/page.tsx: Reservation list page
    - app/dashboard/reservations/[id]/page.tsx: Single reservation view
    - app/dashboard/reservations/new/page.tsx: Create new reservation
    - app/dashboard/reservations/[id]/edit/page.tsx: Edit reservation
  - **Step Dependencies**: Step 14
  - **User Instructions**: None

- [ ] Step 19: Settings Page
  - **Task**: Implement user settings page
  - **Files**:
    - app/dashboard/settings/page.tsx: User settings page
  - **Step Dependencies**: Step 7, Step 12
  - **User Instructions**: None

- [ ] Step 20: Admin Pages
  - **Task**: Implement admin panel and user management
  - **Files**:
    - app/dashboard/admin/page.tsx: Admin panel
    - app/dashboard/admin/users/page.tsx: User management
  - **Step Dependencies**: Step 7, Step 12
  - **User Instructions**: None

<!-- ## Form Validation and Error Handling
- [x] Step 21: Form Validation Implementation
  - **Task**: Implement form validation for all forms
  - **Files**:
    - src/lib/validation.ts: Validation schemas
    - Update form components to use validation
  - **Step Dependencies**: Step 14, Step 18, Step 19, Step 20
  - **User Instructions**: None

- [x] Step 22: Error Handling and Notifications
  - **Task**: Implement global error handling and notifications
  - **Files**:
    - src/components/ui/Toast.tsx: Toast notification component
    - src/contexts/ToastContext.tsx: Toast context for notifications
    - src/app/error.tsx: Global error boundary
  - **Step Dependencies**: Step 7
  - **User Instructions**: None -->

<!-- ## Testing and Optimization
- [x] Step 23: Unit Testing
  - **Task**: Implement unit tests for critical components and functions
  - **Files**:
    - src/tests/unit/*: Unit test files
  - **Step Dependencies**: All implementation steps
  - **User Instructions**: Run `npm test` to execute tests

- [x] Step 24: Performance Optimization
  - **Task**: Optimize performance for calendar and reservation list
  - **Files**:
    - Update relevant components with optimizations
  - **Step Dependencies**: Step 13, Step 14, Step 17, Step 18
  - **User Instructions**: None

## Deployment Preparation
- [x] Step 25: Environment Configuration
  - **Task**: Set up environment variables for different environments
  - **Files**:
    - .env.example: Example environment variables
    - .env.production: Production environment variables
  - **Step Dependencies**: None
  - **User Instructions**: Configure environment variables for deployment

- [x] Step 26: Deployment Documentation
  - **Task**: Create deployment documentation
  - **Files**:
    - DEPLOYMENT.md: Deployment instructions
  - **Step Dependencies**: Step 25
  - **User Instructions**: Follow instructions in DEPLOYMENT.md for deployment -->