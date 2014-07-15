-- SQL for User table
BEGIN TRANSACTION;
CREATE TABLE User (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT, -- sha256 hash of the plain-text password
    salt TEXT, -- salt that is appended to the password before it is hashed
    groups TEXT,
    active INTEGER
);
INSERT INTO User VALUES(0, 'admin', '4ddf3f61c0c2d465dd949cc9fdb4899b02d933d4b2ddb0debb5ec42b9f630999', 'foo', 'ADMIN', 1);
INSERT INTO User VALUES(1, 'user', 'd8215582333e446fab89b60f1831d12a08fb9a6140c6a0eeca4bc2bdec815a22', 'foo1', 'USER', 1);
COMMIT;

-- SQL for Tag table
BEGIN TRANSACTION;
CREATE TABLE Tag(tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER,
                 type TEXT,
                 value TEXT,
                 active INTEGER);
INSERT INTO Tag VALUES(10, 0, 'MiFare classic', '_DD_78_90_11', 1);
INSERT INTO Tag VALUES(11, 0, 'ATM badge', '_BB_05_79_39', 1);
INSERT INTO Tag VALUES(12, 1, 'MiFare classic', '_FD_9E_F0_69', 1);
INSERT INTO Tag VALUES(13, 2, 'MiFare classic', '_1D_7D_2A_3F', 1);
INSERT INTO Tag VALUES(14, 2, 'ATM badge', '_07_BE_BA_16', 1);
INSERT INTO Tag VALUES(16, 4, 'MiFare classic', '_07_BD_9F_18', 1);
INSERT INTO Tag VALUES(17, 0, 'atm costantino', '_AE_8B_6C_FD', 1);
INSERT INTO Tag VALUES(18, 0, 'tessera wemake', '_FD_A4_F3_69', 1);
COMMIT;

BEGIN TRANSACTION;
CREATE TABLE Node(node_id INTEGER PRIMARY KEY AUTOINCREMENT,
                  current_ip TEXT,
                  date_last_seen INTEGER,
                  status INTEGER,
                  active INTEGER);
INSERT INTO Node VALUES(6, '192.168.1.148', '12345', '0', '1');
INSERT INTO Node VALUES(8, '192.168.1.155', '12345', '0', '1');
COMMIT;

BEGIN TRANSACTION;
CREATE TABLE Reservation(reservation_id INTEGER PRIMARY KEY AUTOINCREMENT, 
                         user_id INTEGER, 
                         node_id INTEGER, 
                         expected_start INTEGER,
                         actual_start INTEGER,
                         expected_duration INTEGER,
                         actual_duration INTEGER,
                         active INTEGER);
INSERT INTO Reservation VALUES(0, 1, 8, 1404905078, 1404905078, 7200, 7200, 1);
INSERT INTO Reservation VALUES(1, 1, 8, 1404905078, 1404905085, 7200, 7200, 1);
COMMIT;









