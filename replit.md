# Overview

Silaibuddy is a full-stack React application built on the Fusion Starter template. It's a production-ready web application featuring a React 18 frontend with SPA routing, an Express server backend, and Google OAuth integration. The application appears to be focused on providing tailoring or clothing services, with features for user authentication and OTP verification.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: React Router 6 in SPA mode for client-side navigation
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: TailwindCSS 3 with custom theme variables and Radix UI components
- **State Management**: TanStack Query for server state management
- **UI Components**: Comprehensive component library based on Radix UI primitives

## Backend Architecture
- **Runtime**: Node.js with Express server
- **Development Integration**: Vite dev server middleware for seamless full-stack development
- **API Structure**: RESTful endpoints under `/api` prefix
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Data Storage**: In-memory storage for development (users and OTP codes)

## Authentication System
- **Primary Auth**: Username/password with JWT tokens
- **OAuth Integration**: Google OAuth 2.0 using `@react-oauth/google`
- **OTP Verification**: Phone number verification system with time-based codes
- **Security**: bcryptjs for password hashing, JWT for session management

## Build and Deployment
- **Package Manager**: PNPM preferred for dependency management
- **Build Strategy**: Separate client and server builds
- **Production Setup**: Static SPA serving with Express API fallback
- **Development**: Hot module replacement with Vite dev server

## Key Design Decisions

### Monorepo Structure
The application uses a monorepo approach with clear separation:
- `client/` for React frontend code
- `server/` for Express backend code  
- `shared/` for common types and interfaces

### Component Architecture
- Pre-built UI component library in `client/components/ui/`
- Page components in `client/pages/` directory
- Utility functions and hooks for reusable logic

### Development Workflow
- Vite handles both frontend and backend in development
- Express middleware integration for seamless API development
- TypeScript throughout the stack for consistency

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React Router 6, React DOM
- **Build Tools**: Vite, TypeScript compiler
- **Node.js Backend**: Express 5.x

## Authentication Services
- **Google OAuth**: Google OAuth client library and auth verification
- **JWT**: jsonwebtoken for token generation and verification
- **Password Security**: bcryptjs for secure password hashing

## UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: TailwindCSS 3 with PostCSS processing
- **Icons**: Lucide React for consistent iconography
- **Utilities**: class-variance-authority and clsx for conditional styling

## Development and Testing
- **Testing**: Vitest for unit testing
- **Code Quality**: Prettier for code formatting
- **Type Checking**: TypeScript for static type analysis

## Additional Libraries
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: TanStack Query for server state management
- **Environment**: dotenv for environment variable management
- **Toast Notifications**: Sonner for user feedback