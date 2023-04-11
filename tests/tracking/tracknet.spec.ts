import { Page, test } from "@playwright/test";
import { Products } from "./tracking.spec";

async function loading(page: Page) {
  const loader = page.locator(".animsition-loading");
  console.log("Carregando...");
  while ((await loader.count()) > 0) { }
  console.log("Carregamento finalizado");
}

async function setCodes(page: Page, products: Products[]) {
  await page.locator("pre").nth(1).click();

  for (let i = 0; i < products.length; i++) {
    if (!products[i].code.includes("#")) {
      await page.getByRole("textbox").fill(products[i].code);
      await page.getByRole("textbox").press("Enter");
    }
  }

  await page.locator(".yq-tools-big button").click();
}

async function getShippings(page: Page, products: Products[]) {
  await loading(page);
  await page.getByRole("link", { name: "" }).click();
  await loading(page);

  await page.waitForSelector(".tracklist-tracking");
  let trackings = await page.evaluate(() => {
    const tksDoc = [...document.querySelectorAll(".tracklist-tracking")];

    const tks = tksDoc.map((tracking) => {
      const elTitle = tracking.querySelector(".no-container span") as Element;
      const code = elTitle.getAttribute("title");

      const elTime = tracking.querySelector(".yqcr-last-event-pc time");
      const time = elTime?.textContent || elTime?.getAttribute("data-newtime");

      const elMessage = tracking.querySelector(".yqcr-last-event-pc span");
      const message = elMessage?.textContent;

      return { title: "", code, time, message };
    });

    return tks;
  });

  trackings.map((tk) => {
    products.forEach((prod) => {
      if (prod.code === tk.code) {
        tk.title = prod.title;
      }
    });
  });

  const mercadoLivreTrackings: any = products.filter((tracking) =>
    tracking.code.includes("#")
  );
  trackings = [...trackings, ...mercadoLivreTrackings];

  return trackings;
}

export default async function tracknet(page: Page, products: Products[]) {
  const tracknetURL = "https://www.17track.net/";
  await page.goto(tracknetURL);

  await setCodes(page, products);
  const trackings = await getShippings(page, products);

  await page.close();
  return trackings;
}
