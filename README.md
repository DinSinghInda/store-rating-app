# Store Rating System

## Overview
A comprehensive full-stack web application designed for managing and analyzing store ratings. The system implements a role-based access control with three distinct user types: System Administrator, Store Owner, and Normal User. Built with modern web technologies, the application provides a robust platform for businesses to gather and analyze customer feedback.

## System Architecture

### Backend Infrastructure
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT-based token system
- **Validation**: Express Validator for request validation
- **Security**: Bcrypt for password hashing

### Frontend Technology Stack
- **Framework**: React.js with functional components
- **UI Components**: Material-UI
- **Form Management**: Formik with Yup validation
- **State Management**: React Context API
- **HTTP Client**: Axios for API integration

## Core Functionalities

### System Administrator Capabilities
- User Management
  - Create and manage user accounts
  - Assign and modify user roles
  - Monitor user activities
- Store Management
  - Register new stores
  - Assign stores to owners
  - View comprehensive store statistics
- System Overview
  - Access detailed analytics dashboard
  - Monitor system-wide metrics
  - Generate performance reports

### Store Owner Features
- Dashboard Access
  - Real-time rating statistics
  - Customer feedback monitoring
  - Performance metrics visualization
- Rating Management
  - View detailed rating submissions
  - Track rating trends
  - Access customer information

### Normal User Features
- Store Interaction
  - Browse store listings
  - Submit store ratings
  - Modify existing ratings
- Account Management
  - Profile customization
  - Password management
  - Rating history access

## Data Validation Parameters

### User Data
- Name: 20-60 characters
- Address: Maximum 400 characters
- Email: Standard email format validation
- Password Requirements:
  - Length: 8-16 characters
  - Minimum one uppercase letter
  - Minimum one special character

### Store Data
- Store Name: Maximum 100 characters
- Email: Valid email format
- Address: Maximum 400 characters

## Implementation Guide

### Prerequisites
- Node.js (v14.0.0 or higher)
- PostgreSQL (v12.0 or higher)
- NPM or Yarn package manager

### Backend Configuration
1. Navigate to server directory:
```bash
cd server
npm install
```

2. Configure environment variables:
```
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=store_rating_db
JWT_SECRET=your_secure_jwt_secret
```

3. Initialize database:
```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

### Frontend Configuration
1. Navigate to client directory:
```bash
cd client
npm install
```

2. Set environment variables:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Application Deployment

### Development Environment
1. Start backend server:
```bash
cd server
npm run dev
```

2. Launch frontend application:
```bash
cd client
npm start
```

Access the application at: http://localhost:3000

## API Documentation

### Authentication Endpoints
- POST /api/auth/signup - User registration
- POST /api/auth/login - User authentication
- PUT /api/auth/update-password - Password modification

### User Management Endpoints
- GET /api/users - Retrieve user list (Admin access)
- POST /api/users - Create user (Admin access)
- GET /api/users/stats - Retrieve statistics (Admin access)

### Store Management Endpoints
- GET /api/stores - Retrieve store list
- POST /api/stores - Create store (Admin access)
- GET /api/stores/:id/ratings - Retrieve store ratings (Owner access)

### Rating Management Endpoints
- POST /api/ratings - Create rating
- PUT /api/ratings/:storeId - Update rating

## Development Guidelines

### Contributing Process
1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Submit pull request
5. Await code review

### Code Standards
- Follow ESLint configuration
- Maintain consistent code formatting
- Include appropriate documentation
- Write unit tests for new features

## Support and Documentation
For additional support or inquiries, please refer to the issue tracker or contact the system administrators.

## License
<<<<<<< HEAD
This project is licensed under the MIT License. See LICENSE file for details. 
=======
This project is licensed under the MIT License. See LICENSE file for details.
>>>>>>> 4f8be30c75869ece24dd0c8cbc1bfa41df2b7821
