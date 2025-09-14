-- Esempio: tabella pilots
CREATE TABLE IF NOT EXISTS pilots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  psn_id VARCHAR(50) UNIQUE,
  tlm_nickname VARCHAR(50),
  last_initial CHAR(1),
  email VARCHAR(100),
  mobile VARCHAR(20),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
