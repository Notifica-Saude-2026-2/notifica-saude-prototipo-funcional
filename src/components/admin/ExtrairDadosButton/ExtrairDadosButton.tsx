import { useEffect, useRef, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import { Button } from "../../common/ui/Button";
import { Toast, type ToastVariant } from "../../common/ui/Toast";
import { useAuth } from "../../../hooks/useAuth";
import styles from "./ExtrairDadosButton.module.css";

/** Perfis que podem extrair o relatório: NSP e Administrador (instituição inteira) e gestor da
    área (só o próprio setor). */
const PERFIS_COM_EXTRACAO = new Set(["NSP", "ADMINISTRADOR", "GESTOR_AREA"]);

/**
 * Botão "Extrair dados": gera e baixa o relatório de incidentes em XLSX, no escopo do perfil
 * logado (ver services/relatorioXlsx.ts).
 */
export function ExtrairDadosButton() {
  const { usuario } = useAuth();
  const [gerando, setGerando] = useState(false);
  const [toast, setToast] = useState<{ msg: string; variant: ToastVariant } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!usuario || !PERFIS_COM_EXTRACAO.has(usuario.perfil)) return null;

  function avisar(msg: string, variant: ToastVariant) {
    setToast({ msg, variant });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 4000);
  }

  async function extrair() {
    if (!usuario || gerando) return;
    setGerando(true);
    try {
      const { extrairRelatorioXlsx } = await import("../../../services/relatorioXlsx");
      const { total } = await extrairRelatorioXlsx(usuario);
      avisar(
        total === 1
          ? "Relatório gerado com 1 incidente."
          : `Relatório gerado com ${total} incidentes.`,
        "success",
      );
    } catch {
      avisar("Não foi possível gerar o relatório. Tente novamente.", "error");
    } finally {
      setGerando(false);
    }
  }

  return (
    <>
      <span className={styles.wrapper} title="Extrair xlsx">
        <Button
          title={gerando ? "Gerando..." : "Extrair dados"}
          variant="contained"
          color="primary"
          disabled={gerando}
          onClick={extrair}
          startIcon={<MdFileDownload size={18} aria-hidden="true" />}
          className={styles.botao}
          data-testid="btn-extrair-dados"
        />
      </span>
      <Toast message={toast?.msg ?? ""} show={!!toast} variant={toast?.variant} />
    </>
  );
}
