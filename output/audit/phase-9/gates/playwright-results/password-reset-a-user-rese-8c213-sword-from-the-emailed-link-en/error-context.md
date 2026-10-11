# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: password-reset.spec.ts >> a user resets a forgotten password from the emailed link
- Location: e2e/password-reset.spec.ts:4:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('a reset link is on its way')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('a reset link is on its way') with timeout 5000ms
  - waiting for getByText('a reset link is on its way')

```

```yaml
- banner:
  - text: GlowDesk
  - button "العربية"
- main:
  - heading "Reset your password" [level=1]
  - paragraph: Enter the email you sign in with and we'll send you a link to choose a new password.
  - alert: We can't reach the server. Check your connection and try again.
  - text: Email
  - textbox "Email": reset-en@spacorner.test
  - button "Send reset link"
  - link "Back to sign in":
    - /url: /login
- status
- alert
```

# Test source

```ts
  1  | import { expect, expectDocumentLocale, signIn, signOut, test } from "./fixtures";
  2  | import { deleteMail, waitForAuthLink } from "./mailpit";
  3  | 
  4  | test("a user resets a forgotten password from the emailed link", async ({ page, request, s, appLocale }) => {
  5  |   // One user per language so the two projects can run in parallel.
  6  |   const email = `reset-${appLocale}@spacorner.test`;
  7  |   const newPassword = `Glow-${Date.now()}`;
  8  |   await deleteMail(request, email);
  9  | 
  10 |   await page.goto("/login");
  11 |   await page.getByRole("link", { name: s.forgotLink }).click();
  12 |   await expect(page).toHaveURL(/\/forgot-password$/);
  13 |   await page.getByLabel(s.email).fill(email);
  14 |   await page.getByRole("button", { name: s.sendResetLink }).click();
> 15 |   await expect(page.getByText(s.resetSent)).toBeVisible();
     |                                             ^ Error: expect(locator).toBeVisible() failed
  16 | 
  17 |   const link = await waitForAuthLink(request, email);
  18 |   await page.goto(link);
  19 | 
  20 |   await expect(page).toHaveURL(/\/reset-password/);
  21 |   await expectDocumentLocale(page, s);
  22 |   await page.getByLabel(s.newPassword, { exact: true }).fill(newPassword);
  23 |   await page.getByLabel(s.confirmPassword, { exact: true }).fill(newPassword);
  24 |   await page.getByRole("button", { name: s.savePassword }).click();
  25 | 
  26 |   await expect(page).toHaveURL(/\/\?branch=[\w-]+$/);
  27 |   await signOut(page, s);
  28 | 
  29 |   await signIn(page, s, email, newPassword);
  30 |   await expect(page).toHaveURL(/\/\?branch=[\w-]+$/);
  31 | });
  32 | 
```