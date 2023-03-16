import { test } from "@playwright/test";
import tracknet from "./tracknet.spec";
import ship24 from "./ship24.spec";
import mercadoLivre from "./mercado-livre.spec";
import * as fs from "fs/promises";
import aliExpress from "./aliexpress.spec";

export interface Products {
  title: string;
  code: string;
  time?: string;
  message?: string;
}

test("tracking", async ({ browser }) => {
  console.log("Esperando mercado livre");
  await mercadoLivre(browser);

  console.log("Esperando aliexpress");
  await aliExpress(browser);

  console.log("Lendo aliexpress.json");
  const aliexpressObjString = await fs.readFile("aliexpress.json", "utf8");
  const aliexpressProducts = JSON.parse(aliexpressObjString);

  console.log("Lendo mercado-livre.json");
  const mercadolivreObjString = await fs.readFile("mercado-livre.json", "utf8");
  const mercadolivreProducts = JSON.parse(mercadolivreObjString);

  const products = <Products[]>[...aliexpressProducts, ...mercadolivreProducts];

  const pageTracknet = await browser.newPage();
  await pageTracknet.bringToFront();
  console.log("Esperando tracknet");
  const trackingsTracknet = await tracknet(pageTracknet, products);

  const trackedInTracknet = trackingsTracknet.filter((track) => track.message);
  const notTracked: any = trackingsTracknet.filter((track) => !track.message);

  if (notTracked.length > 0) {
    console.log(
      `Códigos ${notTracked.map(
        (track) => track.code
      )} não foram encontrados no tracknet`
    );
    console.log("Esperando ship24");
    const pageShip24 = await browser.newPage();
    const trackingsShip24 = await ship24(pageShip24, notTracked);

    const trackings = [...trackedInTracknet, ...trackingsShip24];

    const data = JSON.stringify(trackings);
    await fs.writeFile("trackings.json", data);
    console.log("Rastreamentos salvos no trackings.json");

    return await browser.close();
  }

  const data = JSON.stringify(trackingsTracknet);
  await fs.writeFile("trackings.json", data);
  console.log("Rastreamentos salvos no trackings.json");

  await browser.close();
});
