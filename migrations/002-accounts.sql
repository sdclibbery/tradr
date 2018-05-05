
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Balances (
  currency TEXT NOT NULL,
  exchange TEXT NOT NULL,
  at TEXT NOT NULL,
  balance TEXT NOT NULL,
  available TEXT NOT NULL,
  PRIMARY KEY (currency, exchange, at)
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Balances;
