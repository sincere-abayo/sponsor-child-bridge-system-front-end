# Sponsor-Child Bridge System

A full-stack web application that connects sponsors with children in need, providing a platform for sponsorship management, communication, and progress tracking.

## Project Structure

This project consists of two main components:
- **Frontend**: React + Vite application (`sponsor-child-bridge-system-front-end/`)
- **Backend**: Node.js + Express + MySQL application (`sponsor-child-bridge-system-back-end/`)

## Prerequisites

Before installing the project, make sure you have the following installed on your system:

### Required Software

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **MySQL** (version 8.0 or higher)
   - **Linux**: Install via package manager (e.g., `sudo apt install mysql-server` on Ubuntu)
   - **Windows**: Download MySQL Installer from https://dev.mysql.com/downloads/installer/

3. **Git** (for cloning the repository)
   - **Linux**: Install via package manager (e.g., `sudo apt install git` on Ubuntu)
   - **Windows**: Download from https://git-scm.com/download/win

## Installation Instructions

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd betty
```

### Step 2: Database Setup

1. **Start MySQL service:**
   - **Linux**: `sudo systemctl start mysql`
   - **Windows**: Start MySQL service from Services or MySQL Workbench

2. **Create the database:**
   ```sql
   mysql -u root -p
   CREATE DATABASE sponsor_child_bridge;
   CREATE DATABASE sponsor_child_bridge_test;
   ```

3. **Update database configuration:**
   - Edit `sponsor-child-bridge-system-back-end/config/config.json`
   - Update the `username`, `password`, and `host` fields according to your MySQL setup

### Step 3: Backend Installation

```bash
cd sponsor-child-bridge-system-back-end
npm install
```

### Step 4: Frontend Installation

```bash
cd ../sponsor-child-bridge-system-front-end
npm install
```

## Running the Application

### Option 1: Run Both Services Separately

#### Start the Backend Server

**Linux:**
```bash
cd sponsor-child-bridge-system-back-end
npm run dev
# or for production
npm start
```

**Windows:**
```cmd
cd sponsor-child-bridge-system-back-end
npm run dev
# or for production
npm start
```

The backend server will start on `http://localhost:5000`

#### Start the Frontend Development Server

**Linux:**
```bash
cd sponsor-child-bridge-system-front-end
npm run dev
```

**Windows:**
```cmd
cd sponsor-child-bridge-system-front-end
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Option 2: Run Both Services Simultaneously

**Linux:**
```bash
# Terminal 1 - Backend
cd sponsor-child-bridge-system-back-end && npm run dev

# Terminal 2 - Frontend (in a new terminal)
cd sponsor-child-bridge-system-front-end && npm run dev
```

**Windows:**
```cmd
# Command Prompt 1 - Backend
cd sponsor-child-bridge-system-back-end && npm run dev

# Command Prompt 2 - Frontend (in a new command prompt)
cd sponsor-child-bridge-system-front-end && npm run dev
```

## Available Scripts

### Backend Scripts
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (auto-restart on changes)

### Frontend Scripts
- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality

## Environment Configuration

### Backend Configuration
The backend uses `config/config.json` for database configuration. Make sure to update the following fields:
- `username`: Your MySQL username
- `password`: Your MySQL password
- `host`: Your MySQL host (usually `127.0.0.1` for local development)
- `database`: Database name (`sponsor_child_bridge`)

### Frontend Configuration
The frontend automatically connects to the backend API at `http://localhost:5000`. If you need to change this, update the API base URL in `services/api.js`.

## Default Admin Credentials

The system comes with pre-configured sample users including an admin account:

### Admin Account
- **Email**: `admin@gmail.com`
- **Password**: `adminpass`
- **Role**: Admin

### Sample Test Accounts
- **Sponsor Account**:
  - Email: `sponsor1@gmail.com`
  - Password: `password123`
  
- **Sponsee Account**:
  - Email: `sponsee1@gmail.com`
  - Password: `password123`

### Setting Up Sample Data
To create these sample users, run the sample data script:

```bash
cd sponsor-child-bridge-system-back-end
node sample-data.js
```

**Note**: Make sure your database is set up and running before executing the sample data script.

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Backend (port 5000): Change the port in `server.js`
   - Frontend (port 5173): Vite will automatically use the next available port

2. **Database connection errors:**
   - Verify MySQL is running
   - Check database credentials in `config/config.json`
   - Ensure the database exists

3. **Permission errors (Linux):**
   - Use `sudo` for system-wide installations
   - Check file permissions in the project directory

4. **Node modules issues:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

### Getting Help

If you encounter issues:
1. Check that all prerequisites are installed correctly
2. Verify database connection
3. Check console logs for error messages
4. Ensure all dependencies are installed

## Production Deployment

For production deployment:

1. **Backend:**
   ```bash
   cd sponsor-child-bridge-system-back-end
   npm install --production
   npm start
   ```

2. **Frontend:**
   ```bash
   cd sponsor-child-bridge-system-front-end
   npm run build
   # Serve the dist/ folder with a web server like nginx or Apache
   ```

## Technology Stack

- **Frontend**: React 19, Vite, Material-UI, Redux Toolkit, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js, Sequelize ORM, MySQL, JWT Authentication
- **Database**: MySQL 8.0+

## License

This project is licensed under the ISC License.