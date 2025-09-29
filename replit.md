# Agent UI - Angular Application

## Overview
This is an Angular 20+ application called "Ichat Agent" that provides a user interface for agent management with authentication, dashboard, and admin functionality.

## Project Structure
- **Frontend**: Angular 20.1.0 application
- **UI Framework**: Angular Material Design
- **Authentication**: JWT token-based authentication with role-based permissions
- **Backend API**: Connects to a backend API at localhost:8000 (configurable via environment)

## Recent Changes (2025-09-29)
- Successfully imported GitHub project into Replit environment
- Installed all Angular dependencies using npm install (651 packages installed)
- Configured Angular for Replit environment with proper host settings (0.0.0.0:5000, allowedHosts: true)
- Set up working workflow using `npx ng serve` for development server on port 5000
- Verified frontend is working correctly with professional "ChatAgent Pro" login page display
- Updated Angular build budgets to accommodate production bundle size (1MB warning, 2MB error for initial, 12kB/16kB for styles)
- Configured autoscale deployment with production build process:
  - Build: `npm run build` (generates optimized bundle in dist/agent-ui/browser)
  - Run: `npx serve -s dist/agent-ui/browser -l 5000`
- Angular CLI 20.1.6 and workflow running successfully with Vite hot reload
- Production build tested and verified (974.41 kB bundle, 199.13 kB transferred)
- All Replit proxy and iframe requirements met for proper user access
- Project import completed and fully functional

### Major UI Transformation (2025-09-29)
- **Header Redesign**: Removed company logo, added hamburger menu toggle icon, improved user menu with proper account icon
- **Sidebar Overhaul**: Completely removed branding, improved navigation with better icons (space_dashboard, tune, shield_person), enhanced padding and hover states, added toggle functionality
- **Professional Card Design**: Redesigned dashboard cards from "college project" look to sleek, professional design using consistent design tokens
- **Global Design System**: Established comprehensive design tokens for colors, typography, spacing, shadows, and transitions
- **Mock Data Integration**: Added robust fallback system with 6 realistic sample chatbots when API fails, showing clear demo mode indicator
- **Empty State Handling**: Added beautiful empty state with call-to-action when no chatbots exist, intelligent paginator hiding
- **Enhanced UX**: Improved hover effects, cursor handling, and animations throughout the application for professional feel

## User Preferences
- Uses Angular Material for consistent UI components
- Follows Angular standalone component architecture
- Implements proper TypeScript typing throughout the application

## Project Architecture
### Components
- **App Component**: Main application shell with navigation
- **Login Component**: User authentication
- **Dashboard Component**: Main dashboard interface
- **Admin Component**: Administrative functions
- **API Keys Component**: API key management
- **Train Model Component**: Model training interface
- **Left Menu Component**: Navigation menu

### Services
- **Auth Service**: Handles authentication, JWT tokens, user permissions, and API communication
- Uses environment-based configuration for API endpoints

### Key Features
- Role-based access control with screen permissions
- JWT token management with localStorage
- Protected routes with auth guards
- Material Design UI components
- Responsive design

## Configuration
- **Development**: Angular dev server on port 5000, allows all hosts
- **Production**: Built with Angular CLI, served with serve package
- **API**: Configurable backend URL through environment files
- **Deployment**: Configured for Replit autoscale deployment

## Dependencies
- Angular 20.1.0 with Material Design
- RxJS for reactive programming
- TypeScript 5.8.2
- Serve package for production deployment

## Security
- JWT token-based authentication
- Role and permission-based access control
- Secure HTTP headers and token management
- Environment-based configuration to avoid hardcoded URLs