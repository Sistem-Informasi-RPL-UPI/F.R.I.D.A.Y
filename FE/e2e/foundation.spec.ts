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

  // Verify multi-page Admin navigation, conflict floating alert, and break-split dialog (PRD Section 11)
  await page.goto('/admin/dosen');
  await expect(
    page.getByRole('heading', { name: 'Kelola Dosen' }),
  ).toBeVisible();

  await page.getByRole('link', { name: /Penjadwalan & Mind Mapping/i }).click();
  await page.getByRole('link', { name: /Matriks Mind Mapping/i }).click();
  await expect(
    page.getByRole('heading', { name: /Matriks Mind Mapping \(37 Ruangan\)/i }),
  ).toBeVisible();

  // Trigger invalid placement (room conflict on SENIN Room 1 Pos 1) and verify floating rejection alert
  await page.getByText('Praktikum Jaringan & Sistem Tertanam').click();
  await page.getByRole('button', { name: 'Tempatkan di Slot Ini' }).click();
  await expect(page.getByTestId('floating-rejection-alert')).toBeVisible();

  // Trigger break split confirmation (5 SKS at SENIN Room 3 Pos 4 -> 3 SKS + 2 SKS)
  await page.getByText('Praktikum Jaringan & Sistem Tertanam').click();
  await page.getByLabel('Ruangan (1–37)').selectOption('3');
  await page.getByLabel(/Pos Awal/i).selectOption('4');
  await page.getByRole('button', { name: 'Tempatkan di Slot Ini' }).click();
  await expect(
    page.getByRole('heading', { name: 'Pecah Mata Kuliah di Jam Istirahat?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Ya, pecah' }).click();
  await expect(page.getByText('(1/2) Terpisah')).toBeVisible();
  await expect(page.getByText('(2/2) Terpisah')).toBeVisible();

  expect(externalRequests).toEqual([]);
});
