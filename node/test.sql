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
INSERT INTO Tag VALUES(10, 0, 'MiFare classic', '_DD_78_90_11');
INSERT INTO Tag VALUES(11, 0, 'ATM badge', '_BB_05_79_39');
INSERT INTO Tag VALUES(12, 1, 'MiFare classic', '_FD_9E_F0_69');
INSERT INTO Tag VALUES(13, 2, 'MiFare classic', '_1D_7D_2A_3F');
INSERT INTO Tag VALUES(14, 2, 'ATM badge', '_07_BE_BA_16');
INSERT INTO Tag VALUES(16, 4, 'MiFare classic', '_07_BD_9F_18');
COMMIT;

-- SQL for Tag table
BEGIN TRANSACTION;
CREATE TABLE Reservation(RES_Id integer primary key autoincrement,
                         User_Id integer,
                         Node_Id integer,
                         Start datetime,
                         End datetime);
INSERT INTO Reservation VALUES(0, 0, 0, '2014-01-01 12:00', '2014-12-01 12:200');
COMMIT;