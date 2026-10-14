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

Locator: getByText('حُفظت مفاتيح ماي فاتورة. شغّل اختبار المفاتيح للتحقق منها.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('حُفظت مفاتيح ماي فاتورة. شغّل اختبار المفاتيح للتحقق منها.') with timeout 5000ms
  - waiting for getByText('حُفظت مفاتيح ماي فاتورة. شغّل اختبار المفاتيح للتحقق منها.')

```

```yaml
- link "الانتقال إلى المحتوى الرئيسي":
  - /url: "#main"
- complementary:
  - navigation "القائمة الرئيسية":
    - list:
      - listitem:
        - link "الرئيسية":
          - /url: /?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "يومي":
          - /url: /my-day?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "التقويم":
          - /url: /calendar?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "العملاء":
          - /url: /clients?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "الفريق":
          - /url: /team?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "قائمة الخدمات":
          - /url: /catalogue?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "المبيعات":
          - /url: /sales?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "التقارير":
          - /url: /reports?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "الرسائل":
          - /url: /messages?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "السجل":
          - /url: /audit?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
      - listitem:
        - link "الإعدادات":
          - /url: /settings?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
- banner:
  - paragraph: محل pay-ar-mv7zxklbsqdv
  - text: المالك
  - group "الفرع (مقفل)":
    - paragraph: الرئيسي pay-ar-mv7zxklbsqdv
  - group "درج النقدية":
    - text: الدرج مغلق
    - button "فتح الدرج"
  - button "البحث عن العملاء والمواعيد والمبيعات": بحث Ctrl K
  - button "English"
  - button "owner-pay-ar-mv7zxklbsqdv@checkout.test"
- main:
  - link "العودة إلى الإعدادات":
    - /url: /settings?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
  - heading "الدفع الإلكتروني" [level=1]
  - paragraph: يدفع العملاء إلكترونياً في حسابات التاجر الخاصة بك لدى ماي فاتورة وتاب، ويحوّل كل مزود المبالغ إلى حسابك البنكي. لا يحتفظ GlowDesk بالأموال أبداً. ثم يختار كل فرع أيّ مزوديك النشطين يستخدم.
  - link "مطابقة الدفعات":
    - /url: /settings/online-payments/reconciliation?branch=c13fca51-61a5-4236-839a-7bd69dd7175e
  - region "ماي فاتورة":
    - heading "ماي فاتورة" [level=2]
    - text: غير مرتبط
    - paragraph: قدّم طلب حساب تاجر لدى ماي فاتورة، واتبع خطوات الربط أدناه، ثم الصق المفاتيح التي يعطيك إياها ماي فاتورة. مدة المراجعة بينك وبين ماي فاتورة.
    - alert: حدث خطأ ما. حاول مرة أخرى.
    - heading "خطوات الربط" [level=3]
    - list:
      - listitem:
        - checkbox "مستندات النشاط التجاري"
        - text: مستندات النشاط التجاري السجل التجاري (الرخصة) والبطاقة المدنية للمخوّل بالتوقيع عن النشاط، حسب ما يطلبه مزود الدفع.
      - listitem:
        - checkbox "الحساب البنكي" [checked]
        - text: الحساب البنكي رقم IBAN باسم النشاط التجاري نفسه. تُحوَّل المبالغ إليه مباشرة، ولا تمر عبر GlowDesk. تم في 14‏/10‏/2026.
      - listitem:
        - checkbox "تقديم الطلب"
        - text: تقديم الطلب قدّمت طلب حساب تاجر لدى مزود الدفع. مدة المراجعة بينك وبين المزود.
      - listitem:
        - checkbox "طلب الخدمات"
        - text: طلب الخدمات اطلب من المزود تفعيل الخدمات المذكورة في «الخدمات المعتمدة».
      - listitem:
        - checkbox "اعتماد الحساب"
        - text: اعتماد الحساب اعتمد المزود حساب التاجر الخاص بك.
      - listitem:
        - checkbox "اعتماد الخدمات"
        - text: اعتماد الخدمات حدّد في «الخدمات المعتمدة» كل خدمة أكّد المزود تفعيلها كتابياً. لا يستخدم GlowDesk إلا هذه الخدمات.
      - listitem:
        - text: إدخال مفاتيح الاختبار ليس بعد
        - paragraph: الصق مفاتيح الاختبار من المزود أدناه. تُحفظ مشفّرة ولا يمكن عرضها مرة أخرى، حتى لك.
      - listitem:
        - text: إشعارات الدفع ليس بعد
        - paragraph: فعّل Webhook V2 بمفتاح سري من بوابة ماي فاتورة والصق المفتاح مع مفاتيحك.
      - listitem:
        - text: نجاح الاختبار يتحقق منه GlowDesk
        - paragraph: "يتحقق منه GlowDesk: تمّت عملية دفع واسترداد تجريبية."
      - listitem:
        - text: إدخال المفاتيح الفعلية ليس بعد
        - paragraph: الصق المفاتيح الفعلية (ومفتاح الإشعارات الفعلي لماي فاتورة).
      - listitem:
        - text: التشغيل الفعلي يتحقق منه GlowDesk
        - paragraph: "يتحقق منه GlowDesk: تمّت عملية دفع فعلية بأقل مبلغ واستردادها."
    - group "الخدمات المعتمدة":
      - text: الخدمات المعتمدة
      - paragraph: حدّد فقط ما أكّده ماي فاتورة كتابياً لحسابك. لا يستخدم GlowDesk إلا هذه الخدمات.
      - paragraph: لا تتوفر البطاقات المحفوظة مع ماي فاتورة. يُرسل ما يزيد من رسوم عدم الحضور عن العربون كرابط دفع.
      - checkbox "كي نت"
      - text: كي نت
      - checkbox "فيزا وماستركارد"
      - text: فيزا وماستركارد
      - checkbox "حجز مبلغ البطاقة ثم تحصيله"
      - text: حجز مبلغ البطاقة ثم تحصيله
      - checkbox "الاسترداد من GlowDesk"
      - text: الاسترداد من GlowDesk
      - checkbox "استرداد كي نت من GlowDesk"
      - text: استرداد كي نت من GlowDesk
    - button "حفظ الخدمات المعتمدة" [disabled]
    - heading "مفاتيح الربط" [level=3]
    - paragraph: تُشفَّر المفاتيح عند حفظها ولا يمكن عرضها مرة أخرى، حتى لك. لتغييرها، الصق مفاتيح جديدة.
    - paragraph: المفاتيح لوضع
    - radiogroup "المفاتيح لوضع":
      - radio "وضع الاختبار" [checked]
      - radio "فعلي"
    - text: دولة حساب ماي فاتورة
    - combobox "دولة حساب ماي فاتورة":
      - option "الكويت" [selected]
      - option "البحرين"
      - option "عُمان"
      - option "السعودية"
      - option "الإمارات العربية المتحدة"
      - option "قطر"
    - text: رمز API
    - textbox "رمز API": e2e-token-730f0768-2891-4bfc-8918-9c008f223efc
    - text: من صفحة مفتاح API في بوابة ماي فاتورة (البوابة التجريبية لوضع الاختبار). المفتاح السري لـ Webhook V2
    - textbox "المفتاح السري لـ Webhook V2": e2e-hook-2f46927b-3cd7-4dde-8444-1251dd1328a5
    - text: في بوابة ماي فاتورة، فعّل Webhook V2 بمفتاح سري والصقه هنا. يُرسل عنوان الإشعارات مع كل عملية دفع، فلا حاجة لإعداد شيء آخر.
    - button "حفظ المفاتيح"
  - region "تاب":
    - heading "تاب" [level=2]
    - text: غير مرتبط
    - paragraph: قدّم طلب حساب تاجر لدى تاب، واتبع خطوات الربط أدناه، ثم الصق المفاتيح التي يعطيك إياها تاب. مدة المراجعة بينك وبين تاب.
    - heading "خطوات الربط" [level=3]
    - list:
      - listitem:
        - checkbox "مستندات النشاط التجاري"
        - text: مستندات النشاط التجاري السجل التجاري (الرخصة) والبطاقة المدنية للمخوّل بالتوقيع عن النشاط، حسب ما يطلبه مزود الدفع.
      - listitem:
        - checkbox "الحساب البنكي"
        - text: الحساب البنكي رقم IBAN باسم النشاط التجاري نفسه. تُحوَّل المبالغ إليه مباشرة، ولا تمر عبر GlowDesk.
      - listitem:
        - checkbox "تقديم الطلب"
        - text: تقديم الطلب قدّمت طلب حساب تاجر لدى مزود الدفع. مدة المراجعة بينك وبين المزود.
      - listitem:
        - checkbox "طلب الخدمات"
        - text: طلب الخدمات اطلب من المزود تفعيل الخدمات المذكورة في «الخدمات المعتمدة».
      - listitem:
        - checkbox "اعتماد الحساب"
        - text: اعتماد الحساب اعتمد المزود حساب التاجر الخاص بك.
      - listitem:
        - checkbox "اعتماد الخدمات"
        - text: اعتماد الخدمات حدّد في «الخدمات المعتمدة» كل خدمة أكّد المزود تفعيلها كتابياً. لا يستخدم GlowDesk إلا هذه الخدمات.
      - listitem:
        - text: إدخال مفاتيح الاختبار ليس بعد
        - paragraph: الصق مفاتيح الاختبار من المزود أدناه. تُحفظ مشفّرة ولا يمكن عرضها مرة أخرى، حتى لك.
      - listitem:
        - text: إشعارات الدفع ليس بعد
        - paragraph: "لا شيء مطلوب: مفتاح تاب السري نفسه يوقّع إشعارات الدفع."
      - listitem:
        - text: نجاح الاختبار يتحقق منه GlowDesk
        - paragraph: "يتحقق منه GlowDesk: تمّت عملية دفع واسترداد تجريبية."
      - listitem:
        - text: إدخال المفاتيح الفعلية ليس بعد
        - paragraph: الصق المفاتيح الفعلية (ومفتاح الإشعارات الفعلي لماي فاتورة).
      - listitem:
        - text: التشغيل الفعلي يتحقق منه GlowDesk
        - paragraph: "يتحقق منه GlowDesk: تمّت عملية دفع فعلية بأقل مبلغ واستردادها."
    - group "الخدمات المعتمدة":
      - text: الخدمات المعتمدة
      - paragraph: حدّد فقط ما أكّده تاب كتابياً لحسابك. لا يستخدم GlowDesk إلا هذه الخدمات.
      - checkbox "كي نت"
      - text: كي نت
      - checkbox "فيزا وماستركارد"
      - text: فيزا وماستركارد
      - checkbox "حجز مبلغ البطاقة ثم تحصيله"
      - text: حجز مبلغ البطاقة ثم تحصيله
      - checkbox "البطاقات المحفوظة"
      - text: البطاقات المحفوظة
      - checkbox "الخصم من بطاقة محفوظة دون حضور العميل"
      - text: الخصم من بطاقة محفوظة دون حضور العميل
      - checkbox "الاسترداد من GlowDesk"
      - text: الاسترداد من GlowDesk
      - checkbox "استرداد كي نت من GlowDesk"
      - text: استرداد كي نت من GlowDesk
    - button "حفظ الخدمات المعتمدة" [disabled]
    - heading "مفاتيح الربط" [level=3]
    - paragraph: تُشفَّر المفاتيح عند حفظها ولا يمكن عرضها مرة أخرى، حتى لك. لتغييرها، الصق مفاتيح جديدة.
    - paragraph: المفاتيح لوضع
    - radiogroup "المفاتيح لوضع":
      - radio "وضع الاختبار" [checked]
      - radio "فعلي"
    - text: المفتاح السري
    - textbox "المفتاح السري"
    - text: "من لوحة تحكم تاب: يبدأ بـ sk_test_ في وضع الاختبار وبـ sk_live_ في الوضع الفعلي."
    - button "حفظ المفاتيح"
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