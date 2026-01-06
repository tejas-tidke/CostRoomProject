# Production Deployment Guide for CostRoom

This document outlines the steps to deploy the CostRoom application with a proper production server architecture using NGINX as a reverse proxy.

## Architecture Overview

- **Frontend**: React/Vite application (served as static files by NGINX)
- **Backend**: Spring Boot application (running on private port 8081)
- **Web Server**: NGINX (serving frontend and proxying API requests)
- **Access**: Via server IP or domain (not localhost)

## Prerequisites

- NGINX installed on the production server
- Node.js and npm for building the frontend
- Java 17+ for running the backend
- Server with IP address 192.168.1.115 (or update configurations accordingly)

## Deployment Steps

### 1. Build the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd free-react-tailwind-admin-dashboard-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the production bundle:
   ```bash
   npm run build
   ```

4. The build output will be in the `dist/` directory.

### 2. Deploy Frontend to NGINX

1. Copy the contents of the `dist/` directory to NGINX's web root:
   ```bash
   sudo cp -r dist/* /var/www/costroom/dist/
   ```

2. Create the directory if it doesn't exist:
   ```bash
   sudo mkdir -p /var/www/costroom/dist
   ```

### 3. Configure NGINX

1. Copy the NGINX configuration to the NGINX sites-available directory:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/costroom
   ```

2. Create a symbolic link to sites-enabled:
   ```bash
   sudo ln -s /etc/nginx/sites-available/costroom /etc/nginx/sites-enabled/
   ```

3. Test the NGINX configuration:
   ```bash
   sudo nginx -t
   ```

4. If the test passes, reload NGINX:
   ```bash
   sudo systemctl reload nginx
   ```

### 4. Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd productdevelopment
   ```

2. Start the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Or build and run the JAR:
   ```bash
   ./mvnw clean package
   java -jar target/productdevelopment-*.jar
   ```

The backend will start on port 8081 and listen on all interfaces (0.0.0.0).

### 5. Verify the Setup

1. Access the application via your server IP:
   ```
   http://192.168.1.115
   ```

2. API requests will be automatically proxied to the backend at:
   ```
   http://192.168.1.115/api/*
   ```

## Configuration Details

### Frontend Changes
- All API calls now use relative paths (e.g., `/api/users` instead of `http://localhost:8080/api/users`)
- The application is configured to work behind a reverse proxy
- Environment variables no longer contain hardcoded localhost URLs

### Backend Changes
- Application now runs on port 8081 (private port)
- Server configured to listen on all interfaces (`server.address=0.0.0.0`)
- CORS configuration updated to allow production domain
- API endpoints properly prefixed with `/api/**`

### NGINX Configuration
- Serves static files from `/var/www/costroom/dist`
- Proxies `/api/*` requests to `http://127.0.0.1:8081`
- Handles SPA routing with `try_files $uri $uri/ /index.html`
- Includes proper headers for security and caching

## Troubleshooting

### Common Issues

1. **CORS Errors**: Verify that the `app.frontend.url` in `application.properties` matches your server domain/IP.

2. **API Calls Not Working**: Check that NGINX is properly proxying `/api/*` requests to the backend.

3. **Static Files Not Loading**: Ensure the frontend build is properly copied to the NGINX web root.

4. **Backend Not Accessible**: Verify that the backend is running on port 8081 and listening on 0.0.0.0.

### Useful Commands

- Check NGINX status: `sudo systemctl status nginx`
- Restart NGINX: `sudo systemctl restart nginx`
- Check NGINX error logs: `sudo tail -f /var/log/nginx/error.log`
- Check backend logs: Look at the console output from the Spring Boot application

## Security Considerations

- Ensure firewall rules allow traffic on port 80 (and 443 if using HTTPS)
- Update the NGINX configuration to use HTTPS in production
- Secure the backend server so it's only accessible from the same machine (localhost)
- Regularly update dependencies for both frontend and backend

## Scaling Considerations

- For high-traffic applications, consider using a process manager for the backend (like systemd)
- Implement load balancing if needed
- Set up proper logging and monitoring
- Consider using a CDN for static assets