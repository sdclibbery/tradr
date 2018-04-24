# GDAX API Credentials
Create a local file called `gdax-account-credentials.js`. This will be `.gitignore`d. The contents should be like:
```
exports.key = 'xxxxxxxxxxx';
exports.secret = 'xxxxxxxxxxx';
exports.passphrase = 'xxxxxxxxxxx';
```

# ToDo

x Move bots into own folder
x Move all trading related pages over from pi-monitor
* Find bots in new folder
 * Not running properly: why? Work ok when run individually; dont seem to be launching though
 * Check log pages
 * Check launch of buy-then-sell bots from product trade page...
* Sort out graceful closedown: use server.close to not accept new connections, then wait for existing to complete
* Order tracking
 x Have a sqlite database
 x Write info on every order to it
  x exchange, id, time, side, price, amount, who made it and why, price at time of making it
 x Getting WRONG priceAtCreation
 * Back up sqlite db regularly to google drive
 * Set creator and reason properly
 * Update status on cancelling orders
 * Update status on retrieving orders from gdax
 * Can read back info on filled orders, augmenting with profit info
* Save account info to DB whenever its accessed
* Trading pages
 x Route for page with product
 x List account info into iframe
 x List orders into an iframe
 x Better default values on ETH page
 x Trading options
  x Buy sell above/below for when price is fluctuating
  x Buy then sell button for price rise. Runs a Bot. Tries to buy at up to the specified sell price, then places sell order.
     Has good tracking reason etc. Launch from button on trade product page
 * Candle granularities
  x Zoom in and allow swiping left/right if possible
  * Fetch and process candles client-side
  * Buttons to switch granularities
 * Tradr: order tracking in sqlite
 * order page will need pagination/sorting/filtering
 * Show price and candles on a log plot
  x Basic drawing
  x Make sure its not waiting for the iframes before rendering!
  * refactor and clean
  * plot proper x axis using time (dont assume it from the index) - also think we're losing the most recent candle at the moment!!
  * log plot
  * plot scale lines etc
 * Price and candles auto update
 * EMAs
 * Show live depth chart
* Mechanism for rationalising old orders
 * Eg find old orders that can cancel with each other given their 'createdAt' prices?
 * Show TA indicators: RSI, NVT
 * Can clear logs
 * Bot log pages live update
 * Can set arguments when starting a bot
  ! Fix forms...
 * Page that lists running bots with status and progress
 * Handle missing log files more gracefully
* Hack up a moving average bots
 x Basic tracking of averages from candles
 x Set average counts from options and reduce logging
 x Pretend buy/sell and track Profit
 x Consider fees
 x Default to ema 12/26
 x Use open/close not low/high
 x Buy,sell now don't work through monitor
 * Testing
  x Fill in gaps in candles returned from GDAX
  x Pull 2 consecutive lots of data from a random time in history and join together
  x Calculate a variety of emas against the data and iterate through the second half of the data
  x Gather more data and take longer runs
  ! Looks like if we can avoid fees, the bots can make profit..!
  * Allow setting granularity as option to see how longer term bots do
  * Record peak profit achieved by bot and report in status
  * Allow setting test time as option to allow repeatable and varied tests
  * Try adding hysteresis on direction change
  * Ema crossing bots
  * Allow for fees etc
 * Consider hysteresis or loss aversion
  ? Hysteresis on direction changes
  ? Pair up buy/sell trades to preclude loss; don't make the second trade in the pair until it will make a profit
  ? Avoid acting on sudden changes; maybe incorporate variance
 * Consider smarter buy/sell process
  ? Exit orders??
  ? Stop orders to hit peaks/troughs better??
 * Consider fee avoidance
  ? Simulate using limit order instead of market; does the removal of fees make up for having to catch a price reversal?
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
* Should be taking profit metrics from the live bots and storing off for analysis
* bot that sets both limit buy and sell 1,2,3,5,10% above and below price
* bot that watches for price change followed by steady and then buys if (fall-then-steady) or sell if (rise-then-steady)
 Must alternate though; at least it mustnt sell everything during sustained price rise etc
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

Keep a log of all previous 'open' transactions. Make a transaction now if it will make profit against any open transaction. That then closes the previous transaction, and as the new one as on 'open' transaction. But, 'at a profit' need to be 'at a profit ahead of hodling anything'...
