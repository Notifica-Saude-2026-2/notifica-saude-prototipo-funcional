/**
 * CT-FUN-003 — Validação de data do incidente maior que data atual
 * Critério: Análise de valor limite | US-1.1 | CA02
 */
import { test, expect } from '@playwright/test';
import { NotificacaoPage } from '../page-objects/NotificacaoPage';
import { todayISO, futureDateISO } from '../fixtures/campos-formulario';

test.describe('CT-FUN-003 – Validação de data futura do incidente', () => {
  let form: NotificacaoPage;

  test.beforeEach(async ({ page }) => {
    form = new NotificacaoPage(page);
    await form.mockAPI();
    await form.goto();
    await form.fillTela1('Não');
    await expect(form.page.getByText('Momento e local do incidente')).toBeVisible();
  });

  test('rejeita data futura com mensagem "Data inválida!"', async () => {
    await form.inputData.fill(futureDateISO(1));
    await expect(form.page.getByText('Data inválida!')).toBeVisible();
    await expect(form.btnProximo).toBeDisabled();
  });

  test('aceita data atual (limite válido)', async () => {
    await form.inputData.fill(todayISO());
    await form.page.getByLabel('Manhã').check();
    await form.page.getByLabel('UTI').check();
    await expect(form.btnProximo).toBeEnabled();
  });

  test('aceita data anterior a hoje (limite inferior válido)', async () => {
    await form.inputData.fill('2026-01-01');
    await form.page.getByLabel('Manhã').check();
    await form.page.getByLabel('UTI').check();
    await expect(form.btnProximo).toBeEnabled();
  });
});
