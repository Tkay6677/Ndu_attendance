# NDU QR Code Attendance System

## Project Overview
The NDU QR Code Attendance System is a modern web application designed for Niger Delta University to streamline the attendance tracking process. The system uses QR code technology to enable quick and efficient attendance marking while preventing proxy attendance through secure authentication and real-time validation.

## Key Features
- **QR Code-Based Attendance**: Dynamic QR codes for each session with built-in expiration
- **Role-Based Access**: Separate interfaces for lecturers and students
- **Real-time Attendance Tracking**: Instant attendance recording and validation
- **Mobile-First Design**: Responsive interface that works seamlessly on all devices
- **Export Functionality**: CSV export for attendance records
- **Secure Authentication**: Email and password-based authentication with role management

## Technology Stack
### Frontend
- **Next.js 13+ (App Router)**: React framework for web application
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **html5-qrcode**: QR code scanning functionality
- **date-fns**: Date manipulation and formatting
- **Lucide Icons**: Modern icon set

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database for data storage
- **NextAuth.js**: Authentication system
- **JWT**: For secure QR code generation and validation
- **bcryptjs**: Password hashing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **npm**: Package management

## Architecture
The application follows a modern client-server architecture with Next.js handling both frontend and backend responsibilities. It uses the App Router pattern for routing and server components for improved performance.

### Key Architectural Components
1. **Authentication Layer**: Managed by NextAuth.js
2. **API Layer**: RESTful endpoints using Next.js API routes
3. **Database Layer**: MongoDB collections for users, sessions, and attendance
4. **Frontend Layer**: React components with TypeScript
5. **QR Code System**: JWT-based secure QR code generation and validation