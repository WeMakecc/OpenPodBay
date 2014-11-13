-- SQL for User table
BEGIN TRANSACTION;
CREATE TABLE User (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    group_id INTEGER,
    status INTEGER,
    credits TEXT,
    active INTEGER
);
INSERT INTO User VALUES(0, 'Bob', 0, 5, '0', 1);
INSERT INTO User VALUES(1, 'Alice', 1, 5, '0', 1);
COMMIT;

-- SQL for Group table
BEGIN TRANSACTION;
CREATE TABLE Groups (
    group_id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupname TEXT
);
INSERT INTO Groups VALUES(0, 'administrator');
INSERT INTO Groups VALUES(1, 'member');
COMMIT;

-- SQL for Tag table
BEGIN TRANSACTION;
CREATE TABLE Tag(tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER,
                 type TEXT,
                 value TEXT,
                 active INTEGER);
INSERT INTO Tag VALUES(10, 0, 'alberto wemake', '_FD_A4_F3_69', 1);
INSERT INTO Tag VALUES(11, 1, 'ATM no sign', '_03_16_69_B5', 1);
INSERT INTO Tag VALUES(12, 0, 'ATM costantino', '_AE_8B_6C_FD', 1);
INSERT INTO Tag VALUES(13, 0, 'Ivan london', '_04_47_10_02_FC_2E_80', 1);
COMMIT;

BEGIN TRANSACTION;
CREATE TABLE Node(node_id INTEGER PRIMARY KEY AUTOINCREMENT,
                  current_ip TEXT,
                  date_last_seen INTEGER,
                  status INTEGER,
                  active INTEGER,
                  type TEXT,
                  label TEXT);
INSERT INTO Node VALUES(7, '192.168.1.148', 1408565250, 0, 1, 'gateway', 'porta ingresso');
INSERT INTO Node VALUES(8, '192.168.1.155', 1408565250, 0, 1, 'asset', 'laserone');
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
INSERT INTO Reservation VALUES(0, 1, 8, 1404905078, 120, 7200, 7200, 1);
INSERT INTO Reservation VALUES(1, 1, 8, 1404905078, 120, 7200, 7200, 1);
COMMIT;

BEGIN TRANSACTION;
CREATE TABLE Calendar(calendar_id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      group_id INTEGER, 
                      node_id INTEGER, 
                      day TEXT,
                      start TEXT,
                      end TEXT,
                      active INTEGER);
INSERT INTO Calendar VALUES(0, 0, 7, 'Monday', '06:00:00', '23:00:00', 1);
INSERT INTO Calendar VALUES(1, 0, 7, 'Tuesday', '06:00:00', '23:00:00', 1);
INSERT INTO Calendar VALUES(2, 0, 7, 'Wednesday', '06:00:00', '23:00:00', 1);
INSERT INTO Calendar VALUES(3, 0, 7, 'Thursday', '06:00:00', '23:00:00', 1);
INSERT INTO Calendar VALUES(4, 0, 7, 'Friday', '06:00:00', '23:00:00', 1);
INSERT INTO Calendar VALUES(5, 0, 7, 'Saturday', '06:00:00', '23:00:00', 1);
INSERT INTO Calendar VALUES(6, 0, 7, 'Sunday', '06:00:00', '23:00:00', 1);
COMMIT;