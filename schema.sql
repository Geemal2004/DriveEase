CREATE DATABASE IF NOT EXISTS driveease_db;
USE driveease_db;

-- =========================
-- 1. USERS TABLE
-- Admin / support agents
-- =========================
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'SUPPORT_AGENT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. PROVIDER TABLE
-- Partner vehicle providers
-- =========================
CREATE TABLE provider (
    provider_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150),
    address VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
);

-- =========================
-- 3. CONTRACT TABLE
-- Uploaded contract / digital record
-- =========================
CREATE TABLE contract (
    contract_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    uploaded_by BIGINT NOT NULL,
    document_name VARCHAR(150) NOT NULL,
    document_url VARCHAR(255),
    effective_from DATE NOT NULL,
    effective_to DATE,
    status ENUM('ACTIVE', 'EXPIRED', 'REMOVED') DEFAULT 'ACTIVE',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contract_provider
        FOREIGN KEY (provider_id)
        REFERENCES provider(provider_id),

    CONSTRAINT fk_contract_uploaded_by
        FOREIGN KEY (uploaded_by)
        REFERENCES users(user_id)
);

-- =========================
-- 4. VEHICLE TABLE
-- Individual vehicles available for rent
-- =========================
CREATE TABLE vehicle (
    vehicle_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    vehicle_type ENUM('SUV', 'SEDAN', 'HATCHBACK', 'VAN', 'OTHER') NOT NULL,
    registration_no VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100),
    base_daily_rate DECIMAL(10,2) NOT NULL,
    allowed_mileage_per_day INT,
    availability_status ENUM('AVAILABLE', 'NOT_AVAILABLE', 'MAINTENANCE') DEFAULT 'AVAILABLE',
    active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_vehicle_contract
        FOREIGN KEY (contract_id)
        REFERENCES contract(contract_id)
);

-- =========================
-- 5. CUSTOMER TABLE
-- Customer who rents vehicles
-- =========================
CREATE TABLE customer (
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    nic_or_passport VARCHAR(50),
    driving_license_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 6. BOOKING TABLE
-- Rental booking record
-- =========================
CREATE TABLE booking (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    rental_days INT NOT NULL,
    markup_percentage DECIMAL(5,2) DEFAULT 10.00,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('SIMULATED', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_booking_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
);

-- =========================
-- 7. BOOKING VEHICLE TABLE
-- Vehicles included in a booking
-- =========================
CREATE TABLE booking_vehicle (
    booking_vehicle_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    base_daily_rate DECIMAL(10,2) NOT NULL,
    final_daily_rate DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_booking_vehicle_booking
        FOREIGN KEY (booking_id)
        REFERENCES booking(booking_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_vehicle_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicle(vehicle_id)
);

-- =========================
-- INDEXES FOR SEARCH PERFORMANCE
-- =========================
CREATE INDEX idx_vehicle_type ON vehicle(vehicle_type);
CREATE INDEX idx_vehicle_availability ON vehicle(availability_status);
CREATE INDEX idx_vehicle_active ON vehicle(active);
CREATE INDEX idx_booking_dates ON booking(pickup_date, return_date);
CREATE INDEX idx_booking_status ON booking(status);