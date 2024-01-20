const fs = require("fs");
const http = require("http");
const url = require("url");
const replaceTemplate = require("./modules/replaceTemplate");

/////////////////////////////////
// FILES

// const readFile = fs.readFileSync("./txt/read-this.txt", "utf-8");
// console.log(readFile);

// const writeFile = fs.writeFileSync("./txt/input.txt", "this part is added");
// console.log(writeFile);

/////////////////////////////////
// SERVER
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, "utf-8");
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8");
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, "utf-8");

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
//FIXME: after parsing we can use it as javascript object or array
const dataArr = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });
    // TODO: join("") have to use for removing extra space
    const cardsHtml = dataArr.map((el) => replaceTemplate(tempCard, el)).join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    // product page
  } else if (pathname === "/product") {
    const product = dataArr[query.id];
    res.writeHead(200, { "Content-type": "text/html" });
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // api page
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // not found page
  } else {
    res.writeHead(404);
    res.end("Hello, route not found");
  }
});

server.listen(5000, () => {
  console.log(`Server is running at http://localhost:5000`);
});

// =========end=============
