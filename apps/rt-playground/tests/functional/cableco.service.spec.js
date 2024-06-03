const path = require('path');
const { test, expect } = require("@playwright/test");
const config = require("../config");
const common = require("../common");
const endpoints = require("../../src/_services/endpoints");

let caseID;

test.beforeEach(async ({ page }) => {
  await page.goto(config.config.baseUrl);
});

test.describe("E2E test", () => {
  test("should login, create case and send for discount", async ({ page }) => {
    const loginButton = page.locator("#login-btn");
    await loginButton.click();

    await common.Login(config.config.apps.cableCo.rep.username, config.config.apps.cableCo.rep.password, page);

    const workerListTitle = page.locator("#work-list");
    await expect(workerListTitle).toBeVisible({ timeout: 10000 });

    // Click toggle icon to open side navbar
    await page.locator("#toggle-icon").click();

    // Select Service to create new service
    const sidebarContainer = page.locator(".sidebar");
    await sidebarContainer.locator("a:has-text('Service')").click();

    /* Customer Page */
    await page.fill('div[data-test-id="20181204134351062899951c9c-030a-4f0d-980f-154602defd07659"] input', "John"); // First Name
    await page.fill('div[data-test-id="20181204134351062824246834-4ad0-4a6e-96a3-39330a71599a149"] input', ""); // Middle Name
    await page.fill('div[data-test-id="20181204134351062876d5adf0-f8f1-422d-9bc1-23382769f598734"] input', "Doe"); // Last Name

    const suffixAutoComplete = page.locator('div[data-test-id="201812041343510628867b14a9-f1bf-4bd1-9d60-d4d21b969297870"]');
    await suffixAutoComplete.locator("input").click();
    await page.keyboard.press("ArrowDown");
    await suffixAutoComplete.locator('.results span.title:has-text("Jr")').click(); // Suffix

    await page.fill('div[data-test-id="2019013113365206458bbc186a-196d-4d4b-9f97-68a3def1b734976"] input', "john@doe.com"); // Email
    const futureDate = common.getNextDay();
    await page.type('div[data-test-id="201901081239340275a8d23113-cfe8-45d6-a29c-fe96a6f86fa3962"] input', futureDate); // Service Date
    await page.locator('button:has-text("Submit")').click();

    /* Address Page */
    await page.fill('div[data-test-id="2018120413442908261ba9c8f3-70a6-425c-ae29-9ea7afe38f4d347"] input', "Main St"); // Street
    await page.fill('div[data-test-id="20181204134429082684f431c8-2257-47cb-baec-61d0b29fbea6763"] input', "Cambridge"); // City

    const stateContainer = page.locator('div[data-test-id="20181204134429082666cd5b6e-bb2d-4932-9a44-b024d285b47c75"]');
    stateContainer.locator("input").click();
    await stateContainer.locator('div[role="listbox"] span.text:has-text("MA")').click(); // State

    await page.fill('div[data-test-id="201812041344290826a63ee709-a2ae-4ab0-aad0-150f9f29191c33"] input', "02142"); // Postal Code
    await page.fill('div[data-test-id="2019013113470709273e64599b-24e6-4a80-8d3a-2b369c37dc5d74"] input', "6175551212"); // Phone Number
    await page.locator('button:has-text("Submit")').click();

    /* Service Page */
    await page.locator('div[data-test-id="201812041345150137523e1271-7e5a-4f1f-a144-ffc67ac26db2810"] label').click(); // TV
    await page.locator('div[data-test-id="201812041345150137a07b7ebe-064b-4758-a6ae-e8ce5359eb6f205"] label:has-text("Premium")').click(); // Premium
    await page.locator('div[data-test-id="20181204134515013795c93a4a-1f97-4a3b-9940-2cb415e360db348"] label').click(); // Internet Service
    await page.locator('div[data-test-id="20181204134515013804ccf6db-bbd1-4432-8411-80c568cadc04635"] label:has-text("300 Mbps")').click(); // 300 Mbps
    await page.locator('div[data-test-id="2018120413451501387152cfe7-2f1d-4291-a4fa-0b4df67257f4181"] label').click(); // Home Phone Service
    await page.locator('div[data-test-id="2018120413451501387107d456-38fc-45ee-86c0-a74655c709fe898"] label:has-text("International Full")').click(); // International Full
    await page.locator('button:has-text("Submit")').click();

    /* Other Notes Page */
    await page.fill('textarea[data-test-id="201902011030390854abdcb69f-e2b4-47e6-b414-06a7a34ebd84280"]', "Thanks for the service!"); // Notes
    await page.locator('div[data-test-id="2019020110303908546a94f291-66bf-459a-9e32-e57497137dc652"] label').click(); // Send to Manager for Discount

    /* Attachment test */
    await page.locator('i[id="attachment-toggle-icon"]').click();
    // Constructing path of the file(to be uploaded)
    const filePath = path.join(__dirname, '../../src/assets/img/grayPegaLogoPadding.png');
    await page.setInputFiles('#upload-photo', filePath);
    const currentCaseID = await page.locator('div[id="current-caseID"]').textContent();
    await Promise.all([
      page.waitForResponse(`${endpoints.endpoints.PEGAURL}/api/v1/attachments/upload`)
    ]);
    await Promise.all([
      page.waitForResponse(`${endpoints.endpoints.PEGAURL}/api/v1/cases/${currentCaseID}/attachments`),
    ]);
    await Promise.all([
      page.waitForResponse(`${endpoints.endpoints.PEGAURL}/api/v1/cases/${currentCaseID}/attachments`),
    ]);
    
    const attachmentCount = await page.locator('div[id="attachment-count"]').textContent();
    await expect(Number(attachmentCount)).toBeGreaterThan(0);
    
    await page.locator('button:has-text("Download")').click();

    await page.locator('button:has-text("Delete")').click();

    await page.locator('button:has-text("Submit")').click();

    /* Confirm Page */
    await page.locator("text=Thank you for your submission.  No further action is required.").click();

    caseID = await page.locator("#tabs .menu a.item.active:last-child").textContent();
    await page.locator('button:has-text("Close")').click();
  }, 10000);

  test("should enter a discount value($) and send to tech", async ({ page }) => {
    const loginButton = page.locator("#login-btn");
    await loginButton.click();

    await common.Login(config.config.apps.cableCo.manager.username, config.config.apps.cableCo.manager.password, page);

    const listbox = page.locator("#worklist-dropdown");
    listbox.click();
    await listbox.locator('div[role="option"] span:has-text("CableConnect:Managers")').click();

    await page.locator('input[placeholder="Search by case ID..."]').fill(caseID);

    const caseButton = page.locator(`td:has-text('${caseID}')`);
    await caseButton.click();

    /* Other Notes Page */
    await page.fill('div[data-test-id="201902011024000235d3ee8338-e8a4-4d02-8e88-e4200322c3e5503"] input', "20"); // Notes
    await page.locator('button:has-text("Submit")').click();

    await page.locator("text=Thank you for your submission.  No further action is required.").click();
    await page.locator('button:has-text("Close")').click();
  }, 10000);

  test("should modify(if required) the actual services/packages to be installed and resolve the case", async ({ page }) => {
    const loginButton = page.locator("#login-btn");
    await loginButton.click();

    await common.Login(config.config.apps.cableCo.tech.username, config.config.apps.cableCo.tech.password, page);

    const workerListTitle = page.locator("#work-list");
    await expect(workerListTitle).toBeVisible({ timeout: 10000 });

    await page.locator('input[placeholder="Search by case ID..."]').fill(caseID);

    const caseButton = page.locator(`td:has-text('${caseID}')`);
    await caseButton.click();

    await page.locator('div[data-test-id="2018120413461807002195fc07-96ce-4325-a621-fef061c98cde597"] label').click(); // TV Connected

    await page.locator('button:has-text("submit")').click();

    await page.locator("text=Status: Resolved-Completed").click();
  }, 10000);

  /* This text will be utilised depending upon the type of flow (Std/Screen) we're in */
  const submitButtonText = endpoints.endpoints.use_v2apis ? "Next" : "submit";

  test("should login with customer.cableco user and create a service case", async ({ page }) => {
    const loginButton = page.locator("#login-btn");
    await loginButton.click();

    await common.Login(config.config.apps.cableCo.customer.username, config.config.apps.cableCo.customer.password, page);

    const workerListTitle = page.locator("#work-list");
    await expect(workerListTitle).toBeVisible({ timeout: 10000 });

    // Click toggle icon to open side navbar
    await page.locator("#toggle-icon").click();

    // Select Service to create new service
    const sidebarContainer = page.locator(".sidebar");
    await sidebarContainer.locator("a:has-text('Service')").click();

    /* Customer Page */
    await page.fill('div[data-test-id="20210506160005026407673836-6e95-4bfa-9fb2-1ebfc1a57b76696"] input', "John"); // First Name
    await page.fill('div[data-test-id="20210506160005026673b308db-248b-40cf-9a66-eeeff0497516182"] input', ""); // Middle Name
    await page.fill('div[data-test-id="202105061600050267b5dc009a-764d-47b5-ae09-3a020b692bb3434"] input', "Doe"); // Last Name

    const suffixAutoComplete = page.locator('div[data-test-id="20210506160005026789c01df1-c64a-496a-9ab7-96a3efa55dcb164"]');
    await suffixAutoComplete.locator("input").click();
    await page.keyboard.press("ArrowDown");
    await suffixAutoComplete.locator('.results span.title:has-text("Jr")').click(); // Suffix

    await page.fill('div[data-test-id="202105061600050267052c3de4-d571-4ea9-8747-f60e1d927fff55"] input', "john@doe.com"); // Email
    await page.locator(`button:has-text('${submitButtonText}')`).click();

    /* Address Page */
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

    /* Service Page */
    await page.locator('div[data-test-id="201812041345150137523e1271-7e5a-4f1f-a144-ffc67ac26db2810"] label').click(); // TV
    await page.locator('div[data-test-id="201812041345150137a07b7ebe-064b-4758-a6ae-e8ce5359eb6f205"] label:has-text("Premium")').click(); // Premium
    await page.locator('div[data-test-id="20181204134515013795c93a4a-1f97-4a3b-9940-2cb415e360db348"] label').click(); // Internet Service
    await page.locator('div[data-test-id="20181204134515013804ccf6db-bbd1-4432-8411-80c568cadc04635"] label:has-text("300 Mbps")').click(); // 300 Mbps
    await page.locator('div[data-test-id="2018120413451501387152cfe7-2f1d-4291-a4fa-0b4df67257f4181"] label').click(); // Home Phone Service
    await page.locator('div[data-test-id="2018120413451501387107d456-38fc-45ee-86c0-a74655c709fe898"] label:has-text("International Full")').click(); // International Full
    await page.locator(`button:has-text('${submitButtonText}')`).click();

    /* Service Date page */
    const futureDate = common.getNextDay();
    await page.type('div[data-test-id="20210506160943017983b9b8ac-be38-447d-b6dd-9bc8dd73dd5c353"] input', futureDate); // Service Date
    await page.locator('button:has-text("Submit")').click();

    /* Confirm Page */
    await page.locator("text=Status: Pending-Fulfillment").click();
    await page.locator('button:has-text("Close")').click();
  }, 10000);
});

test.afterEach(async ({ page }) => {
  await page.close();
});
