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
x Give each bot its own 'main' file complete with cmd line args?
x Extract bot boilerplate
x Automatic command line help
x create help text
x Bot for reporting account balances
x Need to tidy up log-then-exit pattern by adding that functionality to the Logger
x All log lines NOT logged by logger still need to start with 'warn' 'error' etc
 x Swap these to sync logger..?
x Catch promise rejections on all the actual bot functions - move more boilerplate into framework...
x Bot for reporting open orders
x Bots for making simple, single transactions
x Pull out common functions: dp2 etc parsing product into base/quote etc ! These should live in exchange: shouldnt be dp2, should be formatBase, formatQuote etc
x Use getProductTicker to get current latest price instead of waitForPriceChange - use for stoploss trackers
x GDAX waitForPriceChange should only report price *changes*, not just every filled order
x Report balance and portfolio values in EUR
x stop bots: final logging; also dont move stop by tiny amounts
x Basic test harness for stoploss tracker bot
x Record profit from the bot under test; run test 100x and check overall profit levels
x Run test for bear stop bot and see if theres any difference
x Balances should report total in BTC too
* Hack up a moving average bots
 x Basic tracking of averages from candles
 x Set average counts from options and reduce logging
 x Pretend buy/sell and track Profit
 x Consider fees
 * Default to ema 12/26
 * Use open/close not low/high
 * Extract logic
 * Run a spread of bots from the same data and compare profits on them...
 * Consider hysteresis or loss aversion
  ? Hysteresis on direction changes
  ? Pair up buy/sell trades to preclude loss; don't make the second trade in the pair until it will make a profit
  ? Avoid acting on sudden changes; maybe incorporate variance
 * Consider smarter buy/sell process
  ? Exit orders??
  ? Stop orders to hit peaks/troughs better??
 * Really buy/sell...
  * Test suite...
* Use empirical data
 * Need to start from random point in first half of data...
* Get empirical price change distribution
 x Will have to record from 'live'
 * Determine distribution
  ! Can approximate with two normal distributions; one narrow and tall and one wide and low
   ! separate the samples and calc two separate variances in google sheets
   ? How to calculate this? Sample from one or other normal based on a probability weighted between them
* Try swapping stop bots to limit stop orders to avoid fees; compare profit: is it better or worse?
* Would be nice to setup so you can run any bot against the test framework ?maybe have cmd line option to test bot instead of running profit-test.js file??
* What about other kinds of tests? eg more specific property based tests for specific bots?
* New Bot:
start: set limit sell above, and limit buy below, initial price
every x minutes:
 if either filled, remember last buy or sell fill price as appropriate
 if there are no fill prices yet, track both buy and sell with current price
 if current price is below last sell fill price, set buy limit below current price
 if current price is above last buy fill price, set sell limit above current price
so, the buy price tracks where we've sold, and the sell price tracks where we've bought...
Run this bot automatically from monitor?
* Consider dodging fees for stop bots
* Bots for making simple transactions with exit orders
* Should be taking profit metrics from the live bots and storing off for analysis
* bot that sets both limit buy and sell 1,2,3,5,10% above and below price
* bot that watches for price change followed by steady and then buys if (fall-then-steady) or sell if (rise-then-steady)
 Must alternate though; at least it mustnt sell everything during sustained price rise etc
* Get rounding values from the product info, don't hardcode
* PumpnDump hanger-on bot
 Bot that watches for sudden jumps in price, then sells, then waits for sudden price fall, then buy back in
 Basically, take advantage of pump n dumps as they happen
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
* Update readme with cmd line instructions
* Possible tweak to the stoploss bot: exit anyway after making x% profit; don't wait for the stoploss - cmd line arg controls
  * Could even do this graduated; so exit 25% at 1% profit etc
  * This would probably be uselful for bots on automatic triggers...

---

Consider taking NVT into account in bots: https://coinmetrics.io/nvt/#assets=btc_zoom=1491091200000,1522627200000

  Simple buy/sell tracker (ie buy/sell limits above and below; reset them at the new price when one fills) is great when the price trend is flat because it makes money every time the price changes direction, but it is not sustainable when the price keeps moving in one direction, because it will keep buying or selling, and eventually run out of capital. So a bot like that could exit if it sees a steady up or down trend in moving averages.

  The discrete 15 minute bot is good for exploiting big candles, but it must be protected from making trades that are loss making in the overall picture. So it needs to track past trades and not make new ones if they would be loss making. This bot is most vulnerable to a sequence of eg red candles buried in a green trend, because it will keep buying at ever higher prices. It shouldn't place an order if is in same direction as last fill. Don't place order if it would make a loss against last fill. It also runs the risk of using up all the capital on one side, but that is not based on trend, but on the trend of large candles.
