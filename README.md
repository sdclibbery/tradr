# GDAX API Credentials
Create a local file called `gdax-account-credentials.js`. This will be `.gitignore`d. The contents should be like:
```
exports.key = 'xxxxxxxxxxx';
exports.secret = 'xxxxxxxxxxx';
exports.passphrase = 'xxxxxxxxxxx';
```

# ToDo

x Write algorithm
x waitForPriceChange
x stopLoss
x cancelOrder
x buy in
 x Use a (feeless) limit order not a market order
 x wait for order to fill before returning
 x waitForOrderFill
! Maybe it SHOULDNT buy-in itself? It'll either pay fees, or have to wait for a move in the 'wrong' direction...
   Maybe it should just take assignment of some preexisting coins and move a stoploss around them..?
 x Add an arg to choose whether to buy in
x Move rounding to the exchange and do it for every appropriate value
x Have an event emitter leak
 x Ask for order status, dont wait for it to fill
x Move logging to the exchange
x Seeing a lot of 'invalid signature' errors when price rises and the stoploss changes
x Failed to detect the stoploss filling
x Price keeps falling PAST the stoploss without triggering it! Is that because its a limit stoploss?
 x Fix by changing stoploss to a market order, even though that'll incur a fee
x Profit should be calculated using ACTUAL stoploss amount including fees
x Remove buyin option from this bot
x Log all API call data to a log file, with timings
x Pull a proper clean return value interface out into gdax exchange, dont just pass returned data structure back to the bot...
x Add a readme: API key / credentials, todo
* Encourage multiple bots and bot composition
** Give each bot its own 'main' file complete with cmd line args?
** Update readme
* Get rounding values from the product info, dont hardcode
* Make a simple, patient bot, that just uses limit orders to buy low and sell high...
* Write a bot to exploit spread on markets with a high spread
** Monitor the spread; if its large, eg >0.5% of value
** Then place buy AND sell orders at the edges of the spread
** And re-place them as they fill
** Cancel/move any as the spread moves
** Have limits and stop if only one side keeps filling?
* Possible tweak to the bot: exit anyway after making x% profit; don't wait for the stoploss - cmd line arg controls
** Could even do this graduated; so exit 25% at 1% profit etc
** This would probably be uselful for bots on automatic triggers...
