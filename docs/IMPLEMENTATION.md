# Implementation Details

## Project Structure
```
app/
├── api/                    # API routes
│   ├── attendance/         # Attendance endpoints
│   ├── auth/              # Authentication endpoints
│   └── sessions/          # Session management endpoints
├── auth/                  # Auth-related pages
├── dashboard/             # Dashboard pages
└── layout.tsx            # Root layout

components/
├── auth/                  # Authentication components
├── dashboard/            # Dashboard-specific components
└── ui/                   # Reusable UI components

lib/
├── auth.ts               # Authentication configuration
├── mongodb.ts            # Database connection
└── utils/               # Utility functions
```

## Key Components

### Authentication System
The authentication system is built using NextAuth.js with a custom credentials provider. It supports:
- Email/password authentication
- Role-based access control (Student/Lecturer)
- Secure session management
- Protected API routes
- Custom user profiles

```typescript
// auth.ts configuration
export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Add custom claims to JWT
    },
    session: async ({ session, token }) => {
      // Enhance session with user data
    }
  }
};
```

### QR Code System
The QR code system uses JWT for secure token generation and validation:

1. **Generation**:
   - Session details encoded in JWT
   - Limited validity period
   - Includes session ID and timestamp

2. **Validation**:
   - Token signature verification
   - Session status verification
   - Time window validation
   - Duplicate attendance prevention

```typescript
// QR Code Generation
const token = jwt.sign(
  { 
    sessionId,
    timestamp: Date.now() 
  },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);
```

### Session Management
Sessions are managed through a combination of MongoDB documents and real-time status tracking:

- Active/Inactive state
- Duration-based validity
- Real-time attendance tracking
- Attendance export functionality

## API Endpoints

### Authentication
- `POST /api/auth/register`: User registration
- `POST /api/auth/[...nextauth]`: Authentication endpoints

### Sessions
- `GET /api/sessions`: List sessions
- `POST /api/sessions`: Create session
- `PATCH /api/sessions/:id`: Update session status
- `GET /api/sessions/:id`: Get session details

### Attendance
- `POST /api/attendance`: Mark attendance
- `GET /api/attendance`: Get attendance records
- `GET /api/attendance/:sessionId`: Get session attendance

## Security Measures

1. **Authentication**
   - Password hashing with bcrypt
   - JWT-based session management
   - Role-based access control

2. **QR Codes**
   - Signed JWT tokens
   - Time-based expiration
   - Single-use validation

3. **API Security**
   - Input validation
   - Session verification
   - Rate limiting
   - CORS protection

4. **Data Protection**
   - Secure password storage
   - Data validation
   - Error handling
   - Audit logging

## Mobile Responsiveness
The application is built with a mobile-first approach:

1. **Responsive Design**
   - Fluid layouts
   - Flexible grids
   - Responsive images
   - Touch-friendly interfaces

2. **Mobile Features**
   - Camera access for QR scanning
   - Touch-optimized buttons
   - Readable typography
   - Optimized loading states

3. **Performance**
   - Optimized bundle size
   - Lazy loading
   - Image optimization
   - Efficient rendering