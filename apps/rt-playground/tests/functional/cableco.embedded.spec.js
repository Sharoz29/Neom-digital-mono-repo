const { test, expect } = require("@playwright/test");
const config = require("../config");
const common = require("../common");
const endpoints = require("../../src/_services/endpoints");

test.beforeEach(async ({ page }) => {
  await page.goto(config.config.baseUrl + "/embedded");
});

test.describe("E2E test", () => {
  test("should launch, select a service plan and fill details", async ({ page }) => {
    const silverPlan = page.locator('button:has-text("shop now") >> nth=1');
    await silverPlan.click();

    /* This text will be utilised depending upon the type of flow (Std/Screen) we're in */
    const submitButtonText = endpoints.endpoints.use_v2apis ? "Next" : "submit";

    /* Customer Info */
    await page.fill('div[data-test-id="20210506160005026407673836-6e95-4bfa-9fb2-1ebfc1a57b76696"] input', "John"); // First Name
    await page.fill('div[data-test-id="20210506160005026673b308db-248b-40cf-9a66-eeeff0497516182"] input', ""); // Middle Name
    await page.fill('div[data-test-id="202105061600050267b5dc009a-764d-47b5-ae09-3a020b692bb3434"] input', "Doe"); // Last Name

    const suffixAutoComplete = page.locator('div[data-test-id="20210506160005026789c01df1-c64a-496a-9ab7-96a3efa55dcb164"]');
    await suffixAutoComplete.locator("input").click();
    await page.keyboard.press("ArrowDown");
    await suffixAutoComplete.locator('.results span.title:has-text("Jr")').click(); // Suffix

    await page.fill('div[data-test-id="202105061600050267052c3de4-d571-4ea9-8747-f60e1d927fff55"] input', "john@doe.com"); // Email
    await page.locator(`button:has-text('${submitButtonText}')`).click();

    /* Customer Address */
    await page.fill('div[data-test-id="2018120413442908261ba9c8f3-70a6-425c-ae29-9ea7afe38f4d347"] input', "Main St"); // Street
    await page.fill('div[data-test-id="20181204134429082684f431c8-2257-47cb-baec-61d0b29fbea6763"] input', "Cambridge"); // City

    const stateContainer = page.locator('div[data-test-id="20181204134429082666cd5b6e-bb2d-4932-9a44-b024d285b47c75"]');
    stateContainer.locator("input").click();
    await stateContainer.locator('div[role="listbox"] span.text:has-text("MA")').click(); // State

    await page.fill('div[data-test-id="201812041344290826a63ee709-a2ae-4ab0-aad0-150f9f29191c33"] input', "02142"); // Postal Code
    await page.fill('div[data-test-id="2019013113470709273e64599b-24e6-4a80-8d3a-2b369c37dc5d74"] input', "6175551212"); // Phone Number
    await page.locator(`button:has-text('${submitButtonText}')`).click();

    /* screen flow testing */
    if (endpoints.endpoints.use_v2apis) {
      await page.locator('button:has-text("Previous")').click();
      const streetInput = page.locator('div[data-test-id="2018120413442908261ba9c8f3-70a6-425c-ae29-9ea7afe38f4d347"] input');
      await expect(streetInput).toHaveValue("Main St");
      await page.locator('button:has-text("Next")').click();
    }

    /* Customer Requested Service */
    await page.locator(`button:has-text('${submitButtonText}')`).click();

    /* Service Date */
    const futureDate = common.getNextDay();
    await page.type('div[data-test-id="20210506160943017983b9b8ac-be38-447d-b6dd-9bc8dd73dd5c353"] input', futureDate); // Service Date
    await page.locator(`button:has-text('${submitButtonText}')`).click();

    /* Confirm */
    await page.locator("text=Status: Pending-Fulfillment").click();
    await page.locator('button:has-text("Close")').click();
  }, 10000);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
