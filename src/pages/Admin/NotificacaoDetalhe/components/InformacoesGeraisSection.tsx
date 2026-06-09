import Tooltip from "@mui/material/Tooltip";
import { EditIcon } from "../../../../assets/icons/EditIcon";
import { LockClosedIcon } from "../../../../assets/icons/LockClosedIcon";
import { useAuth } from "../../../../hooks/useAuth";
import { STATUS_EDITAVEIS } from "../../../../constants/notificacaoStatus";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import { InfoField } from "./InfoField";
import styles from "../NotificacaoDetalhe.module.css";

const PERFIS_EDITORES = new Set(["NSP", "ADMINISTRADOR"]);

type Props = {
  detalhe: NotificacaoDetalheDTO;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
};

export function InformacoesGeraisSection({ detalhe, isOpen, onToggle, onEdit }: Props) {
  const { usuario } = useAuth();
  const temPermissao = PERFIS_EDITORES.has(usuario?.perfil ?? "");
  const podeEditar = temPermissao && STATUS_EDITAVEIS.has(detalhe.statusRaw);
  const estaBloqueada = !STATUS_EDITAVEIS.has(detalhe.statusRaw);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={onToggle} data-testid="section-info-gerais-toggle">
        Informações gerais
        <div className={`${styles.collapseIcon} ${isOpen ? styles.open : styles.closed}`} />
      </div>

      {isOpen && (
        <div className={styles.sectionContent} style={{ gap: 0 }}>
          <div className={styles.metaRow}>
            <span className={styles.metaText}>
              Última modificação registrada em: {detalhe.dataAtualizacao}
            </span>
            {podeEditar && (
              <button className={styles.editButton} data-testid="btn-edit-info-gerais" onClick={onEdit}>
                <EditIcon width={15} stroke="484848" /> Editar
              </button>
            )}
            {estaBloqueada && (
              <Tooltip title="Notificação encaminhada ao setor" placement="left">
                <span className={styles.bloqueadoBadge}>
                  <LockClosedIcon width={11} fill="c8850a" /> Edição bloqueada
                </span>
              </Tooltip>
            )}
          </div>

          <div className={styles.infoGrid}>
            <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
              <div className={styles.fieldHeader}>Descrição</div>
              <div className={styles.fieldValue}>
                {detalhe.descricao || "---"}
              </div>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <InfoField label="Data do incidente" value={detalhe.dataIncidente} />
            <InfoField label="Turno" value={detalhe.turno} />
          </div>

          <div className={styles.infoGrid}>
            <InfoField label="Instituição" value={detalhe.unidade} />
            <InfoField label="Setor" value={detalhe.setor} />
          </div>

          {detalhe.paciente.envolvido ? (
            <div className={styles.infoGrid}>
              <InfoField label="Faixa etária" value={detalhe.paciente.idade} />
              <InfoField label="Sexo" value={detalhe.paciente.sexo} />
            </div>
          ) : (
            <div className={styles.infoGrid}>
              <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
                <div className={styles.fieldHeader}>Paciente</div>
                <div className={`${styles.fieldValue} ${styles.naoPacienteTag}`}>
                  Não envolve o paciente
                </div>
              </div>
            </div>
          )}

          <div className={styles.infoGrid}>
            <InfoField label="Nome do notificante" value={detalhe.notificante.nome} />
            <InfoField label="Celular/E-mail" value={detalhe.notificante.contato} />
          </div>
        </div>
      )}
    </div>
  );
}
