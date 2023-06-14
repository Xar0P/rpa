import { Browser, ElementHandle, Page, test } from "@playwright/test";
import * as fs from "fs";
import * as dotenv from 'dotenv';
dotenv.config();

interface Shipping {
  title: string | undefined;
  message: string | undefined;
  time: string | undefined;
  code: string | undefined;
}

async function verifyIfIsLogged(page: Page) {

  const isLogged = await page.locator('#user_id').count();
  if (isLogged > 0) {
    console.log('É necessário logar no mercado livre'); // Tentar fazer algo para pegar os cookies dele dps
    await login(page);
  }
}

async function login(page: Page) {
  try {
    console.log('Tentando logar no mercado livre');
    await page.getByTestId('user_id').click();
    await page.getByTestId('user_id').fill(process.env.ML_LOGIN as string);
    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByTestId('password').dblclick();
    await page.keyboard.type(process.env.ML_PASS as string);

    await page.getByTestId('action-complete').click();
  } catch (error) {
    console.error('Ocorreu algum erro, é necessário você mesmo logar no mercado livre!');
    await page.goto(
      "https://myaccount.mercadolivre.com.br/my_purchases/list#nav-header"
    );
    await page.pause();
    return;
  }
}

async function getLinkOfProducts(
  products: ElementHandle<SVGElement | HTMLElement>[]
) {
  const links = <string[]>[];

  for (const el of products) {
    const elem: any = await el.$("xpath=.. >> .. >> ..");
    const tagLink = await elem?.$("div.bf-ui-button-container a");
    const link = await tagLink?.getAttribute("href");

    if (link) {
      links.push(link);
    }
  }

  return links;
}

async function getProducts(page: Page) {
  const shoppingIntro = await page.$$(".list-item__intro");

  const filteredShoppingIntro = <ElementHandle<SVGElement | HTMLElement>[]>[];

  for (const el of shoppingIntro) {
    const status = await el.innerText();
    if (status === "A caminho") {
      filteredShoppingIntro.push(el);
    }
  }

  return filteredShoppingIntro;
}

async function getDetails(page: Page, link: string) {
  await page.goto(link);
  await page.waitForSelector(".detail-container h4 > span");

  const spanTitle = await page.$(".main-container h4 > span");
  const title = await spanTitle?.innerText();

  const spanShopCode = await page.$(".detail-container h4 > span");
  const dirtyShopCode = await spanShopCode?.innerText();
  let shopCode = "";

  if (dirtyShopCode) {
    shopCode = dirtyShopCode.split(" ").pop() as string;
  }

  return { title, shopCode };
}

async function getMoreDetails(
  page: Page,
  shippings: Shipping[],
  shopCode: string,
  title: string | undefined
) {
  await page.locator(".andes-button--quiet").click();

  await page.waitForSelector(".bf-ui-status-row--active");
  const shippingStatus = await page.$(".bf-ui-status-row--active");

  const spanMessage = await shippingStatus?.$(
    ".bf-ui-status-row__registry-text > span:first-of-type"
  );
  const message = await spanMessage?.innerText();
  const spanTime = await shippingStatus?.$(
    ".bf-ui-status-row__registry-text > span:last-of-type"
  );
  const time = await spanTime?.innerText();

  const tagLink = await page.$(".tracking-url");
  const code = await tagLink?.innerText();

  shippings.push({
    title: title,
    message,
    time,
    code: code?.trim() || shopCode,
  });
}

export default async function mercadoLivre(browser: Browser) {
  const firefox = await browser
    .browserType()
    .launchPersistentContext(
      process.env.PROFILE as string
    );

  const page = await firefox.newPage();
  await page.goto(
    "https://myaccount.mercadolivre.com.br/my_purchases/list#nav-header"
  );

  await verifyIfIsLogged(page);

  const products = await getProducts(page);
  const links = await getLinkOfProducts(products);
  const shippings = <Shipping[]>[];

  for (const link of links) {
    const { title, shopCode } = await getDetails(page, link);
    await getMoreDetails(page, shippings, shopCode, title);
  }

  const data = JSON.stringify(shippings);
  fs.writeFileSync("mercado-livre.json", data);
  console.log("Encomendas salvas no mercado-livre.json");

  await firefox.close();
}
