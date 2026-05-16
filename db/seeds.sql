TRUNCATE micro_tasks RESTART IDENTITY CASCADE;
TRUNCATE users RESTART IDENTITY CASCADE;

-- Users first
INSERT INTO users (id, username, role, balance) VALUES
(1, 'AI', 'AI', 0),
(2, 'Parent', 'PARENT', 1000),
(3, 'Child', 'CHILD', 0),
(4, 'Reviewer', 'REVIEWER', 0);

-- Then tasks
INSERT INTO micro_tasks (day_number, content, status, ai_suggested_answer)
SELECT i, 'Task for day ' || i, 'LOADED', 'correct answer'
FROM generate_series(1, 365) AS i;