
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Transfers (
  exchange TEXT NOT NULL,
  id TEXT NOT NULL,
  currency TEXT NOT NULL,
  type TEXT NOT NULL,
  at TEXT NOT NULL,
  amount TEXT NOT NULL,
  PRIMARY KEY (exchange, id)
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Transfers;
