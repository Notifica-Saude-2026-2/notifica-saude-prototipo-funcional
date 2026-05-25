import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { arquivarNotificacao } from "../../../../services/notificacaoDetalheService";
import { EllipsisVerticalIcon } from "../../../../assets/icons/EllipsisVerticalIcon";
import { ApiError } from "../../../../services/api";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import { getStatusColors } from "../../../../utils/statusColors";
import styles from "../NotificacaoDetalhe.module.css";

type Props = {
  detalhe: NotificacaoDetalheDTO;
  onArquivarSuccess: () => void;
};

export function NotificacaoHeader({ detalhe, onArquivarSuccess }: Props) {
  const statusColors = getStatusColors(detalhe.statusRaw);
  const { usuario } = useAuth();

  const podeArquivar =
    (usuario?.perfil === "NSP" || usuario?.perfil === "ADMINISTRADOR") &&
    detalhe.statusRaw !== "ARQUIVADA";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [arquivando, setArquivando] = useState(false);
  const [arquivarError, setArquivarError] = useState<string | null>(null);

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

  async function handleArquivar() {
    setArquivando(true);
    setArquivarError(null);
    try {
      await arquivarNotificacao(detalhe.id);
      setConfirmOpen(false);
      onArquivarSuccess();
    } catch (err) {
      let msg = "Erro ao arquivar. Tente novamente.";
      if (err instanceof ApiError && err.status === 409) {
        msg = "Transição de status inválida para arquivamento.";
      }
      setArquivarError(msg);
    } finally {
      setArquivando(false);
    }
  }

  function openConfirm() {
    setDropdownOpen(false);
    setArquivarError(null);
    setConfirmOpen(true);
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
                    <button
                      className={styles.contextDropdownItem}
                      onClick={openConfirm}
                      data-testid="btn-arquivar-notificacao"
                    >
                      Arquivar notificação
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className={styles.overlay} onClick={() => !arquivando && setConfirmOpen(false)}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <p className={styles.confirmText}>
              Tem certeza que deseja arquivar essa notificação? Essa decisão não poderá ser
              alterada.
            </p>
            {arquivarError && <p className={styles.modalError}>{arquivarError}</p>}
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setConfirmOpen(false)}
                disabled={arquivando}
                data-testid="btn-arquivar-cancelar"
              >
                Não
              </button>
              <button
                className={styles.saveBtnDanger}
                onClick={handleArquivar}
                disabled={arquivando}
                data-testid="btn-arquivar-confirmar"
              >
                {arquivando ? "Arquivando..." : "Sim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
