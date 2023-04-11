import { ElementHandle, Page, test } from "@playwright/test";
import { execSync } from "child_process";
import * as dotenv from 'dotenv';
dotenv.config();

async function login(page: Page) {
  try {
    console.log('Aguardando bitwarden');
    const stringAccount = execSync(`bw get item ${process.env.GOOGLE_ID} --session ${process.env.SESSION}`).toString();
    const account = JSON.parse(stringAccount);

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'sign in with google' }).click();
    const page1 = await page1Promise;
    await page1.getByRole('textbox', { name: 'E-mail ou telefone' }).click();
    await page1.getByRole('textbox', { name: 'E-mail ou telefone' }).fill(account.login.username);
    await page1.getByRole('button', { name: 'Próxima' }).click();
    await page1.getByRole('textbox', { name: 'Digite sua senha' }).click();
    await page1.getByRole('textbox', { name: 'Digite sua senha' }).fill(account.login.password);
    await page1.getByRole('button', { name: 'Próxima' }).click();
    await page1.getByRole('link', { name: 'Receber um código de verificação do app Google Authenticator' }).click();

    // await page1.getByRole('textbox', { name: 'Inserir código' }).fill(totp.gen(account.login.totp, { time: 30 }));
    await page1.getByRole('button', { name: 'Próxima' }).click();
  } catch (error) {
    console.log(error);
    console.error('Deu erro na autenticação do bitwarden, é necessário você mesmo logar no aliexpress!');
    await page.pause();
    return;
  }
}

test("alibaba", async ({ browser }) => {
  const firefox = await browser
    .browserType()
    .launchPersistentContext(
      process.env.PROFILE as string
    );
  const page = await firefox.newPage();
  await page.goto('https://biz.alibaba.com/ta/list/scene/mainList.htm');

  const authPromise = page.waitForEvent('popup');
  await page.locator("a.icon-google").click();
  const auth = await authPromise;

  auth.on('load', async () => {
    const email = auth.locator('#identifierId')

    console.log(await email.count())
    if ((await email.count()) > 0) {
      console.log('Tem que logar')
    } else {
      console.log('Já esta logado')
    }
  })

  const links = <any[]>[]

  page.on('load', async () => {
    await page.waitForSelector('.list-body > div')
    const ordersNotFiltered = await page.$$('.list-body > div')

    for (const el of ordersNotFiltered) {
      const status = await el.$('.order-status');
      const textStatus = await status?.innerText();

      if (textStatus?.includes('Order completed')) {
        const trackingEl = await status?.$('a');
        const url = await trackingEl?.getAttribute('href');
        if (url) {
          links.push(`https:${url}`);
        }
      }
    }
    console.log(links);

    for (const link of links) {
      await page.goto(link);

      page.on('load', async () => {
        page.pause();
      })
    }
  })


  await page.pause();

  await page.close();
});
