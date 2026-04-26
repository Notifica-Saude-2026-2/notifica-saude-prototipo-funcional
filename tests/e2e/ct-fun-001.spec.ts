/**
 * CT-FUN-001 — Acesso ao formulário de registro de incidente
 * Critério: Caminho feliz | US-1.1 | CA01
 */
import { test, expect } from '@playwright/test';
import { NotificacaoPage } from '../page-objects/NotificacaoPage';

test.describe('CT-FUN-001 – Acesso ao formulário de registro de incidente', () => {
  let form: NotificacaoPage;

  test.beforeEach(async ({ page }) => {
    form = new NotificacaoPage(page);
    await form.mockAPI();
  });

  test('deve navegar ao formulário ao clicar em "Registrar incidente"', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Registrar incidente/i }).click();
    await expect(page).toHaveURL('/notificacao');
    await expect(page.getByText('REGISTRO DE INCIDENTE')).toBeVisible();
    await expect(page.getByText('Informações iniciais')).toBeVisible();
  });

  test('deve exibir Tela 1 como etapa inicial com campos corretos', async () => {
    await form.goto();
    await expect(form.selectInstituicao).toBeVisible();
    await expect(form.page.getByText('Envolve paciente?')).toBeVisible();
    await expect(form.btnProximo).toBeDisabled();
  });
});
