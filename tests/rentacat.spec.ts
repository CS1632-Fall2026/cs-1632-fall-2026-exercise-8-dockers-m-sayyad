import { test, expect } from '@playwright/test';

var baseURL = 'http://localhost:8080';

// Test fixture: open home page and make all 3 cats available
test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    // set the cookies inside browser before each test
    await page.evaluate(() => {
        document.cookie = '1=false';
        document.cookie = '2=false';
        document.cookie = '3=false';
    });
});

test('TEST-1-RESET', async ({ page }) => {
    // Preconditions: all three cats are rented out
    await page.evaluate(() => {
        document.cookie = '1=true';
        document.cookie = '2=true';
        document.cookie = '3=true';
    });

    await page.getByRole('link', { name: 'Reset', exact: true }).click();

    const cats = page.getByRole('list', { name: 'Cat names', exact: true }).getByRole('listitem');
    await expect(cats.nth(0)).toHaveText('ID 1. Jennyanydots');
    await expect(cats.nth(1)).toHaveText('ID 2. Old Deuteronomy');
    await expect(cats.nth(2)).toHaveText('ID 3. Mistoffelees');
});

test('TEST-2-CATALOG', async ({ page }) => {
    await page.getByRole('link', { name: 'Catalog', exact: true }).click();

    // check the image source in the 2nd photo list item
    const photos = page.getByRole('list', { name: 'Cat photos', exact: true }).getByRole('listitem');
    await expect(photos.nth(1).getByRole('img')).toHaveAttribute('src', '/images/cat2.jpg');
});

test('TEST-3-LISTING', async ({ page }) => {
    await page.getByRole('link', { name: 'Catalog', exact: true }).click();

    // check the no. of cats and the 3rd cat's name
    const cats = page.getByRole('list', { name: 'Cat names', exact: true }).getByRole('listitem');
    await expect(cats).toHaveCount(3);
    await expect(cats.nth(2)).toHaveText('ID 3. Mistoffelees');
});

test('TEST-4-RENT-A-CAT', async ({ page }) => {
    await page.getByRole('link', { name: 'Rent-A-Cat', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Rent', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Return', exact: true })).toBeVisible();
});

test('TEST-5-RENT', async ({ page }) => {
    // rent cat 1
    await page.getByRole('link', { name: 'Rent-A-Cat', exact: true }).click();
    await page.getByLabel('Enter the ID of the cat to rent:', { exact: true }).fill('1');
    await page.getByRole('button', { name: 'Rent', exact: true }).click();

    // only cat 1 should be rented out
    const cats = page.getByRole('list', { name: 'Cat names', exact: true }).getByRole('listitem');
    await expect(cats.nth(0)).toHaveText('Rented out');
    await expect(cats.nth(1)).toHaveText('ID 2. Old Deuteronomy');
    await expect(cats.nth(2)).toHaveText('ID 3. Mistoffelees');
    // check the success message
    await expect(page.getByText('Success!', { exact: true })).toBeVisible();
});

test('TEST-6-RETURN', async ({ page }) => {
    // Preconditions: cats 2 and 3 are rented out.
    await page.evaluate(() => {
        document.cookie = '2=true';
        document.cookie = '3=true';
    });

    await page.getByRole('link', { name: 'Rent-A-Cat', exact: true }).click();
    await page.getByLabel('Enter the ID of the cat to return:', { exact: true }).fill('2');
    await page.getByRole('button', { name: 'Return', exact: true }).click();

    // cat 2 available
    // cat 3 still rented out
    const cats = page.getByRole('list', { name: 'Cat names', exact: true }).getByRole('listitem');
    await expect(cats.nth(0)).toHaveText('ID 1. Jennyanydots');
    await expect(cats.nth(1)).toHaveText('ID 2. Old Deuteronomy');
    await expect(cats.nth(2)).toHaveText('Rented out');
    await expect(page.getByText('Success!', { exact: true })).toBeVisible();
});

test('TEST-7-FEED-A-CAT', async ({ page }) => {
    await page.getByRole('link', { name: 'Feed-A-Cat', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Feed', exact: true })).toBeVisible();
});

test('TEST-8-FEED', async ({ page }) => {
    // six catnips divide evenly among the 3 cats
    await page.getByRole('link', { name: 'Feed-A-Cat', exact: true }).click();
    await page.getByLabel('Number of catnips to feed:', { exact: true }).fill('6');
    await page.getByRole('button', { name: 'Feed', exact: true }).click();

    // allow ten seconds for the response
    await expect(page.getByText('Nom, nom, nom.', { exact: true })).toBeVisible({ timeout: 10000 });
});

test('TEST-9-GREET-A-CAT', async ({ page }) => {
    await page.getByRole('link', { name: 'Greet-A-Cat', exact: true }).click();

    // each available cat should respond once
    await expect(page.getByText('Meow!Meow!Meow!', { exact: true })).toBeVisible();
});

test('TEST-10-GREET-A-CAT-WITH-NAME', async ({ page }) => {
    await page.goto(baseURL + '/greet-a-cat/Jennyanydots');

    await expect(page.getByText('Meow! from Jennyanydots.', { exact: true })).toBeVisible();
});

test('TEST-11-FEED-A-CAT-SCREENSHOT', async ({ page }) => {
    // Preconditions: all three cats are rented out.
    await page.evaluate(() => {
        document.cookie = '1=true';
        document.cookie = '2=true';
        document.cookie = '3=true';
    });

    await page.getByRole('link', { name: 'Feed-A-Cat', exact: true }).click();

    // compare page body with browser and screenshot
    await expect(page.locator('body')).toHaveScreenshot();
});
