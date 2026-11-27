import { expect, test } from '@playwright/test';

test('the built SPA boots and handles navigation without a backend', async ({
  page,
  baseURL,
}) => {
  const externalRequests: string[] = [];
  if (!baseURL) {
    throw new Error('The Playwright base URL must be configured.');
  }

  const expectedOrigin = new URL(baseURL).origin;

  page.on('request', (request) => {
    const url = new URL(request.url());

    if (url.protocol.startsWith('http') && url.origin !== expectedOrigin) {
      externalRequests.push(request.url());
    }
  });

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'FRIDAY', exact: true }),
  ).toBeVisible();

  await page.goto('/unknown');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Return home' }).click();
  await expect(
    page.getByRole('heading', { name: 'FRIDAY', exact: true }),
  ).toBeVisible();

  expect(externalRequests).toEqual([]);
});
