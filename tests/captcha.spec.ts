import { Browser, Page, test } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function speechToText(url: string) {
  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY,
      "content-type": "application/json",
      "transfer-encoding": "chunked",
    },
  });

  try {
    const res = await assembly.post("/transcript", {
      audio_url: url,
    });
    const { id } = res.data;

    await delay(15000);

    const { data } = await assembly.get(`/transcript/${id}`);
    return data.text;
  } catch (error) {
    console.error(error);
  }
}

async function audioChallenge(page: Page, browser: Browser) {
  const context = await browser.newContext();

  const iframe = page.frameLocator(".g-recaptcha-bubble-arrow + div > iframe");
  await iframe.getByRole("button", { name: "Get an audio challenge" }).click();
  await delay(2000);

  if (
    await iframe
      .getByRole("link", { name: "Alternatively, download audio as MP3" })
      .isVisible()
  ) {
    const captchaPagePromise = page.waitForEvent("popup");
    await iframe
      .getByRole("link", { name: "Alternatively, download audio as MP3" })
      .click();
    const audioPage = await captchaPagePromise;
    const url = audioPage.url();
    await audioPage.close();

    const text = await speechToText(url);

    await iframe.getByRole("textbox", { name: "Enter what you hear" }).click();
    await iframe
      .getByRole("textbox", { name: "Enter what you hear" })
      .fill(text);
    await iframe.getByRole("button", { name: "Verify" }).click();

    await page.pause();
    await context.close();
  } else {
    await context.close();

    await page.reload();
    await page
      .frameLocator('iframe[title="reCAPTCHA"]')
      .getByRole("checkbox", { name: "I'm not a robot" })
      .click();

    // User Handling
    await page.pause();
  }
}

test("captcha", async ({ page, browser }) => {
  await page.goto("https://www.google.com/recaptcha/api2/demo"); // https://www.google.com/recaptcha/api2/demo
  //https://financeiro.hostgator.com.br/
  await page.pause();
  const context = await browser.newContext();

  const iframe = page.frameLocator('iframe[title="reCAPTCHA"]');
  await iframe.getByRole("checkbox", { name: "I'm not a robot" }).click();

  await delay(2000);

  if (
    (await iframe.locator("#recaptcha-anchor").getAttribute("aria-checked")) ===
    "true"
  ) {
    // Retornar aqui
    await page.pause();
  } else {
    await audioChallenge(page, browser);
  }

  // Na real, ele tinha que parar aqui
  if (
    (await iframe.locator("#recaptcha-anchor").getAttribute("aria-checked")) ===
    "true"
  ) {
    await page.pause();
  }

  await page.pause();
  await context.close();
  // Retornar aqui caso de tudo errado
});
