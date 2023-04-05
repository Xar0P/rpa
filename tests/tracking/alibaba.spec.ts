import { test } from "@playwright/test";
import { execSync } from "child_process";
import * as dotenv from 'dotenv';
dotenv.config();

test("alibaba", async ({ page }) => {
  await page.goto('https://passport.alibaba.com/icbu_login.htm?spm=a2700.product_home_l0.scGlobalHomeHeader.384.145b2fc4FpUDFz&tracelog=hd_signin&return_url=https%3A%2F%2Fportuguese.alibaba.com%2F');

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

    await page1.getByRole('textbox', { name: 'Inserir código' }).fill(totp.gen(account.login.totp, { time: 30 }));
    await page1.getByRole('button', { name: 'Próxima' }).click();
  } catch (error) {
    console.log(error);
    console.error('Deu erro na autenticação do bitwarden, é necessário você mesmo logar no aliexpress!');
    await page.pause();
    return;
  }



  // await page1.close();
  // await page.goto('https://portuguese.alibaba.com/');
  await page.pause();

  await page.close();
});
