import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import {
  arquivarNotificacao,
  concluirNotificacao,
} from "../../../../services/notificacaoDetalheService";
import { EllipsisVerticalIcon } from "../../../../assets/icons/EllipsisVerticalIcon";
import { CheckCircleIcon } from "../../../../assets/icons/CheckCircleIcon";
import { ArchiveIcon } from "../../../../assets/icons/ArchiveIcon";
import { ApiError } from "../../../../services/api";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import { getStatusColors } from "../../../../utils/statusColors";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
  onArquivarSuccess: () => void;
  onConcluirSuccess: () => void;
};

export function NotificacaoHeader({ detalhe, onArquivarSuccess, onConcluirSuccess }: Props) {
  const statusColors = getStatusColors(detalhe.statusRaw);
  const { usuario } = useAuth();

  const podeArquivar =
    (usuario?.perfil === "NSP" || usuario?.perfil === "ADMINISTRADOR") &&
    detalhe.statusRaw !== "ARQUIVADA" &&
    detalhe.statusRaw !== "CONCLUIDA";

  // "Concluir" só faz sentido depois que a análise foi registrada — antes disso não tem o que
  // fechar ainda (mesma regra de concluirIncidenteLocal no localStore).
  const podeConcluir =
    (usuario?.perfil === "NSP" || usuario?.perfil === "ADMINISTRADOR") &&
    (detalhe.statusRaw === "ANALISADA" || detalhe.statusRaw === "EM_ACAO");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"arquivar" | "concluir" | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  async function handleConfirmar() {
    if (!pendingAction) return;
    setConfirmando(true);
    setConfirmError(null);
    try {
      if (pendingAction === "arquivar") {
        await arquivarNotificacao(detalhe.id);
        setPendingAction(null);
        onArquivarSuccess();
      } else {
        await concluirNotificacao(detalhe.id);
        setPendingAction(null);
        onConcluirSuccess();
      }
    } catch (err) {
      let msg =
        pendingAction === "arquivar"
          ? "Erro ao arquivar. Tente novamente."
          : "Erro ao concluir o incidente. Tente novamente.";
      if (err instanceof ApiError && err.status === 409) {
        msg = "Transição de status inválida.";
      }
      setConfirmError(msg);
    } finally {
      setConfirmando(false);
    }
  }

  function openConfirm(action: "arquivar" | "concluir") {
    setDropdownOpen(false);
    setConfirmError(null);
    setPendingAction(action);
  }

  return (
    <>
      <div className={styles.detailsHeader}>
        <p className={styles.incidentId}>#{detalhe.codigo}</p>

        <div className={styles.headerRight}>
          <div className={styles.headerBadgeGroup}>
            <span className={styles.headerLabel}>Criado em:</span>
            <span className={styles.headerBadge}>{detalhe.dataCadastro}</span>
          </div>

          <div className={styles.headerBadgeGroup}>
            <span className={styles.headerLabel}>Ocorrido em:</span>
            <span className={styles.headerBadge}>{detalhe.dataIncidente}</span>
          </div>

          <div className={styles.headerBadgeGroup}>
            <span className={styles.headerLabel}>Responsável:</span>
            <span className={styles.headerBadge}>
              {detalhe.classificacao?.responsavelNome ?? "—"}
            </span>
          </div>

          <div className={styles.headerBadgeGroup}>
            <span className={styles.headerLabel}>Status:</span>
            <span
              className={styles.headerBadge}
              style={{ background: statusColors.bg, color: statusColors.text }}
            >
              {detalhe.statusLabel}
            </span>
            {podeArquivar && (
              <div className={styles.contextMenuWrapper} ref={dropdownRef}>
                <button
                  className={styles.contextMenuBtn}
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-label="Opções de status"
                  data-testid="status-context-menu"
                >
                  <EllipsisVerticalIcon width={18} fill="6b6375" />
                </button>
                {dropdownOpen && (
                  <div className={styles.contextDropdown}>
                    {podeConcluir && (
                      <button
                        className={styles.contextDropdownItem}
                        onClick={() => openConfirm("concluir")}
                        data-testid="btn-concluir-notificacao"
                      >
                        <CheckCircleIcon width={15} fill="16a34a" /> Concluir incidente
                      </button>
                    )}
                    {podeArquivar && (
                      <button
                        className={`${styles.contextDropdownItem} ${styles.contextDropdownItemDanger}`}
                        onClick={() => openConfirm("arquivar")}
                        data-testid="btn-arquivar-notificacao"
                      >
                        <ArchiveIcon width={15} fill="c62828" /> Arquivar notificação
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingAction && (
        <div className={styles.overlay} onClick={() => !confirmando && setPendingAction(null)}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <p className={styles.confirmText}>
              {pendingAction === "arquivar"
                ? "Tem certeza que deseja arquivar essa notificação? Essa decisão não poderá ser alterada."
                : "Tem certeza que deseja concluir esse incidente? Essa decisão não poderá ser alterada."}
            </p>
            {confirmError && <p className={styles.modalError}>{confirmError}</p>}
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setPendingAction(null)}
                disabled={confirmando}
                data-testid={
                  pendingAction === "arquivar" ? "btn-arquivar-cancelar" : "btn-concluir-cancelar"
                }
              >
                Não
              </button>
              <button
                className={styles.saveBtnDanger}
                onClick={handleConfirmar}
                disabled={confirmando}
                data-testid={
                  pendingAction === "arquivar" ? "btn-arquivar-confirmar" : "btn-concluir-confirmar"
                }
              >
                {confirmando ? "Salvando..." : "Sim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
