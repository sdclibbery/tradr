const os =  require('os')

exports.apply = (content) => `
<html>
  <head>
    <title>${os.hostname()} pi monitor </title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {font-family:helvetica,sans-serif;}
      a {margin:3px;padding:3px;border:1px solid #aaa;background-color:#eee;color:#111;border-radius:3px;text-decoration:none;} a:hover{background-color:#ddd;}
      th { background-color: #e8e8e8; }
      tr:nth-child(odd) { background-color: #f4f4f4; }
      td { padding: 2px 8px 2px 8px; }
    </style>
  </head>
  <body>
    <a href='/'>Home</a>
    <a href='/status'>Status</a>
    <a href='/bot'>Bots</a>
    <a href='/trade/BTC-EUR'>BTC-EUR</a>
    <a href='/trade/BTC-GBP'>BTC-GBP</a>
    <a href='/trade/ETH-BTC'>ETH-BTC</a>
    <a href='/trade/LTC-BTC'>LTC-BTC</a>
    ${content}
  </body>
</html>
`

exports.minimal = (content) => `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {font-family:helvetica,sans-serif;}
      a {margin:3px;padding:3px;border:1px solid #aaa;background-color:#eee;color:#111;border-radius:3px;text-decoration:none;} a:hover{background-color:#ddd;}
      th { background-color: #e8e8e8; }
      tr:nth-child(odd) { background-color: #f4f4f4; }
      td { padding: 2px 8px 2px 8px; }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>
`
