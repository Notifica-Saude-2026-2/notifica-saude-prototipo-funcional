import type { CampoDinamico } from '../types/formulario';
import { apiFetch } from './api';

export function getCamposFormularioAtivos(): Promise<CampoDinamico[]> {
  return apiFetch<CampoDinamico[]>('/api/campos-formulario/ativos');
}
