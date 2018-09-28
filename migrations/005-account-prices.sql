
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE Balances ADD COLUMN valueInEur TEXT;
ALTER TABLE Balances ADD COLUMN valueInBtc TEXT;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

BEGIN TRANSACTION;
CREATE TEMPORARY TABLE Balances_backup (
  currency TEXT NOT NULL,
  exchange TEXT NOT NULL,
  at TEXT NOT NULL,
  balance TEXT NOT NULL,
  available TEXT NOT NULL,
  PRIMARY KEY (currency, exchange, at)
);
INSERT INTO Balances_backup
 SELECT currency, exchange, at, balance, available
 FROM Balances;
DROP TABLE Balances;
CREATE TABLE Balances (
  currency TEXT NOT NULL,
  exchange TEXT NOT NULL,
  at TEXT NOT NULL,
  balance TEXT NOT NULL,
  available TEXT NOT NULL,
  PRIMARY KEY (currency, exchange, at)
);
INSERT INTO Balances
 SELECT currency, exchange, at, balance, available
 FROM Balances_backup;
DROP TABLE Balances_backup;
COMMIT;
