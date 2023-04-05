import { Browser, Page, test } from "@playwright/test";
import { gmailVerificationLink } from "./gmail.spec";

test("bling", async ({ page, browser }) => {
  const blingURL = "https://www.bling.com.br/b/redefinir-senha";

  await page.goto(blingURL);

  // await page.getByLabel('Seu e-mail de acesso').click();
  // await page.getByLabel('Seu e-mail de acesso').fill('pietroricardoor@gmail.com');
  // await page.getByRole('button', { name: 'ENVIAR' }).click();

  // Depois de pegar o link
  const link = await gmailVerificationLink(
    browser,
    "do-not-reply@bling.com.br",
    "https://www.bling.com.br/b/redefinir-senha?"
  );
  console.log(link);

  // await page.goto(link);

  // await page.getByLabel('Nova senha de acesso').click();
  // await page.getByLabel('Nova senha de acesso').fill('Stokcarro@12');
  // await page.getByLabel('Confirme sua senha de acesso').click();
  // await page.getByLabel('Confirme sua senha de acesso').fill('Stokcarro@12');
  // await page.getByRole('button', { name: 'ENVIAR' }).click();

  await page.pause();
});
