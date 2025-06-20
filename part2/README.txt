mysql -u root -p

SHOW databases;

USE DogWalkService;

SELECT * FROM Users;


mysql> SELECT * FROM Users;
+---------+-----------+-------------------+---------------+--------+---------------------+
| user_id | username  | email             | password_hash | role   | created_at          |
+---------+-----------+-------------------+---------------+--------+---------------------+
|       1 | alice123  | alice@example.com | hashed123     | owner  | 2025-06-20 07:25:19 |
|       2 | bobwalker | bob@example.com   | hashed456     | walker | 2025-06-20 07:25:19 |
|       3 | carol123  | carol@example.com | hashed789     | owner  | 2025-06-20 07:25:19 |
|       4 | dawalker  | da@example.com    | hashed147     | walker | 2025-06-20 07:25:19 |
|       5 | ewalker   | e@example.com     | hashed258     | walker | 2025-06-20 07:25:19 |
+---------+-----------+-------------------+---------------+--------+---------------------+