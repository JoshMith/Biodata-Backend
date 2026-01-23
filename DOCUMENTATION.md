# Christian Biodata Management System (CBMS) - Archdiocese of Nyeri

## 📋 Project Overview

The Christian Biodata Management System (CBMS) is a comprehensive web application designed for the Archdiocese of Nyeri to manage Christian biographical data and sacramental records. The system provides secure user registration, authentication, and role-based access control for managing various sacramental records including Baptism, Eucharist, Confirmation, and Marriage.

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MySQL 2 (hosted on DreamHost)
- **Authentication:** JWT (JSON Web Tokens) with cookie-based sessions
- **Email Service:** Nodemailer
- **File Upload:** Multer

**Key Dependencies:**
- `bcryptjs` - Password hashing
- `jsonwebtoken` - Token generation and verification
- `cookie-parser` - Cookie handling
- `cors` - Cross-origin resource sharing
- `mysql2` - MySQL database driver
- `dotenv` - Environment variable management

## 🗄️ Database Schema

### Users Table
Stores primary user information and authentication data.

```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- first_name, last_name, middle_name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (TEXT)
- role (VARCHAR) - superuser, editor, viewer, member
- phone_number (VARCHAR)
- registration_number (VARCHAR, UNIQUE)
- parish_id (INT, FOREIGN KEY)
- verified (BOOLEAN)
- father, mother (VARCHAR)
- tribe, clan (VARCHAR)
- birth_place, birth_date (VARCHAR/DATE)
- subcounty, residence (VARCHAR)
- created_at (TIMESTAMP)
```

### Parishes Table
Manages parish information across deaneries.

```sql
- parish_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- parish_name (VARCHAR)
- deanery (VARCHAR)
```

### Baptism Table
Records baptism sacrament details.

```sql
- baptism_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY)
- parish (VARCHAR)
- baptism_date (DATE)
- minister (VARCHAR)
- sponsor (VARCHAR)
- baptism_number (VARCHAR, UNIQUE)
```

### Eucharist Table
Tracks First Holy Communion records.

```sql
- eucharist_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY)
- eucharist_place (VARCHAR)
- eucharist_date (DATE)
```

### Confirmation Table
Manages confirmation sacrament records.

```sql
- confirmation_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY)
- confirmation_place (VARCHAR)
- confirmation_date (DATE)
- confirmation_no (VARCHAR)
- minister (VARCHAR)
```

### Marriages Table
Stores marriage ceremony information.

```sql
- marriage_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY)
- certificate_number (VARCHAR, UNIQUE)
- submission_location, submission_sub_county, submission_county (VARCHAR)
- marriage_date (DATE)
- marriage_entry_number, special_license_number (VARCHAR)
- registrar_certification_number (VARCHAR)
- conducted_by (VARCHAR)
- private_parties_count (INT)
- private_parties_names (TEXT)
- created_at, updated_at (TIMESTAMP)
```

### Marriage_Parties Table
Details of bride and groom.

```sql
- party_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- marriage_id (INT, FOREIGN KEY)
- party_type (VARCHAR) - 'bride' or 'groom'
- full_name, age, marital_status (VARCHAR/INT)
- residence_address, residence_county, residence_sub_county (VARCHAR)
- occupation (VARCHAR)
- father_name, father_occupation, father_residence (VARCHAR)
- mother_name, mother_occupation, mother_residence (VARCHAR)
```

### Marriage_Documents Table
Manages uploaded marriage-related documents.

```sql
- document_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- marriage_id (INT, FOREIGN KEY)
- document_type (VARCHAR)
- file_name, file_path (VARCHAR/TEXT)
- file_size (BIGINT)
- uploaded_at (TIMESTAMP)
```

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration:**
   - User submits registration details
   - Password is hashed using bcrypt (salt rounds: 10)
   - Verification email sent with JWT token (1-hour expiration)
   - User stored with `verified: false`

2. **Email Verification:**
   - User clicks verification link with token
   - Token validated and user marked as verified
   - Account fully activated

3. **Login:**
   - Email and password validation
   - Verification status check
   - JWT tokens generated:
     - Access token (24 hours)
     - Refresh token (30 days)
   - Tokens stored in HTTP-only cookies

4. **Password Reset:**
   - Request reset via email
   - Reset token sent (15-minute expiration)
   - Token validation before password update
   - New password hashed and stored

### Role-Based Access Control (RBAC)

**Roles:**
- `superuser` - Full system access
- `editor` - Create, read, update records
- `viewer` - Read-only access
- `member` - Limited access to own records

**Middleware Guards:**
- `protect` - Validates JWT token
- `superuserGuard` - Superuser only
- `editorGuard` - Editor only
- `viewerGuard` - Viewer only
- `memberGuard` - Member only
- `superUserEditorGuard` - Superuser or Editor
- `allViewersGuard` - All roles except member
- `ownUserSuperUserEditorGuard` - User can access own data, or superuser/editor can access all
- `allGuard` - All authenticated users

## 🛣️ API Routes

### Authentication Routes (`/auth`)
```
POST   /register                 - Register new user
POST   /login                    - User login
POST   /logout                   - User logout
GET    /verifyEmail              - Email verification
POST   /request-password-reset   - Request password reset
GET    /verify-reset-token       - Verify reset token
POST   /reset-password           - Reset password
```

### User Routes (`/users`)
```
POST   /                         - Add user (superuser/editor)
GET    /                         - Get all users (all roles)
GET    /count                    - Get user count (all roles)
GET    /name/:name               - Get user by name (all roles)
GET    /:id                      - Get user by ID (all roles)
PUT    /:id                      - Update user (own/superuser/editor)
DELETE /:id                      - Delete user (superuser only)
```

### Parish Routes (`/parish`)
```
POST   /                         - Create parish (superuser)
GET    /                         - Get all parishes
GET    /:id                      - Get parish by ID
GET    /name/:name               - Get parish by name
GET    /deanery/:deanery         - Get parishes by deanery
PUT    /:id                      - Update parish (superuser)
DELETE /:id                      - Delete parish (superuser)
```

### Baptism Routes (`/baptism`)
```
POST   /                         - Create baptism record
GET    /                         - Get all baptism records
GET    /:id                      - Get baptism by ID
GET    /user/:userId             - Get baptism by user ID
PUT    /:id                      - Update baptism record
DELETE /:id                      - Delete baptism record (superuser/editor)
```

### Eucharist Routes (`/eucharist`)
```
POST   /                         - Create eucharist record
GET    /                         - Get all eucharist records
GET    /:id                      - Get eucharist by ID
GET    /user/:userId             - Get eucharist by user ID
PUT    /:id                      - Update eucharist record
DELETE /:id                      - Delete eucharist record (superuser/editor)
```

### Confirmation Routes (`/confirmation`)
```
POST   /                         - Create confirmation record
GET    /                         - Get all confirmation records
GET    /:id                      - Get confirmation by ID
GET    /user/:userId             - Get confirmation by user ID
PUT    /:id                      - Update confirmation record
DELETE /:id                      - Delete confirmation record (superuser/editor)
```

### Marriage Routes (`/marriages`)
```
POST   /                         - Create marriage record
GET    /                         - Get all marriages
GET    /user/:user_id/full       - Get full marriage with parties & documents
GET    /:id                      - Get marriage by ID
PUT    /:id                      - Update marriage
DELETE /:id                      - Delete marriage (superuser/editor)
```

### Marriage Parties Routes (`/marriage-parties`)
```
POST   /                         - Create marriage party
GET    /                         - Get all marriage parties
GET    /:id                      - Get marriage party by ID
PUT    /:id                      - Update marriage party
DELETE /:id                      - Delete marriage party (superuser/editor)
```

### Marriage Documents Routes (`/marriage-documents`)
```
POST   /                         - Upload document (with file)
GET    /                         - Get all documents
GET    /:id                      - Get document by ID
GET    /list/:marriageId         - Get documents for marriage
GET    /download/:filename       - Download document
PUT    /:id                      - Update document metadata
DELETE /:id                      - Delete document (superuser/editor)
```

## 📁 Project Structure

```
christiandata/
├── src/
│   ├── config/
│   │   └── db.config.ts              # MySQL database configuration
│   ├── controllers/
│   │   ├── authController.ts         # Authentication logic
│   │   ├── usersController.ts        # User management
│   │   ├── parishController.ts       # Parish management
│   │   ├── baptismController.ts      # Baptism records
│   │   ├── eucharistController.ts    # Eucharist records
│   │   ├── confirmController.ts      # Confirmation records
│   │   ├── marriageController.ts     # Marriage records
│   │   ├── marriagePartiesController.ts
│   │   └── marriageDocumentController.ts
│   ├── middlewares/
│   │   ├── asyncHandler.ts           # Async error wrapper
│   │   ├── errorMiddlewares.ts       # Error handling
│   │   └── auth/
│   │       ├── protect.ts            # JWT authentication
│   │       └── roleMiddleWare.ts     # RBAC guards
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── usersRoutes.ts
│   │   ├── parishRoutes.ts
│   │   ├── baptismRoutes.ts
│   │   ├── eucharistRoutes.ts
│   │   ├── confirmRoutes.ts
│   │   ├── marriageRoutes.ts
│   │   ├── marriagePartiesRoutes.ts
│   │   └── marriageDocumentRoutes.ts
│   ├── utils/
│   │   ├── helpers/
│   │   │   ├── generateToken.ts      # JWT token generation
│   │   │   └── sendMail.ts           # Email functionality
│   │   └── types/
│   │       └── userTypes.ts          # TypeScript interfaces
│   └── server.ts                     # Application entry point
├── uploads/
│   └── marriage_documents/           # Uploaded files storage
├── .env                              # Environment variables
├── .gitignore
├── database.sql                      # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=production

# Database (DreamHost MySQL)
DB_HOST=db.cbms.adnyeri.org
DB_PORT=3306
DB_USER=cdbms_user
DB_PASSWORD=your_password
DB_NAME=christian_bio_data

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret_key

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# Frontend URL
FRONTEND_URL=https://cbms.adnyeri.org
```

### CORS Configuration

```typescript
const allowedOrigins = ['https://cbms.adnyeri.org', 'http://localhost:4200'];

app.use(cors({
    origin: true,
    methods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie']
}));
```

### Cookie Settings

```typescript
{
    httpOnly: true,
    secure: true,              // HTTPS only
    sameSite: "none",          // Cross-domain
    path: "/",
    domain: ".cbms.adnyeri.org",
    maxAge: 24 * 60 * 60 * 1000  // 24 hours for access token
}
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- pnpm or npm
- MySQL database
- Git

### Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/christiandata.git
cd christiandata
```

2. **Install dependencies:**
```bash
pnpm install
# or
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Setup database:**
```bash
# Import the schema
mysql -u username -p christiandb < database.sql
```

5. **Run the application:**

**Development mode:**
```bash
pnpm dev
# or
npm run dev
```

**Production mode:**
```bash
pnpm build
pnpm start
# or
npm run build
npm start
```

The server will start on `http://localhost:3000` (or configured PORT).

## 📧 Email Templates

### Verification Email
- **Subject:** Welcome to CBMS Archdiocese of Nyeri - Email Verification
- **Expiration:** 1 hour
- **Content:** Branded HTML template with verification link

### Password Reset Email
- **Subject:** Password Reset Request - CBMS Archdiocese of Nyeri
- **Expiration:** 15 minutes
- **Content:** Branded HTML template with reset link

## 📤 File Upload System

### Marriage Documents
- **Storage:** Local filesystem (`uploads/marriage_documents/`)
- **Naming:** Timestamp prefix + original filename
- **Access:** Protected route with authentication
- **Download:** Direct file streaming with proper headers

### Supported File Types
- PDF documents
- Images (JPG, JPEG, PNG)
- Microsoft Word documents (DOC, DOCX)

## 🛡️ Security Features

1. **Password Security:**
   - Bcrypt hashing with salt rounds (10)
   - Never stored in plain text

2. **JWT Security:**
   - HTTP-only cookies
   - Secure flag for HTTPS
   - SameSite protection
   - Token expiration

3. **Database Security:**
   - SSL connection to database
   - Parameterized queries (SQL injection prevention)
   - Foreign key constraints
   - Unique constraints on sensitive fields

4. **File Upload Security:**
   - Path traversal prevention
   - File size limits
   - Type validation
   - Authenticated access only

5. **CORS Protection:**
   - Whitelisted origins
   - Credential support
   - Proper headers configuration

## 🗺️ Deaneries & Parishes

The system includes 52 parishes across 7 deaneries:

- **Nyeri Municipality Deanery** (7 parishes)
- **Mukurwe-ini Deanery** (4 parishes)
- **Othaya Deanery** (7 parishes)
- **Nanyuki Deanery** (5 parishes)
- **Narumoru Deanery** (5 parishes)
- **Karatina Deanery** (8 parishes)
- **Tetu Deanery** (8 parishes)
- **Gatarakwa Deanery** (8 parishes)

## 🔄 Data Flow Examples

### User Registration Flow
```
1. Frontend → POST /auth/register
2. Validate input & check existing email
3. Hash password with bcrypt
4. Insert user (verified: false)
5. Generate verification token (JWT, 1h expiry)
6. Send verification email
7. Generate session tokens
8. Set HTTP-only cookies
9. Return user data
```

### Sacrament Record Creation
```
1. Frontend → POST /baptism (protected route)
2. Auth middleware validates JWT
3. Role guard checks permissions
4. Validate user_id exists
5. Check for duplicate records
6. Insert baptism record
7. Return success response
```

### Marriage Record with Documents
```
1. Create marriage record → POST /marriages
2. Create bride party → POST /marriage-parties
3. Create groom party → POST /marriage-parties
4. Upload documents → POST /marriage-documents (with file)
5. Retrieve full record → GET /marriages/user/:user_id/full
   - Returns marriage + parties + documents in single response
```

## 🧪 Testing Considerations

Currently, no automated tests are configured. For testing:

1. **Manual API Testing:**
   - Use Postman or Insomnia
   - Test all CRUD operations
   - Verify authentication flows
   - Check role-based access

2. **Database Testing:**
   - Verify foreign key constraints
   - Test unique constraints
   - Validate cascade deletes

3. **File Upload Testing:**
   - Test various file types
   - Verify file size limits
   - Test download functionality

## 📊 Performance Considerations

1. **Database Connection Pooling:**
   - MySQL2 connection pool configured
   - Automatic connection management
   - Timeout settings for reliability

2. **Async Error Handling:**
   - Custom asyncHandler wrapper
   - Prevents server crashes
   - Proper error propagation

3. **File Serving:**
   - Static file middleware for downloads
   - Proper content-type headers
   - Stream-based file transfer

## 🔍 Monitoring & Logging

### Console Logging
- Database connection status
- Authentication events
- Email sending status
- Server startup information
- Error logging

### Production Monitoring
- Server time logging (EAT timezone)
- Version tracking
- Environment tracking

## 🚧 Known Limitations

1. No automated testing suite
2. File uploads limited to local filesystem
3. No database migration system
4. Manual schema updates required
5. Limited error recovery mechanisms

## 🔮 Future Enhancements

1. **Testing:**
   - Unit tests (Jest)
   - Integration tests
   - API endpoint tests

2. **Features:**
   - Bulk import/export
   - Advanced search & filtering
   - Report generation
   - Audit logging
   - Two-factor authentication

3. **Infrastructure:**
   - Cloud file storage (S3, Cloudinary)
   - Database migration tool (Knex, Sequelize)
   - Redis caching
   - Load balancing

4. **Documentation:**
   - API documentation (Swagger)
   - Developer guides
   - User manuals

## 👥 User Roles & Permissions Matrix

| Action | Superuser | Editor | Viewer | Member |
|--------|-----------|--------|--------|--------|
| View all records | ✅ | ✅ | ✅ | ❌ |
| View own records | ✅ | ✅ | ✅ | ✅ |
| Create records | ✅ | ✅ | ❌ | Own only |
| Update records | ✅ | ✅ | ❌ | Own only |
| Delete records | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ |
| Manage parishes | ✅ | ❌ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ | ❌ |

## 📝 License

This project is proprietary software developed for the Archdiocese of Nyeri.

## 👨‍💻 Development Team

**Developed by:** Megalio Software Developers

**Contact:** For contributions or issues, please contact the development team or submit a pull request on GitHub.

---

**Version:** 1.0.12  
**Last Updated:** January 2026  
**Server:** https://cbms.adnyeri.org/api/