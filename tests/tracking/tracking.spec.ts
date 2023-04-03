import { test } from "@playwright/test";
import tracknet from "./tracknet.spec";
import ship24 from "./ship24.spec";
import mercadoLivre from "./mercado-livre.spec";
import * as fs from "fs/promises";
import aliExpress from "./aliexpress.spec";
import xlsx from "json-as-xlsx"

export interface Products {
  title: string;
  code: string;
  time?: string;
  message?: string;
}

function saveAsXSLX(content) {
  const data = [
    {
      sheet: "Rastreamento",
      columns: [
        { label: "Titulo", value: "title" },
        { label: "Código", value: "code" },
        { label: "Horário", value: (row) => row.time || 'Não encontrado' },
        { label: "Mensagem", value: (row) => row.message || 'Não encontrado' },
      ],
      content,
    }
  ]

  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}_${today.toLocaleTimeString().replace(/:/g, ".")}`

  const settings = {
    fileName: `G:\\.shortcut-targets-by-id\\1-lkork0_DFuhDI-Ened3syey2-51Qeha\\ETCETERA GERAL\\Rastreamentos\\Rastreios_${date}`,
    extraLength: 3,
    writeMode: "WriteFile",
    RTL: true,
  }

  xlsx(data, settings);

  return date;
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

    const utcString = saveAsXSLX(handleTrackings(trackings));
    console.log(`Rastreamentos salvos no Rastreamentos ${utcString}.xlsx`);

    return await browser.close();
  }

  const utcString = saveAsXSLX(handleTrackings(trackingsTracknet));
  console.log(`Rastreamentos salvos no Rastreamentos ${utcString}.xlsx`);

  await browser.close();
});
