const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Since we are only testing the Privacy Modal here, bypass the GTAG modal by first
  // setting the cookieconsent_status to ALLOW
  await page.evaluate(() => localStorage.setItem('cookieconsent_status', 'allow'));
});

test('Check Local Storage for privacyPolicyAgreed key TRUE and no visible privacyModal', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.setItem('privacyPolicyAgreed', 'true')); // set localStorage key

  await page.goto('http://localhost:3000');
  const privacyAgree = await page.evaluate(() => localStorage.getItem('privacyPolicyAgreed'));
  expect(privacyAgree).toBe('true'); // check if Local Storage key 'privacyPolicyAgreed' has a value of 'true'

  const modal = await page.isVisible('#privacyModal');
  expect(modal).toBeFalsy(); // check if modal with ID 'privacyModal' is NOT visible
});

test('Check for visible privacyModal when local storage does not exist', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.clear()); // clear localStorage before test
  const privacyAgree = await page.evaluate(() => localStorage.getItem('privacyPolicyAgreed'));
  expect(privacyAgree).toBeFalsy();  // Check that Local Storage key 'privacyPolicyAgreed' does not exist.

  await page.evaluate(() => localStorage.setItem('privacyPolicyAgreed', 'false')); // set localStorage key
  await page.goto('http://localhost:3000');
  const modal = await page.waitForSelector('#privacyModal.show');
  expect(modal).toBeTruthy(); // check if modal with ID 'privacyModal' is visible
});
