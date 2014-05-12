-- SQL for Users table

BEGIN TRANSACTION;
CREATE TABLE Users(User_Id integer primary key autoincrement,
				   Name text);
INSERT INTO Users VALUES(0, 'Alice');
INSERT INTO Users VALUES(1, 'Bob');
INSERT INTO Users VALUES(2, 'Carol');
INSERT INTO Users VALUES(3, 'Ivan');
INSERT INTO Users VALUES(4, 'Justin');
COMMIT;

-- SQL for Tag table
BEGIN TRANSACTION;
CREATE TABLE Tag(Tag_Id integer primary key autoincrement,
				 User_Idd integer,
				 Type text);
INSERT INTO Tag VALUES(10, 0, 'MiFare classic');
INSERT INTO Tag VALUES(11, 0, 'ATM badge');
INSERT INTO Tag VALUES(12, 1, 'MiFare classic');
INSERT INTO Tag VALUES(13, 2, 'MiFare classic');
INSERT INTO Tag VALUES(14, 2, 'ATM badge');
INSERT INTO Tag VALUES(15, 3, 'MiFare classic');
INSERT INTO Tag VALUES(16, 4, 'MiFare classic');
INSERT INTO Tag VALUES(17, 4, 'ATM badge');
INSERT INTO Tag VALUES(18, 4, 'RFID');
COMMIT;