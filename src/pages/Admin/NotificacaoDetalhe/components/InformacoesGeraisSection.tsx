import Tooltip from "@mui/material/Tooltip";
import { EditIcon } from "../../../../assets/icons/EditIcon";
import { LockClosedIcon } from "../../../../assets/icons/LockClosedIcon";
import { useAuth } from "../../../../hooks/useAuth";
import { STATUS_EDITAVEIS, motivoEdicaoBloqueada } from "../../../../constants/notificacaoStatus";
import type { NotificacaoDetalheDTO } from "../../../../types/notificacaoDetalhe";
import { InfoField } from "./InfoField";
import { useEffect } from "react";
import { registrarConsultaProntuario } from "../../../../services/notificacaoDetalheService";
import styles from "../NotificacaoDetalhe.module.css";

const PERFIS_EDITORES = new Set(["NSP", "ADMINISTRADOR"]);

type Props = {
  detalhe: NotificacaoDetalheDTO;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  /** true quando a análise é conduzida pelo gestor do setor (veio de um encaminhamento). */
  analiseViaEncaminhamento: boolean;
  onProntuarioConsultado: () => void;
};

export function InformacoesGeraisSection({
  detalhe,
  isOpen,
  onToggle,
  onEdit,
  analiseViaEncaminhamento,
  onProntuarioConsultado,
}: Props) {
  const { usuario } = useAuth();
  // US-1.1 CA06 — o nº do prontuário/atendimento só aparece para o NSP e para quem conduz a análise
  // (o gestor do setor, quando a análise veio de um encaminhamento).
  const perfil = usuario?.perfil ?? "";
  const podeVerProntuario =
    PERFIS_EDITORES.has(perfil) || (perfil === "GESTOR_AREA" && analiseViaEncaminhamento);
  const exibeProntuario =
    detalhe.paciente.envolvido && podeVerProntuario && !!detalhe.paciente.prontuario;

  // O número fica visível para quem pode vê-lo, e cada acesso ao detalhe que o exibe é registrado
  // no histórico (uma vez por abertura da página, e não a cada vez que a seção é expandida).
  useEffect(() => {
    if (!exibeProntuario) return;
    registrarConsultaProntuario(detalhe.id).then(onProntuarioConsultado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detalhe.id, exibeProntuario]);
  const temPermissao = PERFIS_EDITORES.has(usuario?.perfil ?? "");
  const podeEditar = temPermissao && STATUS_EDITAVEIS.has(detalhe.statusRaw);
  const estaBloqueada = !STATUS_EDITAVEIS.has(detalhe.statusRaw);

  return (
    <div className={styles.section}>
      <div
        className={styles.sectionHeader}
        onClick={onToggle}
        data-testid="section-info-gerais-toggle"
      >
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
              <button
                className={styles.editButton}
                data-testid="btn-edit-info-gerais"
                onClick={onEdit}
              >
                <EditIcon width={15} stroke="484848" /> Editar
              </button>
            )}
            {estaBloqueada && (
              <Tooltip title={motivoEdicaoBloqueada(detalhe.statusRaw)} placement="left">
                <span className={styles.bloqueadoBadge}>
                  <LockClosedIcon width={11} fill="c8850a" /> Edição bloqueada
                </span>
              </Tooltip>
            )}
          </div>

          <div className={styles.infoGrid}>
            <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
              <div className={styles.fieldHeader}>Descrição</div>
              <div className={styles.fieldValue}>{detalhe.descricao || "---"}</div>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
              <div className={styles.fieldHeader}>Medidas adotadas imediatamente</div>
              <div className={styles.fieldValue}>{detalhe.medidasImediatas || "Não informado"}</div>
            </div>
          </div>

          <div className={`${styles.infoGrid} ${styles.infoGridThree}`}>
            <InfoField label="Data do incidente" value={detalhe.dataIncidente} />
            <InfoField label="Horário" value={detalhe.horario} />
            <InfoField label="Turno" value={detalhe.turno} />
          </div>

          <div className={styles.infoGrid}>
            <InfoField label="Instituição" value={detalhe.unidade} />
            <InfoField label="Setor" value={detalhe.setor} />
          </div>

          {detalhe.paciente.envolvido && podeVerProntuario && (
            <div className={styles.infoGrid}>
              <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
                <div className={styles.fieldHeader}>Nº do prontuário ou do atendimento</div>
                <div className={styles.fieldValue} data-testid="prontuario-valor">
                  {detalhe.paciente.prontuario || "---"}
                </div>
              </div>
            </div>
          )}

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
