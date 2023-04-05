import { Browser, Page, test } from "@playwright/test";
import { gmailVerificationCode } from "./gmail.spec";

async function verifyCode(page: Page, browser: Browser) {
  const context = await browser.newContext();

  const iframe = page.frameLocator("#root iframe");
  await page
    .frameLocator("#root iframe")
    .getByRole("button", { name: "Get code" })
    .click();

  // Pegar o código no email
  const regex = /(\d{6})(?=.*AliExpress Team$)/g;
  const verificationCode = await gmailVerificationCode(
    browser,
    "account@notice.aliexpress.com",
    regex
  );

  await page.bringToFront();

  await iframe.locator(".verify-code-input").first().click();
  await iframe.locator(".verify-code-input").first().fill(verificationCode[0]);
  await iframe.locator("input:nth-child(2)").fill(verificationCode[1]);
  await iframe.locator("input:nth-child(3)").fill(verificationCode[2]);
  await iframe.locator("input:nth-child(4)").fill(verificationCode[3]);
  await iframe.locator("input:nth-child(5)").fill(verificationCode[4]);
  await iframe.locator("input:nth-child(6)").fill(verificationCode[5]);

  await iframe.getByRole("button", { name: "Verify" }).click();

  await context.close();
}

async function updatePassword(page: Page) {
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill("Stokcarro@1");
  await page.locator('input[name="repeatPassword"]').click();
  await page.locator('input[name="repeatPassword"]').fill("Stokcarro@1");

  await page.waitForSelector("#root button:enabled");
  await page.locator("#root button:enabled").click();
}

async function selectEmail(page: Page) {
  await page.locator("#root").getByRole("textbox").click();
  await page
    .locator("#root")
    .getByRole("textbox")
    .fill("pietroricardoor@gmail.com");
  await page.waitForSelector("#root button:enabled");
  await page.locator("#root button").click();
}

test("aliexpress", async ({ page, browser }) => {
  const aliexpressURL =
    "https://www.aliexpress.com/p/account-center/find-password.html";

  await page.goto(aliexpressURL);

  await selectEmail(page);
  await verifyCode(page, browser);
  await updatePassword(page);

  await page.pause();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.close();
});
