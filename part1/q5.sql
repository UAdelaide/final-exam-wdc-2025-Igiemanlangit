-- Insert Users
INSERT INTO Users (username, email, password_hash, role)
VALUES 
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('dawalker', 'da@example.com', 'hashed147', 'walker'),
('ewalker', 'e@example.com', 'hashed258', 'walker');


-- Insert Dogs using subqueries to get owner_id
INSERT INTO Dogs (name, size, owner_id)
VALUES
('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
('al', 'small', (SELECT user_id FROM Users WHERE username = 'alice123')),
('car', 'large', (SELECT user_id FROM Users WHERE username = 'carol123')),
('arol', 'large', (SELECT user_id FROM Users WHERE username = 'carol123'));


-- Insert WalkRequests using subqueries to get dog_id
INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
VALUES
((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 10:30:00', 5, 'small Ave', 'unavailable'),
((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 11:30:00', 10, 'medium Ave', 'declined'),
((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 12:30:00', 15, 'long Ave', 'pending');

-- yes, the small medium and long are avenues --
