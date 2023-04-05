import { Browser, BrowserContext, Page, test } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loginInGmail(page: Page, browser: Browser) {
  const context = await browser.newContext();

  await page.getByRole("textbox", { name: "Email or phone" }).click();
  await page
    .getByRole("textbox", { name: "Email or phone" })
    .fill(process.env.EMAIL as string);
  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForLoadState("domcontentloaded");
  await page.getByRole("textbox", { name: "Enter your password" }).click();
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill(process.env.PASSWORD as string);
  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForURL("https://mail.google.com/mail/u/0/#inbox");

  await context.close();
}

async function getEmails(selector: string, page: Page) {
  return await page.evaluate((selector: string) => {
    const emailsNode = [...document.querySelectorAll(selector)];
    return emailsNode.map((el) => ({
      email: el
        .querySelector("td:nth-of-type(4) div:nth-of-type(2) span > span")
        ?.getAttribute("data-hovercard-id"),
      content: el.querySelector("td:nth-of-type(5) div + span")?.textContent,
    }));
  }, selector);
}

async function getInboxEmails(page: Page) {
  return await getEmails(".Cp tbody > tr", page);
}

async function getSpamEmails(page: Page) {
  await page.goto("https://mail.google.com/mail/u/0/#spam");
  await delay(8000);

  return await getEmails("div[role=main] .Cp tbody > tr", page);
}

export const gmailVerificationCode = async function (
  browser: Browser,
  email: string,
  regex: RegExp
) {
  const page = await browser.newPage();

  const gmailURL =
    "https://accounts.google.com/AccountChooser/signinchooser?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&flowName=GlifWebSignIn&flowEntry=AccountChooser";

  await page.goto(gmailURL);

  await loginInGmail(page, browser);
  await delay(2000);
  const inboxEmails = await getInboxEmails(page);
  await delay(2000);
  const spamEmails = await getSpamEmails(page);

  const emails = [...inboxEmails, ...spamEmails];
  console.log(emails);
  const matches = emails.map(({ email: em, content }) => {
    if (email === em) {
      const match = regex.exec(content as string);

      if (match) {
        return match;
      }
    }
    return false;
  });
  console.log(matches);

  const verificationCode = matches.filter((match) => match !== false)[0][0];

  await page.close();

  return verificationCode;
};

export const gmailVerificationLink = async function (
  browser: Browser,
  email: string,
  regex: RegExp | string
) {
  const page = await browser.newPage();

  const gmailURL =
    "https://accounts.google.com/AccountChooser/signinchooser?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&flowName=GlifWebSignIn&flowEntry=AccountChooser";

  await page.goto(gmailURL);

  await loginInGmail(page, browser);
  const element = await page.$(`span[data-hovercard-id="${email}"]`);
  const parent = await element?.$("xpath=.. >> .. >> .. >> ..");

  await parent?.click();
  await delay(3000);

  const link = await page.evaluate((regex: RegExp | string) => {
    if (typeof regex === "string") {
      const href = document.querySelector(`a[href^="${regex}"]`);
      return href?.getAttribute("href");
    } else {
      const doc = document.querySelector('div[role="main"] table');
      return regex.exec(doc as any);
    }
  }, regex);

  await page.close();
  return link;
};
