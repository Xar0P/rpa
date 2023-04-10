import { test } from "@playwright/test";
import tracknet from "./tracknet.spec";
import ship24 from "./ship24.spec";
import mercadoLivre from "./mercado-livre.spec";
import * as fs from "fs/promises";
import aliExpress from "./aliexpress.spec";
import Excel from 'exceljs'

export interface Products {
  title: string;
  code: string;
  time?: string;
  message?: string;
}

function saveAsXSLX(content) {
  const googleDriveUrl = 'G:\\.shortcut-targets-by-id\\1-lkork0_DFuhDI-Ened3syey2-51Qeha\\ETCETERA GERAL\\Rastreamentos\\Rastreios.xlsx'

  const workbook = new Excel.Workbook();

  workbook.xlsx.readFile(googleDriveUrl).then(() => {
    const sheet = workbook.getWorksheet('Rastreamento')

    for (const track of content) {
      const row = sheet.addRow([track.title, track.code, track.time || "Não encontrado", track.message || 'Não encontrado', new Date().toLocaleString()])
      row.commit();
    }
    return workbook.xlsx.writeFile(googleDriveUrl);
  })
}

function handleTrackings(trackings) {
  return trackings.map((tracking) => {
    if (tracking.message) {
      return tracking;
    }

    return {
      title: tracking.title,
      code: tracking.code,
      message: '',
      time: ''
    }
  })
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

    saveAsXSLX(handleTrackings(trackings));
    console.log(`Rastreios salvos no Rastreios.xlsx`);

    return await browser.close();
  }

  saveAsXSLX(handleTrackings(trackingsTracknet));
  console.log(`Rastreios salvos no Rastreios.xlsx`);

  await browser.close();
});
