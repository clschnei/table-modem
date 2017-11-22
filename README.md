# table-modem
Scrapes webpages and returns table data in JSON format.

## API

### Parameters

| Key | Value |
|-----|-------|
| `url`* | a full page url (protocol included) |
| `selector` | a valid query selector for elements |

### Examples

Basic

```bash
curl --get \
  --url http://evening-taiga-6355.herokuapp.com \
  --data-urlencode "url=https://google.com"
```
```json  
{"title":"Google","data":[["","","Advanced searchLanguage tools"]]}
```

With `selector`

```bash
curl --get \
  --url http://evening-taiga-6355.herokuapp.com \
  --data-urlencode "url=https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table" \
  --data-urlencode "selector=#wikiArticle>dl:nth-child(7)>dd>table"
```
```json
{"title":"<table> - HTML | MDN","data":[["","black = \"#000000\"","","green = \"#008000\""],["","silver = \"#C0C0C0\"","","lime = \"#00FF00\""],["","gray = \"#808080\"","","olive = \"#808000\""],["","white = \"#FFFFFF\"","","yellow = \"#FFFF00\""],["","maroon = \"#800000\"","","navy = \"#000080\""],["","red = \"#FF0000\"","","blue = \"#0000FF\""],["","purple = \"#800080\"","","teal = \"#008080\""],["","fuchsia = \"#FF00FF\"","","aqua = \"#00FFFF\""]]}```
