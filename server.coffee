VALID_URL = /(http|https):\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi
PORT    = process.env.PORT or 5000
express = require 'express'
cheerio = require 'cheerio'
request = require 'request'
app     = express()
getTableData = ($, selector = 'table') -> for table in $(selector)
  for tr in $(table).find 'tr'
    for td in $(tr).find 'td,th'
      t = $(td).text().trim()
      +t or t

app.use express.logger()

app.get '*', (req, res) ->
  url = req.url.replace('/','')
  # make sure url is kosher
  return res.send 400, error: 'must be a valid url' unless url.match VALID_URL

  # set response headers
  res.header 'Access-Control-Allow-Origin', '*'
  res.header 'Access-Control-Allow-Headers', 'X-Requested-With'
  res.setHeader 'Content-Type', 'application/json'

  # fetch and construct table data
  request url, (e, r, b) ->
    return res.send 404, e if e
    $ = cheerio.load b, normalizeWhitespace: true
    data =
      title: $('title').text().trim()
      data: getTableData $, req.query.selector

    # if only one result, push it to the top-level
    data.data = data.data.pop() if data.data.length is 1

    # return data
    return res.send 404, error: 'url has no table data' unless data.data.length
    return res.send 200, JSON.stringify data

app.listen PORT, -> console.log 'Listening on ' + PORT
