# Christian Biodata Management System

This project is a Node.js + Express + PostgreSQL application for managing Christian biodata records such as registration, authentication, and sacrament records (Baptism, Eucharist, Confirmation, Marriage, etc.).

## 📌 Features
- User registration, login, and authentication (JWT-based).
- Role-based access control (Superuser, Editor, Viewer, Member).
- CRUD operations for Christian biodata.
- Upload and manage sacrament records.
- Email notifications (via Nodemailer).
- File uploads (via Multer).
- PostgreSQL database integration.

---

## ⚙️ Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) or npm
- [PostgreSQL](https://www.postgresql.org/) (running locally or on a server)
- [Git](https://git-scm.com/) (optional, for cloning)

---

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JoshMith/Biodata-Backend.git
   cd Biodata-Backend
````

2. **Install dependencies**
   Using pnpm:

   ```bash
   pnpm install
   ```

   Or using npm:

   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the project root with the following keys:
# Example:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://username:password@localhost:5432/christiandb
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   ```

4. **Setup the database**
   Run migrations or create tables manually depending on your schema:

   ```bash
   psql -U localhost -d christian_bio_data -f database.sql
   ```

   *(If you are using Sequelize/Prisma/Knex, replace with the appropriate migration command.)*

---

## 🖥️ Running the Application

* **Start in development mode (with hot reload)**

  ```bash
  npm run start:dev
  ```
* **Start in production mode**

  ```bash
  npm run start
  ```

The API will be available at:

```
http://localhost:3000
```

---

## 🧪 Testing

Currently, no test suite is configured. Placeholder script:

```bash
npm test
```

---

## 📂 Project Structure

```
christiandata/
├── src/
│   ├── server.ts        # Entry point
│   ├── routes/          # Express routes
│   ├── controllers/     # Business logic
│   ├── models/          # Database models
│   ├── middleware/      # Authentication & authorization
│   └── utils/           # Helper functions
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔒 Security Notes

* Use strong JWT secret keys.
* Enforce HTTPS in production.
* Configure PostgreSQL with a strong password and limited user privileges.
* Regularly update dependencies.

---

## 📌 Scripts

* `npm run start` → Runs the server with Node.
* `npm run dev` → Runs the server with Nodemon + TypeScript (recommended during development).
* `npm test` → Runs test suite (to be implemented).

---

## 👨‍💻 Author

Developed by Megalio Software Developers.
For contributions, please fork the repo and submit a pull request.