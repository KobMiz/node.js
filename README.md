# Node.js API Project

## **Introduction**

This project is a robust Node.js API designed for managing users, business cards, and support tickets. It features secure authentication, role-based access control, and a comprehensive API documentation with Swagger. The project is built with scalability and maintainability in mind, leveraging MongoDB as the database solution.

The full source code is available on [GitHub](https://github.com/KobMiz/node.js).

---

## **Key Features**

- **User Management**:
  - User registration, login, and profile management.
  - Role-based permissions for Admin, Business, and Regular users.
  - Account lockout after three failed login attempts.
- **Business Cards Management**:
  - CRUD operations for managing business cards.
  - Like/Unlike functionality for registered users.
  - Access control for Admins and Business users.
- **Support Tickets**:
  - Create, update, and manage support tickets.
  - Status updates with Admin/Owner-specific permissions.
- **Authentication and Security**:
  - Secure JWT-based authentication.
  - Encrypted passwords using BcryptJS.
- **Logging and Monitoring**:
  - Detailed logging with Morgan.
  - CORS support for secure cross-origin requests.
- **Comprehensive Documentation**:
  - API routes documented with Swagger.
- **Seed Data**:
  - Predefined users (Admin, Business, Regular) and business cards for easy testing.

---

## **System Requirements**

- Node.js >= 16.x
- MongoDB (local or Atlas)
- npm >= 8.x

---

## **Installation and Setup**

### Clone the Repository:

```bash
git clone https://github.com/KobMiz/node.js.git
cd node.js
```

### Install Dependencies:

```bash
npm install
```

### Set Up Environment Variables:

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

Alternatively, you can refer to the `.env.example` file included in the repository for guidance.

### Load Initial Data:

To load predefined users and cards, run:

```bash
npm run seed
```

### Start the Server:

#### Development:

```bash
npm run dev
```

#### Production:

```bash
npm start
```

---

## **API Documentation**

The API is documented using Swagger. To view the documentation:

1. Start the server.
2. Navigate to `http://localhost:5000/api-docs` in your browser.

### Example Routes:

- **User Routes:**
  - `POST /users/register` - Register a new user.
  - `POST /users/login` - User login.
  - `GET /users` - Get all users (Admin only).
  - `PATCH /users/:id` - Update user details.
  - `DELETE /users/:id` - Delete a user (Admin only).
- **Business Cards Routes:**
  - `POST /cards` - Create a new card (Business only).
  - `GET /cards` - Retrieve all cards.
  - `PATCH /cards/:id/like` - Toggle like on a card.
  - `PUT /cards/:id` - Update card details.
  - `DELETE /cards/:id` - Delete a card (Admin only).
- **Tickets Routes:**
  - `POST /tickets` - Create a new support ticket.
  - `PATCH /tickets/:id/status` - Update ticket status.

#### Sample API Request and Response:

```json
POST /users/login
Headers:
{
  "Content-Type": "application/json"
}
Body:
{
  "email": "user@example.com",
  "password": "123456"
}
Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

## **Project Structure**

```
nodejs-api-project/
├── routes/
│   ├── userRoutes.js
│   ├── cardRoutes.js
│   ├── ticketRoutes.js
├── models/
├── middlewares/
├── validators/
├── config/
├── initialData.js
├── swaggerConfig.js
├── .env.example
├── index.js
├── .env.example
└── package.json
```

---

## **Dependencies**

- **Core:** Express, Mongoose, Dotenv.
- **Authentication:** BcryptJS, JSON Web Token.
- **Validation:** Joi.
- **Utilities:** Morgan, CORS.

---

## **Deployment**

1. Ensure environment variables are configured for production.
2. Deploy to platforms like Heroku, AWS, or Vercel.
3. Verify MongoDB Atlas connection for production.

---

## **Project Status**

The project is complete and ready for deployment. Future improvements may include additional features and performance optimizations.

---

## **Credits**

Project developed as part of a Node.js learning initiative.  
For the full source code, visit the [GitHub repository](https://github.com/KobMiz/node.js).

---

## **Support**

For issues or questions, please create an issue on the [GitHub repository](https://github.com/KobMiz/node.js/issues).

---

## **Future Improvements**

- Add automated testing with tools like Jest.
- Implement rate-limiting to enhance API security.
- Optimize database queries for better performance.
