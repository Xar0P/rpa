import { Browser, Page, test } from "@playwright/test";
import * as fs from "fs";

async function loading(page: Page) {
  const loader = page.locator(".comet-loading");
  const loader2 = await page.$("#gl-loading-layout");

  while ((await loader.count()) > 0) {}
  if (loader2) {
    while ((await loader2.getAttribute("style")) === "display: block;") {}
  }
}

export default async function aliExpress(browser: Browser) {
  const firefox = await browser
    .browserType()
    .launchPersistentContext(
      "C:\\Users\\Usuário\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\r047jqpt.default-default"
    );
  const page = await firefox.newPage();
  await page.goto("https://www.aliexpress.com/p/order/index.html");

  await page.locator(".comet-tabs-nav > div:nth-child(4)").click();

  await loading(page);

  const tagLinks = await page.$$("a[data-pl=order_item_header_detail]");
  const links = <string[]>[];
  for (const tagLink of tagLinks) {
    const link = await tagLink.getAttribute("href");
    links.push(link || "");
  }

  const codes = <any[]>[];

  for (const link of links) {
    if (link !== "") {
      await page.goto(link);
      await loading(page);
      const tagDesc = await page.$(".order-detail-item-track-info-desc");
      const desc = await tagDesc?.innerText();
      const tagTitle = await page.$(".item-title");
      const title = await tagTitle?.innerText();

      if (desc?.toLowerCase() !== "entregue") {
        const tagLink = await tagDesc?.$("xpath=.. >> ..");
        const linkToDetails = await tagLink?.getAttribute("href");

        if (linkToDetails) {
          await page.goto(`https:${linkToDetails}`);
          await loading(page);
          const tagCode = await page.$(".full-number > a");
          const code = await tagCode?.innerText();

          if (code) {
            console.log("Foi pego um código com sucesso");
            codes.push({ title, code });
          } else {
            console.log(`Não foi possivel pegar o código do produto ${title}`);
          }
        }
      }
    }
  }

  const data = JSON.stringify(codes);
  fs.writeFileSync("aliexpress.json", data);
  console.log("Encomendas salvas no aliexpress.json");

  await firefox.close();
}
