const { JSDOM } = require('jsdom');
const express = require('express');
const morgan = require('morgan');
const request = require('request');

const PORT = process.env.PORT || 5000;
const VALID_URL = /(http|https):\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
const app = express();

const getValue = (fullText) => {
  const text = fullText.replace(/(\n|\t)/g, '').trim();

  if (text === '0') {
    return Number(text);
  }

  return Number(text) || text;
};

const getTableData = (el) => {
  const rows = Array.from(el.querySelectorAll('tr'));
  return rows.map((row) => {
    const cols = Array.from(row.querySelectorAll('th,td'));
    return cols.map(col => getValue(col.textContent));
  });
};

const getData = (elements) => {
  const data = Array.from(elements).map((e) => {
    if (e.tagName.match(/table/i)) {
      return getTableData(e);
    }

    return getValue(e.textContent);
  });

  if (data.length === 1) {
    return data[0];
  }

  return data;
};

app.use(morgan());

app.get('*', (req, res) => {
  const { url, selector = 'table' } = req.query;
  // make sure url is kosher
  if (!(url && url.match(VALID_URL))) {
    return res.send(400, { error: 'must be a valid url' });
  }

  // set response headers
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'X-Requested-With',
    'Content-Type': 'application/json',
  });

  // fetch and construct table data
  return request(url, (e, r, body) => {
    if (e) {
      return res.send(404, e);
    }

    const { window: { document } } = new JSDOM(body);

    const data = {
      title: document.querySelector('title').textContent.trim(),
      data: getData(document.querySelectorAll(selector)),
    };

    // return data
    if (!data.data.length) {
      return res.send(404, { error: `url has no "${selector}" data` });
    }

    return res.send(200, JSON.stringify(data));
  });
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
