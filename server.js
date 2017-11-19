const VALID_URL = /(http|https):\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
const PORT = process.env.PORT || 5000;
const express = require("express");
const cheerio = require("cheerio");
const request = require("request");
const morgan = require("morgan");

const app = express();
let $ = null;

const getData = function(selector = 'table') {
  if ($(selector).is("table")) {
    return getTableData(selector);
  } else {
    return (() => {
      const result = [];
      for (let element of Array.from($(selector))) {
        const t = $(element).text();
        if (t === "0") {
          result.push(+t);
        } else {
          result.push(+t || t);
        }
      }
      return result;
    })();
  }
};

const getTableData = function(selector) {
  let t;
  if (selector == null) {
    selector = "table";
  }
  return Array.from($(selector)).map(table =>
    Array.from($(table).find("tr")).map(tr =>
      Array.from($(tr).find("td,th")).map(td => t = $(td).text().trim())
    )
  );
};

app.use(morgan());

app.get("*", function(req, res) {
  const { url, selector } = req.query;
  // make sure url is kosher
  if (!(url && url.match(VALID_URL))) {
    return res.send(400, { error: "must be a valid url" });
  }

  // set response headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader("Content-Type", "application/json");

  // fetch and construct table data
  return request(url, function(e, r, b) {
    if (e) {
      return res.send(404, e);
    }
    $ = cheerio.load(b, { normalizeWhitespace: true });
    const data = {
      title: $("title").text().trim(),
      data: getData(selector)
    };

    // if only one result, push it to the top-level
    if (data.data.length === 1) {
      data.data = data.data.pop();
    }

    // return data
    if (!data.data.length) {
      return res.send(404, { error: "url has no table data" });
    }
    return res.send(200, JSON.stringify(data));
  });
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
