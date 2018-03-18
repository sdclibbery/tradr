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
x Simple observer bot that watches and reports prices
x Log output to file
x Extract bot boilerplate
 x basic
 x create help text
 x if any args without defaultValue are missing, show help instead of running
 x help option auto add by framework
 x add defaultValue and 'required' info to description
* Log output to stdio as well as file
* Persistant state to allow for process/box restart
 Given the use of async, how is this possible? Itd need to include the progress through the function..??
* Make a bot that transacts whenever 2 moving averages cross
* Write a bot to exploit spread on markets with a high spread (BCH-EUR or BTC-GBP probably)
  * Monitor the spread; if its large, eg >0.5% of value
  * Then place buy AND sell orders at the edges of the spread
  * And re-place them as they fill
  * Cancel/move any as the spread moves; cancel altogether if spread closes
  * Have limits and stop if only one side keeps filling?
* Make a bot that evaluates slowly against the *log*!! BTC channel
 pt on centre of channel: (2017-01-10, 776.06)
 pt on bottom of channel: (2017-03-25, 895.25)
 pt on top of channel: (2017-01-23, 1176.08)
* Encourage multiple bots and bot composition
  x Give each bot its own 'main' file complete with cmd line args?
  * Automatic command line help
  * Update readme with cmd line instructions
* Get rounding values from the product info, dont hardcode
* Possible tweak to the bot: exit anyway after making x% profit; don't wait for the stoploss - cmd line arg controls
  * Could even do this graduated; so exit 25% at 1% profit etc
  * This would probably be uselful for bots on automatic triggers...