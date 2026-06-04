# DriveEase

DriveEase is a full-stack vehicle rental management system for handling providers, contracts, vehicles, customers, drivers, bookings, service logs, user administration, payment completion, and printable receipts.

The project is split into:

- `driveease-backend` - Spring Boot REST API with JWT security, MySQL persistence, JPA entities, validation, and Cloudinary upload support.
- `frontend` - React + Vite single-page application with protected routes, admin/manager workflows, booking creation, bulk completion, and receipt printing.

## Features

- JWT login with role-based route protection.
- Seeded admin account for first login.
- Admin-only internal user registration.
- Provider, contract, customer, driver, vehicle, and service log management.
- Vehicle image and contract document upload through Cloudinary.
- Vehicle availability search by pickup date, rental days, number of vehicles, and vehicle type.
- Booking creation with selected vehicles, optional drivers, start mileage, rental days, and booking status.
- Fixed driver fee support: `LKR 2,500` per day per selected driver.
- Booking completion with end mileage entry.
- Extra mileage calculation per vehicle using `allowedMileagePerDay` and `extraMileageRate`.
- Bulk booking completion for combined payment workflows.
- Detailed printable payment receipts.
- Sortable Booking List table.
- Centralized CORS configuration in backend security config.

## Tech Stack

### Backend

- Java 21
- Spring Boot 4.0.6
- Spring Web MVC
- Spring Security
- Spring Data JPA
- MySQL
- Lombok
- Jakarta Validation
- JJWT
- Cloudinary Java SDK
- Maven Wrapper

### Frontend

- React 19
- Vite 8
- React Router
- Axios
- ESLint
- CSS modules via global app stylesheet

## Project Structure

```text
DriveEase/
├── driveease-backend/
│   ├── src/main/java/com/driveease/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── enums/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   ├── src/main/resources/application.properties
│   └── pom.xml
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   ├── src/routes/
│   ├── src/services/
│   ├── src/styles/
│   └── package.json
├── schema.sql
├── DriveEase.postman_collection.json
└── README.md
```

## Prerequisites

- Java 21
- Node.js and npm
- MySQL running locally
- Maven is optional because the backend includes `mvnw` / `mvnw.cmd`
- Cloudinary account if upload features are used outside the existing local config

## Local Setup

### 1. Clone and enter the project

```powershell
cd C:\Users\lakit\Desktop\CMG\DriveEase
```

### 2. Configure MySQL

Create or allow the app to create the database:

```sql
CREATE DATABASE IF NOT EXISTS driveease_db;
```

Backend database configuration lives in:

```text
driveease-backend/src/main/resources/application.properties
```

Current local defaults:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/driveease_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
server.port=8080
app.cors.allowed-origins=http://localhost:5173
```

For a real deployment, move database passwords, JWT secrets, and Cloudinary credentials into environment-specific configuration rather than committing secrets.

### 3. Run the backend

From the backend folder:

```powershell
cd driveease-backend
.\mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

API base path:

```text
http://localhost:8080/api
```

### 4. Run the frontend

From the frontend folder:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The frontend API client is configured in:

```text
frontend/src/services/api.js
```

Current API base URL:

```js
http://localhost:8080/api
```

## Default Admin Login

On backend startup, `DataSeeder` creates or repairs the default admin account:

```text
Email: admin@driveease.com
Password: admin123
Role: ADMIN
```

Use this account to log in and create additional internal users from the User Registration screen.

## Useful Commands

### Backend

Compile without tests:

```powershell
cd driveease-backend
.\mvnw.cmd -q -DskipTests compile
```

Run tests:

```powershell
cd driveease-backend
.\mvnw.cmd test
```

Run the API:

```powershell
cd driveease-backend
.\mvnw.cmd spring-boot:run
```

### Frontend

Install dependencies:

```powershell
cd frontend
npm install
```

Run dev server:

```powershell
cd frontend
npm run dev
```

Build:

```powershell
cd frontend
npm run build
```

Lint:

```powershell
cd frontend
npm run lint
```

Preview production build:

```powershell
cd frontend
npm run preview
```

## Core Workflows

### Authentication

1. User logs in through `/api/auth/login`.
2. Backend returns a JWT and user role data.
3. Frontend stores the authenticated user in `localStorage`.
4. `frontend/src/services/api.js` attaches the bearer token to API requests.
5. Spring Security validates JWTs for protected backend endpoints.

### User Administration

Admin users can:

- View current internal users.
- Register new users.
- Assign roles such as `ADMIN`, `MANAGER`, and `SUPPORT_AGENT`.

The backend routes are under:

```text
/api/admin/users
```

### Vehicle Inventory

Vehicles are linked to contracts and providers. Important vehicle pricing fields:

- `baseDailyRate`
- `allowedMileagePerDay`
- `extraMileageRate`
- `serviceMileageInterval`

These fields are used later during booking and payment completion.

### Booking Creation

Booking creation flow:

1. Select customer, pickup date, rental days, number of vehicles, vehicle type, and status.
2. Search available vehicles.
3. Select one or more vehicles.
4. Optionally assign drivers.
5. Enter start mileage per selected vehicle.
6. Create booking.

Booking pricing during creation:

```text
Vehicle Cost = Daily Rate x Rental Days x Number of Vehicles
Service Fee = Vehicle Cost x 10%
Driver Cost = LKR 2,500 x Rental Days x Number of Drivers
Total Amount = Vehicle Cost + Service Fee + Driver Cost
```

In the implementation, each `BookingVehicle` stores its `lineTotal`, which includes the marked-up vehicle rental amount and driver fee where applicable.

### Booking Completion and Extra Mileage

When completing bookings:

1. Enter end mileage for every vehicle in the booking.
2. The backend calculates actual mileage per vehicle.
3. The backend calculates allowed mileage per vehicle.
4. Extra mileage is calculated per vehicle.
5. Extra mileage fee is calculated per vehicle.
6. Booking final total is recalculated.

Formula:

```text
Actual Mileage = End Mileage - Start Mileage
Allowed Mileage = allowedMileagePerDay x Rental Days
Extra Mileage = max(Actual Mileage - Allowed Mileage, 0)
Extra Mileage Charge = Extra Mileage x extraMileageRate
Final Booking Total = Normal Booking Total + Extra Mileage Charges
```

If a booking has extra mileage but the vehicle has no positive `extraMileageRate`, completion fails instead of silently charging `Rs. 0.00`.

### Bulk Completion and Receipt Printing

The Booking List supports selecting multiple confirmed bookings. For each selected booking:

- Enter end mileage for every vehicle.
- Click `Complete Selected`.
- Backend completes all selected bookings.
- Frontend displays a detailed receipt.
- Receipt can be printed using `Print Receipt`.

Receipt includes:

- Booking number
- Customer
- Pickup and return dates
- Rental days
- Vehicle details
- Start and end mileage
- Allowed and actual mileage
- Extra mileage
- Extra mileage rate
- Normal total
- Extra mileage fees
- Final booking total
- Bulk payment total

## Backend API Overview

All backend endpoints are prefixed with:

```text
/api
```

### Authentication

```text
POST /api/auth/login
```

### Admin Users

```text
GET  /api/admin/users
POST /api/admin/users/register
```

### Providers

```text
GET    /api/providers
GET    /api/providers/{id}
POST   /api/providers
PUT    /api/providers/{id}
DELETE /api/providers/{id}
```

### Contracts

```text
GET    /api/contracts
GET    /api/contracts/{id}
POST   /api/contracts
PUT    /api/contracts/{id}
DELETE /api/contracts/{id}
```

### Vehicles

```text
GET    /api/vehicles
GET    /api/vehicles/{id}
POST   /api/vehicles
PUT    /api/vehicles/{id}
DELETE /api/vehicles/{id}
POST   /api/vehicles/search
```

### Customers

```text
GET    /api/customers
GET    /api/customers/{id}
POST   /api/customers
PUT    /api/customers/{id}
DELETE /api/customers/{id}
```

### Drivers

```text
GET    /api/drivers
GET    /api/drivers/{id}
POST   /api/drivers
PUT    /api/drivers/{id}
DELETE /api/drivers/{id}
```

### Bookings

```text
GET  /api/bookings
GET  /api/bookings/{id}
POST /api/bookings
PUT  /api/bookings/{id}/cancel
PUT  /api/bookings/{id}/complete
PUT  /api/bookings/complete-bulk
```

### Service Logs

```text
GET  /api/service-logs
GET  /api/service-logs/{id}
GET  /api/service-logs/vehicle/{vehicleId}
POST /api/service-logs
PUT  /api/service-logs/{id}
```

### Uploads

```text
POST /api/uploads/vehicle-image
POST /api/uploads/contract-document
```

## Frontend Pages

- Dashboard - summary statistics and recent bookings.
- Providers - provider list and provider management.
- Contracts - contract records and document upload.
- Vehicles - inventory cards, pricing, image upload, and vehicle management.
- Drivers - driver records and activation status.
- Customers - customer records.
- Search Vehicles - availability search and booking simulation.
- Bookings - create bookings, view/sort booking list, complete bookings, print receipts.
- Service Logs - vehicle service history.
- User Registration - admin-only user management.

## Roles and Access

Current application roles include:

- `ADMIN`
- `MANAGER`
- `SUPPORT_AGENT`

Backend security uses Spring Security method authorization through `@PreAuthorize` in selected controllers. Frontend routing also uses protected routes and role checks.

## CORS

CORS is centralized in:

```text
driveease-backend/src/main/java/com/driveease/security/WebSecurityConfig.java
```

Allowed frontend origins are configured in:

```properties
app.cors.allowed-origins=http://localhost:5173
```

To allow multiple origins, use a comma-separated list:

```properties
app.cors.allowed-origins=http://localhost:5173,https://example.com
```

## Cloudinary Uploads

Vehicle images and contract documents are uploaded through Cloudinary.

Relevant backend classes:

- `CloudinaryConfig`
- `CloudinaryImageService`
- `ImageUploadController`

For production, store Cloudinary credentials outside source control using environment variables, profiles, or a secret manager.

## Database Notes

Hibernate is currently configured with:

```properties
spring.jpa.hibernate.ddl-auto=update
```

This is convenient for development because entity changes can update the local schema automatically. For production, prefer controlled migrations with a tool such as Flyway or Liquibase.

The repository also includes:

- `schema.sql`
- `DriveEase_ER_Diagram_Updated.drawio (3).png`
- `DriveEase.postman_collection.json`

## Postman

Use `DriveEase.postman_collection.json` to test backend endpoints manually.

Typical sequence:

1. Login with the seeded admin user.
2. Copy the JWT token.
3. Use `Authorization: Bearer <token>` for protected endpoints.
4. Create providers, contracts, vehicles, customers, and drivers.
5. Search vehicles.
6. Create bookings.
7. Complete bookings and verify receipt totals.

## Troubleshooting

### Frontend cannot reach backend

Check:

- Backend is running on `http://localhost:8080`.
- Frontend API base URL in `frontend/src/services/api.js`.
- CORS origin in `app.cors.allowed-origins`.
- Browser console network errors.

### Login fails

Check:

- MySQL is running.
- Backend started successfully.
- Seeded admin exists.
- Use `admin@driveease.com` / `admin123`.

### Extra mileage charge is zero

Check the vehicle has a positive `extraMileageRate`. The backend rejects completion when extra mileage exists but the rate is missing or zero.

### Vehicle search returns no vehicles

Check:

- Vehicle is active.
- Vehicle availability status is `AVAILABLE`.
- Contract is active.
- Contract date range covers the requested pickup/return dates.
- Vehicle type matches the search.
- Vehicle is not already booked for an overlapping confirmed booking.

### Uploads fail

Check:

- Cloudinary credentials.
- File size and file type.
- Auth token is present.
- User has `ADMIN` or `MANAGER` role where required.

## Development Notes

- Keep backend CORS configuration centralized in `WebSecurityConfig`.
- Keep frontend API calls centralized under `frontend/src/services`.
- Booking totals should be considered backend-authoritative.
- Frontend estimated totals are for user feedback only.
- Avoid storing secrets in committed config files for production.

## Verification Checklist

Before handing off changes:

```powershell
cd frontend
npm run build
```

```powershell
cd driveease-backend
.\mvnw.cmd -q -DskipTests compile
```

For deeper verification:

```powershell
cd frontend
npm run lint
```

```powershell
cd driveease-backend
.\mvnw.cmd test
```
