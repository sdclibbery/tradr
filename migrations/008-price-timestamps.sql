
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE Prices ADD COLUMN epochTimeStamp INTEGER;

CREATE INDEX idx_product ON Prices (product);
CREATE INDEX idx_epochTimeStamp ON Prices (epochTimeStamp);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

BEGIN TRANSACTION;
CREATE TABLE Prices_backup (
  product TEXT NOT NULL,
  at TEXT NOT NULL,
  price TEXT NOT NULL,
  PRIMARY KEY (product, at)
);
INSERT INTO Prices_backup
 SELECT product, at, price
 FROM Prices;
DROP TABLE Prices;
CREATE TABLE Prices (
  product TEXT NOT NULL,
  at TEXT NOT NULL,
  price TEXT NOT NULL,
  PRIMARY KEY (product, at)
);
INSERT INTO Prices
 SELECT product, at, price
 FROM Prices_backup;
DROP TABLE Prices_backup;
COMMIT;
