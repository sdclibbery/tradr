
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Orders (
  id TEXT PRIMARY KEY,
  exchange TEXT NOT NULL,
  product TEXT NOT NULL,
  status TEXT NOT NULL,
  created TEXT NOT NULL,
  side TEXT NOT NULL,
  orderPrice TEXT NOT NULL,
  priceAtCreation TEXT NOT NULL,
  amount TEXT NOT NULL,
  creator TEXT NOT NULL,
  reason TEXT NOT NULL
);

CREATE INDEX Orders_ix_status ON Orders (status);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX Orders_ix_status;
DROP TABLE Orders;
