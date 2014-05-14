-- SQL for Users table

BEGIN TRANSACTION;
CREATE TABLE Users(User_Id integer primary key autoincrement,
				   Name text,
                   Active integer);
INSERT INTO Users VALUES(0, 'Alice', 1);
INSERT INTO Users VALUES(1, 'Bob', 1);
INSERT INTO Users VALUES(2, 'Carol', 1);
INSERT INTO Users VALUES(3, 'Ivan', 1);
INSERT INTO Users VALUES(4, 'Justin', 1);
COMMIT;

-- SQL for Tag table
BEGIN TRANSACTION;
CREATE TABLE Tag(Tag_Id integer primary key autoincrement,
				 User_Id integer,
				 Type text,
                 Value text);
INSERT INTO Tag VALUES(10, 0, 'MiFare classic', 0);
INSERT INTO Tag VALUES(11, 0, 'ATM badge', 1);
INSERT INTO Tag VALUES(12, 1, 'MiFare classic', 12);
INSERT INTO Tag VALUES(13, 2, 'MiFare classic', 13);
INSERT INTO Tag VALUES(14, 2, 'ATM badge', 14);
INSERT INTO Tag VALUES(15, 3, 'MiFare classic', 15);
INSERT INTO Tag VALUES(16, 4, 'MiFare classic', 16);
INSERT INTO Tag VALUES(17, 4, 'ATM badge', 17);
INSERT INTO Tag VALUES(18, 4, 'RFID', 18);
COMMIT;