express = require 'express'
cheerio = require 'cheerio'
request = require 'request'
app     = express()
port    = process.env.PORT || 5000

app.use(express.logger())

app.get '*', (req, res) ->
  request req.url.replace('/',''), (e,r,b) ->
    $ = cheerio.load b
    data =
      title: $('title').text().trim()
      data: for table in $('table')
        for tr in $(table).find('tr')
          for td in $(tr).find('td,th')
            t = $(td).text().trim()
            +t or t

    res.send JSON.stringify data

app.listen port, () -> console.log("Listening on " + port)
