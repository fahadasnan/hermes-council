# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: online-payments.spec.ts >> the owner connects MyFatoorah: checklist, write-only keys, approvals, turn on, pause and disconnect
- Location: e2e/online-payments.spec.ts:11:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('MyFatoorah keys saved. Run a key test to check them.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('MyFatoorah keys saved. Run a key test to check them.') with timeout 5000ms
  - waiting for getByText('MyFatoorah keys saved. Run a key test to check them.')

```

```yaml
- link "Skip to main content":
  - /url: "#main"
- complementary:
  - navigation "Main":
    - list:
      - listitem:
        - link "Home":
          - /url: /?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "My day":
          - /url: /my-day?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Calendar":
          - /url: /calendar?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Clients":
          - /url: /clients?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Team":
          - /url: /team?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Catalogue":
          - /url: /catalogue?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Sales":
          - /url: /sales?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Reports":
          - /url: /reports?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Messages":
          - /url: /messages?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Activity":
          - /url: /audit?branch=59b37351-714b-4bb6-b914-3520857d5f41
      - listitem:
        - link "Settings":
          - /url: /settings?branch=59b37351-714b-4bb6-b914-3520857d5f41
- banner:
  - paragraph: Checkout pay-en-mv7zwj2qixee
  - text: Owner
  - group "Branch (locked)":
    - paragraph: Main pay-en-mv7zwj2qixee
  - group "Cash register":
    - text: Register closed
    - button "Open register"
  - button "Search clients, appointments and sales": Search Ctrl K
  - button "العربية"
  - button "owner-pay-en-mv7zwj2qixee@checkout.test"
- main:
  - link "Back to settings":
    - /url: /settings?branch=59b37351-714b-4bb6-b914-3520857d5f41
  - heading "Online payments" [level=1]
  - paragraph: Clients pay online into your own merchant accounts with MyFatoorah and Tap, and each provider pays out to your bank account. GlowDesk never holds the money. Each branch then chooses which of your active providers it uses.
  - link "Payment reconciliation":
    - /url: /settings/online-payments/reconciliation?branch=59b37351-714b-4bb6-b914-3520857d5f41
  - region "MyFatoorah":
    - heading "MyFatoorah" [level=2]
    - text: Not connected
    - paragraph: Apply for a merchant account with MyFatoorah, follow the setup checklist below, then paste the keys MyFatoorah gives you. Review time is between you and MyFatoorah.
    - alert: Something went wrong. Try again.
    - heading "Setup checklist" [level=3]
    - list:
      - listitem:
        - checkbox "Business documents"
        - text: Business documents Your commercial registration (licence) and the civil ID of the person who signs for the business, as the provider asks for them.
      - listitem:
        - checkbox "Bank account" [checked]
        - text: Bank account An IBAN in the business's own name. Payouts go there, never to GlowDesk. Done Oct 14, 2026.
      - listitem:
        - checkbox "Application sent"
        - text: Application sent You applied for a merchant account with the provider. Review time is between you and the provider.
      - listitem:
        - checkbox "Features requested"
        - text: Features requested Ask the provider to switch on the features listed under "Approved features".
      - listitem:
        - checkbox "Account approved"
        - text: Account approved The provider approved your merchant account.
      - listitem:
        - checkbox "Features approved"
        - text: Features approved Tick each feature the provider has confirmed in writing under "Approved features". GlowDesk uses only these.
      - listitem:
        - text: Test keys entered Not yet
        - paragraph: Paste the provider's test (sandbox) keys below. They are encrypted and can't be read back, even by you.
      - listitem:
        - text: Payment notifications Not yet
        - paragraph: Turn on Webhook V2 with a secret key in your MyFatoorah portal and paste the secret with your keys.
      - listitem:
        - text: Test passed Checked by GlowDesk
        - paragraph: "Checked by GlowDesk: a test payment and refund went through."
      - listitem:
        - text: Live keys entered Not yet
        - paragraph: Paste the live keys (and, for MyFatoorah, the live webhook secret).
      - listitem:
        - text: Go live Checked by GlowDesk
        - paragraph: "Checked by GlowDesk: a smallest-amount live payment and its refund went through."
    - group "Approved features":
      - text: Approved features
      - paragraph: Tick only what MyFatoorah has confirmed in writing for your account. GlowDesk uses only these features.
      - paragraph: Saved cards aren't offered on MyFatoorah. A no-show fee beyond the deposit goes out as a payment link.
      - checkbox "KNET"
      - text: KNET
      - checkbox "Visa and Mastercard"
      - text: Visa and Mastercard
      - checkbox "Authorize, then capture card payments"
      - text: Authorize, then capture card payments
      - checkbox "Refunds from GlowDesk"
      - text: Refunds from GlowDesk
      - checkbox "KNET refunds from GlowDesk"
      - text: KNET refunds from GlowDesk
    - button "Save approved features" [disabled]
    - heading "API keys" [level=3]
    - paragraph: Keys are encrypted when you save them and can't be shown again, even to you. To change them, paste new ones.
    - paragraph: Keys for
    - radiogroup "Keys for":
      - radio "Test mode" [checked]
      - radio "Live"
    - text: MyFatoorah account country
    - combobox "MyFatoorah account country":
      - option "Kuwait" [selected]
      - option "Bahrain"
      - option "Oman"
      - option "Saudi Arabia"
      - option "United Arab Emirates"
      - option "Qatar"
    - text: API token
    - textbox "API token": e2e-token-26daf50d-9e3c-454d-b042-0a47dccf6716
    - text: From the API key page of your MyFatoorah portal (the demo portal for test mode). Webhook V2 secret key
    - textbox "Webhook V2 secret key": e2e-hook-577d941f-7f36-42cf-8b2d-7ed447630219
    - text: In your MyFatoorah portal, turn on Webhook V2 with a secret key and paste it here. The webhook address is sent with every payment, so there's nothing else to set.
    - button "Save keys"
  - region "Tap":
    - heading "Tap" [level=2]
    - text: Not connected
    - paragraph: Apply for a merchant account with Tap, follow the setup checklist below, then paste the keys Tap gives you. Review time is between you and Tap.
    - heading "Setup checklist" [level=3]
    - list:
      - listitem:
        - checkbox "Business documents"
        - text: Business documents Your commercial registration (licence) and the civil ID of the person who signs for the business, as the provider asks for them.
      - listitem:
        - checkbox "Bank account"
        - text: Bank account An IBAN in the business's own name. Payouts go there, never to GlowDesk.
      - listitem:
        - checkbox "Application sent"
        - text: Application sent You applied for a merchant account with the provider. Review time is between you and the provider.
      - listitem:
        - checkbox "Features requested"
        - text: Features requested Ask the provider to switch on the features listed under "Approved features".
      - listitem:
        - checkbox "Account approved"
        - text: Account approved The provider approved your merchant account.
      - listitem:
        - checkbox "Features approved"
        - text: Features approved Tick each feature the provider has confirmed in writing under "Approved features". GlowDesk uses only these.
      - listitem:
        - text: Test keys entered Not yet
        - paragraph: Paste the provider's test (sandbox) keys below. They are encrypted and can't be read back, even by you.
      - listitem:
        - text: Payment notifications Not yet
        - paragraph: "Nothing to do: your Tap secret key signs its payment notifications."
      - listitem:
        - text: Test passed Checked by GlowDesk
        - paragraph: "Checked by GlowDesk: a test payment and refund went through."
      - listitem:
        - text: Live keys entered Not yet
        - paragraph: Paste the live keys (and, for MyFatoorah, the live webhook secret).
      - listitem:
        - text: Go live Checked by GlowDesk
        - paragraph: "Checked by GlowDesk: a smallest-amount live payment and its refund went through."
    - group "Approved features":
      - text: Approved features
      - paragraph: Tick only what Tap has confirmed in writing for your account. GlowDesk uses only these features.
      - checkbox "KNET"
      - text: KNET
      - checkbox "Visa and Mastercard"
      - text: Visa and Mastercard
      - checkbox "Authorize, then capture card payments"
      - text: Authorize, then capture card payments
      - checkbox "Saved cards"
      - text: Saved cards
      - checkbox "Charging a saved card without the client"
      - text: Charging a saved card without the client
      - checkbox "Refunds from GlowDesk"
      - text: Refunds from GlowDesk
      - checkbox "KNET refunds from GlowDesk"
      - text: KNET refunds from GlowDesk
    - button "Save approved features" [disabled]
    - heading "API keys" [level=3]
    - paragraph: Keys are encrypted when you save them and can't be shown again, even to you. To change them, paste new ones.
    - paragraph: Keys for
    - radiogroup "Keys for":
      - radio "Test mode" [checked]
      - radio "Live"
    - text: Secret key
    - textbox "Secret key"
    - text: "From your Tap dashboard: it starts with sk_test_ in test mode and sk_live_ when live."
    - button "Save keys"
- status
- alert
```

# Test source

```ts
  1   | import { addMember, freshShop } from "./checkoutFixtures";
  2   | import { expect, signIn, signOut, test } from "./fixtures";
  3   | import { recordPassingTest, storedConnection } from "./paymentFixtures";
  4   | 
  5   | // 10.2-T4: Settings → Online payments. The owner connects the shop's own
  6   | // MyFatoorah merchant from the screen. The key test calls the provider, which
  7   | // no e2e run does: the passing test is recorded through the same service-role
  8   | // RPC the payments function uses (the function's tests cover the call).
  9   | // The keys are made up here and must never come back in a response or the page.
  10  | 
  11  | test("the owner connects MyFatoorah: checklist, write-only keys, approvals, turn on, pause and disconnect", async ({
  12  |   page,
  13  |   request,
  14  |   s,
  15  |   appLocale,
  16  | }) => {
  17  |   test.setTimeout(180_000);
  18  |   const shop = await freshShop(request, `pay-${appLocale}`);
  19  |   const manager = await addMember(request, shop, "branch_manager");
  20  |   const apiToken = `e2e-token-${crypto.randomUUID()}`;
  21  |   const webhookSecret = `e2e-hook-${crypto.randomUUID()}`;
  22  |   const responses: string[] = [];
  23  |   page.on("response", (response) => {
  24  |     if (new URL(response.url()).pathname.split("/").includes("payments")) {
  25  |       void response.text().then((body) => responses.push(body), () => undefined);
  26  |     }
  27  |   });
  28  | 
  29  |   await page.goto("/login");
  30  |   await signIn(page, s, shop.owner);
  31  |   await page.goto("/settings");
  32  |   await page.getByRole("link", { name: s.onlinePayments }).click();
  33  |   await expect(page.getByRole("heading", { level: 1, name: s.onlinePayments })).toBeVisible();
  34  |   const mf = page.getByRole("region", { name: s.myFatoorah });
  35  |   const tap = page.getByRole("region", { name: s.tapProvider });
  36  |   await expect(mf).toContainText(s.payNotConnected);
  37  |   await expect(tap).toContainText(s.payNotConnected);
  38  |   await expect(tap.getByLabel(s.paySecretKey)).toBeVisible();
  39  |   await expect(tap.getByLabel(s.payWebhookSecret)).toHaveCount(0);
  40  | 
  41  |   // A step the owner ticks is kept before any key is saved.
  42  |   await mf.getByRole("checkbox", { name: s.payStepBankAccount }).check();
  43  |   await expect.poll(async () => (await storedConnection(request, shop, "myfatoorah"))?.status).toBe("draft");
  44  |   await page.reload();
  45  |   await expect(mf.getByRole("checkbox", { name: s.payStepBankAccount })).toBeChecked();
  46  | 
  47  |   // Keys: refused when empty, then saved once and never shown again.
  48  |   await mf.getByRole("button", { name: s.paySaveKeys }).click();
  49  |   await expect(mf.getByText(s.payPasteWholeKey).first()).toBeVisible();
  50  |   await mf.getByLabel(s.payApiToken).fill(apiToken);
  51  |   await mf.getByLabel(s.payWebhookSecret).fill(webhookSecret);
  52  |   await mf.getByRole("button", { name: s.paySaveKeys }).click();
> 53  |   await expect(page.getByText(s.payKeysSaved(s.myFatoorah))).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  54  |   await expect(mf).toContainText(s.payNotTurnedOn);
  55  |   await expect(mf).toContainText(s.payTestMode);
  56  |   await expect(mf).toContainText(s.payKeyEnding(apiToken.slice(-4)));
  57  |   await expect(mf).toContainText(s.payNotTested);
  58  |   await expect(mf.getByLabel(s.payApiToken)).toHaveValue("");
  59  |   await expect(mf.getByLabel(s.payWebhookSecret)).toHaveValue("");
  60  |   await expect(mf.getByRole("button", { name: s.payReplaceKeys })).toBeVisible();
  61  | 
  62  |   // Turning on waits for a passed test and an approved method.
  63  |   await expect(mf.getByRole("button", { name: s.payTurnOn })).toBeDisabled();
  64  |   await expect(mf).toContainText(s.payGapTest);
  65  |   await expect(mf).toContainText(s.payGapMethod);
  66  |   await recordPassingTest(request, shop, "myfatoorah");
  67  |   await page.reload();
  68  |   await expect(mf).toContainText(s.payPassed);
  69  |   await expect(mf).not.toContainText(s.payGapTest);
  70  |   await mf.getByRole("checkbox", { name: s.payKnet, exact: true }).check();
  71  |   await mf.getByRole("button", { name: s.paySaveFeatures }).click();
  72  |   await expect(page.getByText(s.payFeaturesSaved(s.myFatoorah))).toBeVisible();
  73  |   expect((await storedConnection(request, shop, "myfatoorah"))?.capabilities).toEqual(["knet"]);
  74  | 
  75  |   await mf.getByRole("button", { name: s.payTurnOn }).click();
  76  |   await expect(page.getByText(s.payIsActive(s.myFatoorah))).toBeVisible();
  77  |   await expect(mf).toContainText(s.payActive);
  78  |   expect((await storedConnection(request, shop, "myfatoorah"))?.status).toBe("active");
  79  | 
  80  |   await mf.getByRole("button", { name: s.payPause }).click();
  81  |   await page.getByRole("alertdialog", { name: s.payPauseTitle(s.myFatoorah) }).getByRole("button", { name: s.payPause }).click();
  82  |   await expect(page.getByText(s.payIsPaused(s.myFatoorah))).toBeVisible();
  83  |   await expect(mf).toContainText(s.payPaused);
  84  |   await mf.getByRole("button", { name: s.payTurnBackOn }).click();
  85  |   await expect(mf).toContainText(s.payActive);
  86  | 
  87  |   await mf.getByRole("button", { name: s.payDisconnect }).click();
  88  |   await page
  89  |     .getByRole("alertdialog", { name: s.payDisconnectTitle(s.myFatoorah) })
  90  |     .getByRole("button", { name: s.payDisconnect })
  91  |     .click();
  92  |   await expect(page.getByText(s.payIsDisconnected(s.myFatoorah))).toBeVisible();
  93  |   await expect(mf).toContainText(s.payDisconnected);
  94  |   await expect(mf).not.toContainText(s.payKeyEnding(apiToken.slice(-4)));
  95  |   expect((await storedConnection(request, shop, "myfatoorah"))?.status).toBe("disconnected");
  96  |   await expect(tap).toContainText(s.payNotConnected);
  97  | 
  98  |   // The keys went in once and never came back out.
  99  |   expect(responses.length).toBeGreaterThan(0);
  100 |   for (const body of responses) {
  101 |     expect(body).not.toContain(apiToken);
  102 |     expect(body).not.toContain(webhookSecret);
  103 |   }
  104 |   expect(await page.content()).not.toContain(apiToken);
  105 | 
  106 |   // A manager has neither the settings entry nor the page.
  107 |   await signOut(page, s);
  108 |   await signIn(page, s, manager);
  109 |   await page.goto("/settings");
  110 |   await expect(page.getByRole("link", { name: s.onlinePayments })).toHaveCount(0);
  111 |   await page.goto("/settings/online-payments");
  112 |   await expect(page.getByRole("heading", { name: s.forbidden })).toBeVisible();
  113 | });
  114 | 
```