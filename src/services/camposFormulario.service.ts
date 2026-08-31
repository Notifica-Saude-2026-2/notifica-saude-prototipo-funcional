import type { CampoDinamico } from "../types/formulario";
import { camposFormulario } from "./localStore";

export function getCamposFormularioAtivos(): Promise<CampoDinamico[]> {
  return Promise.resolve(camposFormulario);
}
