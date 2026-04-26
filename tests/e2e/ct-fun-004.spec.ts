/**
 * CT-FUN-004 — Exibição dinâmica do campo "Especifique" ao selecionar "Outro"
 * Critério: Partição por equivalência (padrão vs "Outro") | US-1.1 | CA02
 */
import { test, expect } from '@playwright/test';
import { NotificacaoPage } from '../page-objects/NotificacaoPage';
import { todayISO } from '../fixtures/campos-formulario';

test.describe('CT-FUN-004 – Campo dinâmico ao selecionar "Outro"', () => {
  let form: NotificacaoPage;

  test.beforeEach(async ({ page }) => {
    form = new NotificacaoPage(page);
    await form.mockAPI();
    await form.goto();
  });

  test.describe('Tela 3 – Setor', () => {
    test.beforeEach(async () => {
      await form.fillTela1('Não');
      await form.inputData.fill(todayISO());
      await form.page.getByLabel('Manhã').check();
    });

    test('exibe campo "Especifique" ao selecionar "Outro" no Setor', async () => {
      await form.page.getByLabel('Outro').check();
      await expect(form.inputEspecifique).toBeVisible();
    });

    test('campo "Especifique" é obrigatório — bloqueia avanço quando vazio', async () => {
      await form.page.getByLabel('Outro').check();
      await expect(form.inputEspecifique).toBeVisible();
      await expect(form.btnProximo).toBeDisabled();
    });

    test('permite avanço após preencher "Especifique"', async () => {
      await form.page.getByLabel('Outro').check();
      await form.inputEspecifique.fill('Setor de teste automatizado');
      await expect(form.btnProximo).toBeEnabled();
    });

    test('oculta campo "Especifique" ao trocar para outra opção', async () => {
      await form.page.getByLabel('Outro').check();
      await expect(form.inputEspecifique).toBeVisible();
      await form.page.getByLabel('UTI').check();
      await expect(form.inputEspecifique).not.toBeVisible();
    });
  });

  test.describe('Tela 2 – Sexo', () => {
    test.beforeEach(async () => {
      await form.fillTela1('Sim');
      await expect(form.page.getByText('Informações sobre o paciente envolvido')).toBeVisible();
      await form.page.getByLabel('18–59 anos').check();
    });

    test('exibe campo "Especifique" ao selecionar "Outro" no Sexo', async () => {
      await form.page.getByLabel('Outro').check();
      await expect(form.inputEspecifique).toBeVisible();
      await expect(form.btnProximo).toBeDisabled();
    });

    test('permite avanço após preencher "Especifique" no Sexo', async () => {
      await form.page.getByLabel('Outro').check();
      await form.inputEspecifique.fill('Não-binário');
      await expect(form.btnProximo).toBeEnabled();
    });
  });
});
