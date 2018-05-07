
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE Orders ADD COLUMN fillPrice TEXT NOT NULL DEFAULT '0';
ALTER TABLE Orders ADD COLUMN fees TEXT NOT NULL DEFAULT '0';

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
  reason TEXT NOT NULL
);
INSERT INTO Orders_backup
 SELECT id, exchange, product, status, created, side, orderPrice, priceAtCreation, amount, creator, reason
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
  reason TEXT NOT NULL
);
INSERT INTO Orders
 SELECT id, exchange, product, status, created, side, orderPrice, priceAtCreation, amount, creator, reason
 FROM Orders_backup;
DROP TABLE Orders_backup;
COMMIT;
