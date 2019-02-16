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
x Find bots in new folder
 x Not running properly: why? Work ok when run individually; dont seem to be launching though
 x Check log pages
 x Check launch of buy-then-sell bots from product trade page...
x Trading pages
 x Route for page with product
 x List account info into iframe
 x List orders into an iframe
 x Better default values on ETH page
 x Trading options
  x Buy sell above/below for when price is fluctuating
  x Buy then sell button for price rise. Runs a Bot. Tries to buy at up to the specified sell price, then places sell order.
     Has good tracking reason etc. Launch from button on trade product page
 x Candle granularities
  x Zoom in and allow swiping left/right if possible
  x Fetch and process candles client-side
  x Buttons to switch granularities
 x Show price and candles on a log plot
  x Basic drawing
  x Make sure its not waiting for the iframes before rendering!
  x Display date/times better
x Price and amount boxes have wrong values and are not explained on ETH trade page
x Order tracking
 x Have a sqlite database
 x Write info on every order to it
  x exchange, id, time, side, price, amount, who made it and why, price at time of making it
 x Getting WRONG priceAtCreation
 x Can read back info on filled orders, augmenting with profit info
 x Update status on cancelling orders
x Candles log plot
x Bots arent working??!
x Could only trade LTC in increments of 1
x Save account balance info to DB whenever its accessed, to provide a history
 x sqlite migration to add accounts table
 x Save the data to the table
x Order page: filter out orders cancelled by bots
x bot launch still not working :-(
x Fix tech debt of global exchange object in framework.js
x Refactor exchange
 x From startup (not exchange creation), fetch steps
 x ready() to allow callers to ensure exchange setup is complete
 x Remove fetchSteps
 ? do candles??
x Bots are opening their OWN sqlite in the /bot dir :-/
x Order filtering is using wrong filter
x Quote currency rounding on the account sub page is wrong
x Single thing to spawn bots
x Make sure all bots are setting buy/sell reasons
x Do any trade actions need fetch steps? No.
x Handle throttling fail more gracefully on status page
x Order tracking show filled orders and show actual profit/loss on orders page
 x Migrate-add fill-price and fees fields
 x When getting orders, pass them to the tracker along with a callback that fetches order status from exchange
  x Tracker gets order status for each order it thinks is open but is missing from the list, and updates if required
 x Update orders page: filled colours
 x Track fill *date* !!
 x Update orders page: show fill price as well, and also fees, and also actual real profit
  x Order by status
  x Split into separate tables (or even separate pages)
   x Open orders, including expected Profit
   x Filled orders excluding bot setup orders, including actual profit
   x User cancelled orders
x Buy then sell etc bot keeps retrying forever if theres insufficient funds
x Buy then sell bot failed because the order filled between checking the status and cancelling, so the cancel failed with:
x Analysis page with hull
 x Rough upper hull
 x Lower hull
x Display and sort by fill date on filled order page
x Migrate API usage away from api.gdax.com to api.pro.coinbase.com.
x !Auto pkg update not working??? - Check on this... - working now
x Update npm packages
x Handle case where order status lookup fails because order is not found
 o Theres a test case in the local DB as 37e39912-e1bb-4a4d-9683-c90ae4117a42
 x Catch it cleanly and return that status or throw
 x And then mark the order closed in the tracker DB
x Ability to clear bot logs
x Ability to back up sqlite db to google drive
x Product order/analysis page candle graphs show all current and historical orders overlaid graphically as rectangles
 x refactor: pull shared client side candle stuff into separate file
  x setup shared file for candle extents
  x pass extents into both draw functions from analysis page
  x draw candles uses extents
  x pass extents from product trade page
  x draw analysis uses extents
 x make new draw orders page
  x start with a temp test order; do drawing
  x pass real orders in
x Basic graph of account balances over time
x Track prices once
x Return latest prices instead of fetching
x Don't use await when calling latestPrice(Of)
 x Test bots still work!
x Extract gdax price follower
x Extract gdax account fetcher
x Account fetcher decorates accounts with latest prices and conversions into EUR, BTC
x Use converted balances on status and account product page
x Store and track prices alongside balances to allow conversion to combined portfolio value
x Fill in old account valueInEur etc by getting old prices, converting, and writing back to DB
 x Allow bot to run over other currencies etc
x Display valuesInEur/Btc on balances graph along with total combined value
x Add key showing which currency is which on account balance graph
x Add axis labels to account balance graph - extract code from drawCandles
x Auto update balances once per day (and don't do it on accessing accounts)
x Fix datetime format for Balances.at table: sqlite cant read it as a date(); use toIsoString instead
x Account balance display bug sometimes a single set of balances gets more than one ms 'at' value, screwing up the data
x Show orders on the account history graph
x Show live depth chart
 x Fetch in client from https://api.pro.coinbase.com/products/BTC-EUR/book?level=3
 x Colours for bid vs ask
 x Bucket by price
 x Load orderbook later (but still only once)
 x Volume scaling
 x Optimise: ignore orders outside range
x Add ZRX to homepage and accounts page
x Volume scaling on all candle graphs
x Have extended y axis on analysis page
x Need to keep price info for BTC-USD or remove it from homepage
x Allow 'extend' for every view on analysis page
x Account balances are broken due to new currencies getting added
x Sometimes prices stop updating: presumably the websocket connection gets closed. Need to detect this and remake the connection
x Have second account history graph in Btc as well as the Eur one
x Update node modules
x Red/green colours for order well
* Sim'd spread bot that posts at bid & ask prices
 x Use https://docs.pro.coinbase.com/#the-level2-channel and hack up a test bot
 x TDD the logic for snapshot and updates to track the order well and then spread correctly
 ! NOT WORKING - seems to not be clearing entries as the price moves?
 * TDD the logic for simulating placing order when the spread changes
* Sim'd arbitrage bot that tracks arbitrage on EUR-BTC-GBP
 * Hack something into gdax-prices.js as a quick test
* Show MACD 21/9 on analysis page (https://twitter.com/zhusu/status/1092305648904065024?s=19)
* Account history page show orders

* Add backup automation with monitoring of some kind
* Allow buy-then-sell bot to have multiple exits?
* Augment order info on the product pages with tracked info including expected profit
* Fix old datetime formats in Balances.at table
* Remove balance fix-up bot and tracker.setBalanceValues
* Can leave notes on orders explaining the reasoning behind them
* Can leave dated notes on each product page
* Set product alerts that show on the home & product page when triggered
 Eg: if ETHEUR falls below 600 then consider selling as 10 week support is broken
* Product alerts can auto trigger bots to run
* Candle time labels wrong
 On 12 day view, on 27th may, today was shown as 3/5, and the 24th was shown as 0/5 etc
 The 23rd was correct. The same problem was on all the other views too.
* Graphs: click on candles places crosshair with price/date readout on
* Order cancellation from orders page
* Bot that looks for very sudden price changes on one market not driven by other markets, and jumps in expecting that price to jump back when the arbitrage bots kick in...
* Trade page indicator to show whether there's more base or quote currency, both balance and available
* Has the bulk of the volume been coming from one account or many? Show on chart somehow
* Order page will need pagination/sorting/filtering
* Live price update
 * Fetch price client side
 * Use websocket feed to update price
* Show TA indicators: RSI, NVT
* Bot log pages live update
* Show EMAs

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
