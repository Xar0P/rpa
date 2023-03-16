import { expect, Page, test } from "@playwright/test";
import { Products } from "./tracking.spec";

async function setCodes(page: Page, products: Products[]) {
  await page.getByPlaceholder("Enter tracking numbers").click();

  for (let i = 0; i < products.length; i++) {
    await page
      .getByPlaceholder("Enter tracking numbers")
      .fill(products[i].code);
    await page.getByRole("textbox").press("Space");
  }

  await page.getByRole("button", { name: "submit search TN" }).click();
}

export default async function ship24(page: Page, products: Products[]) {
  const ship24URL = "https://www.ship24.com/";
  await page.goto(ship24URL);

  await setCodes(page, products);

  await page.waitForSelector("app-loading-indicator");
  const loader = page.locator("app-loading-indicator");

  console.log("Carregando...");
  while ((await loader.count()) > 0) {}
  console.log("Parou de carregar");

  const trackings = await page.evaluate(() => {
    const tksDoc = [...document.querySelectorAll("user-parcel-card")];

    const tks = tksDoc.map((tracking) => {
      const elTitle = tracking.querySelector("h3 span");
      const code = elTitle?.textContent?.trim();

      const elTime = tracking.querySelector("app-user-first-event p");
      const time = elTime?.textContent?.trim();

      const elMessage = tracking.querySelector("app-user-transit-bar i + div");
      const message = elMessage?.textContent?.trim();

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

  await page.close();
  return trackings;
}
