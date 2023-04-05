import { Browser, Page, test } from "@playwright/test";
import { gmailVerificationCode } from "./gmail.spec";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setEmail(page: Page) {
  const emailInput = page.locator("#J-accName");
  await emailInput.click();
  await emailInput.fill("pietroricardoor@gmail.com");

  const draggable: any = await page.$(".nc_scale");
  const bbox = await draggable.boundingBox();
  const mouse = page.mouse;
  await mouse.move(bbox.x, bbox.y + bbox.height / 2);
  await mouse.down();
  await mouse.move(bbox.x + bbox.width, bbox.y + bbox.height / 2);
  await mouse.up();

  await page.waitForSelector("#submitBtn:enabled");
  await page.locator("#submitBtn:enabled").click();
}

async function setCodes(page: Page, browser: Browser) {
  const frame = page.frameLocator('iframe[name="iframe1"]');
  await frame.locator("#content > div > ol > li:nth-child(1) > a").click();

  if (await frame.locator("#J_GetCode_Email").isEnabled()) {
    await frame.locator("#J_GetCode_Email").click();
  }

  await delay(10000);

  try {
    var verificationCode = await gmailVerificationCode(
      browser,
      "service@notice.alibaba.com",
      /\d{6}/g
    );
  } catch (error) {
    throw new Error("Erro na obtenção do código de verificação");
  }

  console.log(verificationCode);
  await frame.getByPlaceholder("6 digits").click();
  await frame.getByPlaceholder("6 digits").fill(verificationCode);

  await frame.getByRole("button", { name: "Submit" }).click();
}

async function changePassword(page: Page) {
  await page.locator("#newPwd").click();
  await page.locator("#newPwd").fill("Senhateste@123");
  await page.locator("#newPwdConfirm").click();
  await page.locator("#newPwdConfirm").fill("Senhateste@123");
  await page.getByRole("button", { name: "Submit" }).click();
}

test("alibaba", async ({ page, browser }) => {
  const alibabaURL =
    "https://passport.alibaba.com/ac/password_find.htm?fromSite=4&lang=en_US&call_back_url=https%3A%2F%2Fpassport.alibaba.com%2Ficbu_login.htm";

  await page.goto(alibabaURL);

  await setEmail(page);
  await setCodes(page, browser);
  await changePassword(page);

  await page.pause();
});
