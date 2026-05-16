ALTER TABLE micro_tasks DROP CONSTRAINT IF EXISTS micro_tasks_status_check;

ALTER TABLE micro_tasks ADD CONSTRAINT micro_tasks_status_check 
CHECK (status IN ('LOADED', 'PRICED', 'SUBMITTED', 'REVIEWED', 'ACCEPTED','REJECTED'));
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('AI', 'PARENT', 'CHILD', 'REVIEWER')),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    trust_index INT DEFAULT 100
);

CREATE TABLE micro_tasks (
    id SERIAL PRIMARY KEY,
    day_number INT UNIQUE,
    content TEXT,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'LOADED', 
    child_answer TEXT,
    ai_suggested_answer TEXT,
    parent_id INT REFERENCES users(id),
    child_id INT REFERENCES users(id),
    reviewer_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_micro_tasks_status ON micro_tasks(status);