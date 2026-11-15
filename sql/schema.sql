CREATE DATABASE IF NOT EXISTS dineease
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dineease;

CREATE TABLE IF NOT EXISTS plans (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(50)  NOT NULL,
  price        DECIMAL(8,2) NOT NULL,
  category     ENUM('Starter','Growth','Premium') NOT NULL,
  start_date   DATE         NOT NULL,
  duration     ENUM('Monthly','Yearly') NOT NULL,
  menu_limit   INT UNSIGNED NOT NULL,
  description  VARCHAR(300) NOT NULL,
  reservations TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_plans_name (name),
  CONSTRAINT chk_plans_price CHECK (price >= 0 AND price <= 100000),
  CONSTRAINT chk_plans_limit CHECK (menu_limit >= 1)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_profiles (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(50)  NOT NULL,
  email           VARCHAR(150) NOT NULL,
  phone           CHAR(10)     NOT NULL,
  dob             DATE         NOT NULL,
  password_hash   VARCHAR(100) NOT NULL,         
  restaurant_name VARCHAR(100) NULL,
  plan_id         INT UNSIGNED NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profiles_email (email),
  CONSTRAINT fk_profiles_plan FOREIGN KEY (plan_id)
    REFERENCES plans(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO plans (name, price, category, start_date, duration, menu_limit, description, reservations) VALUES
 ('Starter', 0,  'Starter', '2026-01-01', 'Monthly', 25,  'A simple digital menu for small cafes getting started.', 0),
 ('Growth',  49, 'Growth',  '2026-01-01', 'Monthly', 100, 'More flexibility for growing restaurants and cafes.',   1),
 ('Premium', 99, 'Premium', '2026-01-01', 'Monthly', 500, 'An expanded menu and online bookings for busy venues.', 1);
