import { test } from "@playwright/test";
import tracknet from "./tracknet.spec";
import ship24 from "./ship24.spec";
import mercadoLivre from "./mercado-livre.spec";
import * as fs from "fs/promises";
import { existsSync, unlinkSync } from "fs";
import { resolve } from 'path'
import aliExpress from "./aliexpress.spec";
import Excel from 'exceljs'
import * as dotenv from 'dotenv';
dotenv.config();

export interface Products {
  title: string;
  code: string;
  time?: string;
  message?: string;
}

function saveAsXSLX(content) {
  const DIR_SAVE = process.env.DIR_SAVE?.replace(/\\/g, '\\\\') as string
  const workbook = new Excel.Workbook();

  if (existsSync(DIR_SAVE)) {
    workbook.xlsx.readFile(DIR_SAVE).then(() => {
      const sheet = workbook.getWorksheet('Plan1')

      for (const track of content) {
        const row = sheet.addRow([track.title, track.code, track.time || "Não encontrado", track.message || 'Não encontrado', new Date().toLocaleString()])
        row.commit();
      }
      return workbook.xlsx.writeFile(DIR_SAVE);
    })
  } else {
    const sheet = workbook.addWorksheet('Plan1');

    sheet.getCell('A1').value = 'Nome';
    sheet.getCell('B1').value = 'Código';
    sheet.getCell('C1').value = 'Data do último status';
    sheet.getCell('D1').value = 'Último status';
    sheet.getCell('E1').value = 'Data do rastreamento';

    for (const track of content) {
      const row = sheet.addRow([track.title, track.code, track.time || "Não encontrado", track.message || 'Não encontrado', new Date().toLocaleString()])
      row.commit();
    }

    workbook.xlsx.writeFile(DIR_SAVE);
  }
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

  const aliFile = resolve('aliexpress.json')
  const mercadoFile = resolve('mercado-livre.json')

  if (existsSync(aliFile)) {
    unlinkSync(aliFile)
  }
  if (existsSync(mercadoFile)) {
    unlinkSync(mercadoFile)
  }

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
