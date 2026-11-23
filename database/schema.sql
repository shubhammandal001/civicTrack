USE civictrack;

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
);

-- 2. Users (citizen, officer, admin)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role ENUM('citizen', 'officer', 'admin') NOT NULL DEFAULT 'citizen',
  department_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Starting data
INSERT IGNORE INTO departments (name, description) VALUES
('Roads and Infrastructure', 'Potholes, damaged roads and footpaths'),
('Sanitation', 'Garbage and drainage issues'),
('Water Supply', 'Water leakage and supply problems'),
('Electricity', 'Street lights and power issues'),
('General Administration', 'Other civic issues');

INSERT IGNORE INTO categories (name, department_id) VALUES
('Pothole', (SELECT id FROM departments WHERE name = 'Roads and Infrastructure')),
('Garbage', (SELECT id FROM departments WHERE name = 'Sanitation')),
('Drainage', (SELECT id FROM departments WHERE name = 'Sanitation')),
('Water Leakage', (SELECT id FROM departments WHERE name = 'Water Supply')),
('Street Light', (SELECT id FROM departments WHERE name = 'Electricity')),
('Other', (SELECT id FROM departments WHERE name = 'General Administration'));

-- 4. Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category_id INT NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  status ENUM('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved')
    NOT NULL DEFAULT 'Submitted',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address VARCHAR(255),
  assigned_officer_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Complaint images
CREATE TABLE IF NOT EXISTS complaint_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  type ENUM('complaint', 'resolution') NOT NULL DEFAULT 'complaint',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 6. Status history
CREATE TABLE IF NOT EXISTS status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  old_status VARCHAR(20) NULL,
  new_status VARCHAR(20) NOT NULL,
  changed_by INT NULL,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);