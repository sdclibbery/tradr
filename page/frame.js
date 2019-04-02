const os =  require('os')

exports.apply = (content) => `
<html>
  <head>
    <title>${os.hostname()} pi monitor </title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {font-family:helvetica,sans-serif;}
      a {margin:3px;padding:3px;border:1px solid #aaa;background-color:#eee;color:#111;border-radius:3px;text-decoration:none;} a:hover{background-color:#ddd;}
      a.nav {margin:0.5px;padding:1px;border:1px solid #aaa;background-color:#eee;color:#111;border-radius:1px;text-decoration:none;} a:hover{background-color:#ddd;}
      th { background-color: #e8e8e8; }
      tr:nth-child(odd) { background-color: #f4f4f4; }
      td { padding: 2px 8px 2px 8px; }
    </style>
  </head>
  <body>
    <menu>
      <a class="nav" href='/'>Home</a>
      <a class="nav" href='/status'>Status</a>
    </menu>
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
