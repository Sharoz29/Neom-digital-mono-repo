/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */

const Login = async (username, password, page) => {
  await page.locator("#txtUserID").type(username);
  await page.locator("#txtPassword").type(password);
  await page.locator("#submit_row .loginButton").click();
};

const getNextDay = () => {
  const tomorrow = new Date();
  // add 1 day to today
  tomorrow.setDate(new Date().getDate() + 1);
  return tomorrow.toLocaleDateString("en-US", {month: "2-digit", day: "2-digit", year: "numeric"});
};

module.exports = {
  Login,
  getNextDay,
};
