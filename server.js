const puppeteer = require("puppeteer");

const url = "https://www.mercadolivre.com.br";
const searchFor = "macbook";

let c = 1;
const list = [];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  console.log("Iniciei");

  await page.goto(url);
  console.log("Fui para a URL!");

  await page.waitForSelector("#cb1-edit");
  await page.type("#cb1-edit", searchFor);

  await Promise.all([page.waitForNavigation(), page.click(".nav-search-btn")]);

  const links = await page.$$eval(".poly-component__link", (elements) =>
    elements.map((link) => link.href)
  );

  for (const link of links) {
    if (c === 10) continue;
    console.log("Página", c);
    await page.goto(link);
    await page.waitForSelector(".ui-pdp-title");

    const title = await page.$eval(
      ".ui-pdp-title",
      (element) => element.innerText
    );
    const price = await page.$eval(
      ".andes-money-amount__fraction",
      (element) => element.innerText
    );

    const seller = await page.evaluate(() => {
      const el = document.querySelector(
        ".ui-pdp-seller__label-sold .line-break"
      );
      if (!el) return null;
      return el.innerText;
    });

    const obj = {};
    obj.title = title;
    obj.price = price;
    seller ? (obj.seller = seller) : "";
    obj.link = link;

    list.push(obj);

    c++;
  }

  console.log(list);

  await browser.close();
})();
