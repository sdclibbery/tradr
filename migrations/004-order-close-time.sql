
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE Orders ADD COLUMN closeTime TEXT;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

BEGIN TRANSACTION;
CREATE TEMPORARY TABLE Orders_backup (
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
  reason TEXT NOT NULL,
  fillPrice TEXT NOT NULL,
  fees TEXT NOT NULL
);
INSERT INTO Orders_backup
 SELECT id, exchange, product, status, created, side, orderPrice, priceAtCreation, amount, creator, reason, fillPrice, fees
 FROM Orders;
DROP TABLE Orders;
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
  reason TEXT NOT NULL,
  fillPrice TEXT NOT NULL,
  fees TEXT NOT NULL
);
INSERT INTO Orders
 SELECT id, exchange, product, status, created, side, orderPrice, priceAtCreation, amount, creator, reason, fillPrice, fees
 FROM Orders_backup;
DROP TABLE Orders_backup;
COMMIT;
