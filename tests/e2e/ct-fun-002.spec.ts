/**
 * CT-FUN-002 — Validação de obrigatoriedade de campos
 * Critério: Partição por equivalência (campo vazio) | US-1.1 | CA02
 */
import { test, expect } from '@playwright/test';
import { NotificacaoPage } from '../page-objects/NotificacaoPage';
import { todayISO } from '../fixtures/campos-formulario';

test.describe('CT-FUN-002 – Validação de obrigatoriedade de campos', () => {
  let form: NotificacaoPage;

  test.beforeEach(async ({ page }) => {
    form = new NotificacaoPage(page);
    await form.mockAPI();
    await form.goto();
  });

  test.describe('Tela 1 – Informações iniciais', () => {
    test('bloqueia avanço com todos os campos vazios', async () => {
      await expect(form.btnProximo).toBeDisabled();
    });

    test('bloqueia avanço com apenas instituição preenchida', async () => {
      await form.selectInstituicao.selectOption({ index: 1 });
      await expect(form.btnProximo).toBeDisabled();
    });

    test('permite avanço com todos os campos obrigatórios preenchidos', async () => {
      await form.selectInstituicao.selectOption({ index: 1 });
      await form.page.getByLabel('Não').check();
      await expect(form.btnProximo).toBeEnabled();
    });
  });

  test.describe('Tela 2 – Informações sobre o paciente', () => {
    test.beforeEach(async () => {
      await form.fillTela1('Sim');
      await expect(form.page.getByText('Informações sobre o paciente envolvido')).toBeVisible();
    });

    test('bloqueia avanço com campos vazios', async () => {
      await expect(form.btnProximo).toBeDisabled();
    });

    test('bloqueia avanço com apenas faixa etária preenchida', async () => {
      await form.page.getByLabel('18–59 anos').check();
      await expect(form.btnProximo).toBeDisabled();
    });

    test('permite avanço com todos os campos preenchidos', async () => {
      await form.page.getByLabel('18–59 anos').check();
      await form.page.getByLabel('Feminino').check();
      await expect(form.btnProximo).toBeEnabled();
    });
  });

  test.describe('Tela 3 – Momento e local do incidente', () => {
    test.beforeEach(async () => {
      await form.fillTela1('Não');
      await expect(form.page.getByText('Momento e local do incidente')).toBeVisible();
    });

    test('bloqueia avanço com campos vazios', async () => {
      await expect(form.btnProximo).toBeDisabled();
    });

    test('bloqueia avanço com apenas data preenchida', async () => {
      await form.inputData.fill(todayISO());
      await expect(form.btnProximo).toBeDisabled();
    });

    test('permite avanço com todos os campos preenchidos', async () => {
      await form.inputData.fill(todayISO());
      await form.page.getByLabel('Manhã').check();
      await form.page.getByLabel('UTI').check();
      await expect(form.btnProximo).toBeEnabled();
    });
  });
});
