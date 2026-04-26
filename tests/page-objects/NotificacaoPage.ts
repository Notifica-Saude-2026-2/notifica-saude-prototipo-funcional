import { type Page, type Locator, expect } from '@playwright/test';
import { camposFormularioMock } from '../fixtures/campos-formulario';

export class NotificacaoPage {
  // Navigation
  readonly btnProximo: Locator;
  readonly btnEnviar: Locator;

  // Tela 1
  readonly selectInstituicao: Locator;

  // Tela 3
  readonly inputData: Locator;

  // Campos dinâmicos
  readonly inputEspecifique: Locator;

  constructor(readonly page: Page) {
    this.btnProximo = page.getByRole('button', { name: 'Próximo' });
    this.btnEnviar = page.getByRole('button', { name: 'Enviar notificação' });
    this.selectInstituicao = page.getByTestId('field-campo-instituicao');
    this.inputData = page.getByTestId('field-campo-data');
    this.inputEspecifique = page.getByPlaceholder('Digite aqui...');
  }

  async mockAPI(): Promise<void> {
    await this.page.route(/\/api\/campos-formulario\/ativos/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(camposFormularioMock),
      })
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/notificacao');
    await expect(this.page.getByText('REGISTRO DE INCIDENTE')).toBeVisible();
    await expect(this.page.getByText('Informações iniciais')).toBeVisible();
  }

  async fillTela1(envolvePaciente: 'Sim' | 'Não'): Promise<void> {
    await this.selectInstituicao.selectOption({ index: 1 });
    await this.page.getByLabel(envolvePaciente).check();
    await this.btnProximo.click();
  }

  async fillTela2(faixaEtaria = '18–59 anos', sexo = 'Feminino'): Promise<void> {
    await this.page.getByLabel(faixaEtaria).check();
    await this.page.getByLabel(sexo).check();
    await this.btnProximo.click();
  }

  async fillTela3(isoDate: string, turno: string, setor: string): Promise<void> {
    await this.inputData.fill(isoDate);
    await this.page.getByLabel(turno).check();
    await this.page.getByLabel(setor).check();
    await this.btnProximo.click();
  }
}
