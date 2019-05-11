
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

DROP TABLE Transfers;
DROP TABLE Balances;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

CREATE TABLE Balances (
  currency TEXT NOT NULL,
  exchange TEXT NOT NULL,
  at TEXT NOT NULL,
  balance TEXT NOT NULL,
  available TEXT NOT NULL,
  PRIMARY KEY (currency, exchange, at)
);

CREATE TABLE Transfers (
  exchange TEXT NOT NULL,
  id TEXT NOT NULL,
  currency TEXT NOT NULL,
  type TEXT NOT NULL,
  at TEXT NOT NULL,
  amount TEXT NOT NULL,
  PRIMARY KEY (exchange, id)
);
