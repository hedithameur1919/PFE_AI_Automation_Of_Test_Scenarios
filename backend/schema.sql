-- Create user table
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

-- Create requirement table
CREATE TABLE requirement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  requirement_text VARCHAR(1000) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create testscenario table
CREATE TABLE testscenario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requirement_id INT UNIQUE NOT NULL,
  scenario_text VARCHAR(3000) NOT NULL,
  FOREIGN KEY (requirement_id) REFERENCES requirement(id) ON DELETE CASCADE
);

-- Create rating table
CREATE TABLE rating (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  scenario_id INT UNIQUE NOT NULL,
  rating INT NOT NULL CHECK (rating IN (1, 2, 3, 4, 5)),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (scenario_id) REFERENCES testscenario(id) ON DELETE CASCADE
);
