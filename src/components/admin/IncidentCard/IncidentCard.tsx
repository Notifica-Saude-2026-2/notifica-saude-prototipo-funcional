import { useNavigate } from "react-router-dom";
import calendarIcon from "../../../assets/calendar.svg";
import type { Incident } from "../../../types/incident";
import styles from "./IncidentCard.module.css";

const STATUS_STYLES: Record<string, { bg: string; text: string; bar: string }> = {
  "Sem classificação": { bg: "#f5f5f5", text: "#757575", bar: "#bdbdbd" },
  Novo: { bg: "#e3f2fd", text: "#1565c0", bar: "#1565c0" },
  Classificado: { bg: "#e8eaf6", text: "#283593", bar: "#3949ab" },
  "Em análise": { bg: "#fff8e1", text: "#e65100", bar: "#f58220" },
  Encaminhado: { bg: "#f3e5f5", text: "#6a1b9a", bar: "#6a1b9a" },
  Resolvido: { bg: "#e8f5e9", text: "#2e7d32", bar: "#3FA35C" },
};

const DEFAULT_STYLE = { bg: "#f5f5f5", text: "#616161", bar: "#bdbdbd" };

const DAMAGE_LABELS: Record<string, string> = {
  SEM_CLASSIFICACAO: "Não classificado",
  LEVE: "Leve",
  MODERADO: "Moderado",
  GRAVE: "Grave",
  OBITO: "Óbito",
  NEVER_EVENT: "Never Event",
};

const DAMAGE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  SEM_CLASSIFICACAO: { color: "#757575", bg: "#f5f5f5", border: "#e0e0e0" },
  LEVE: { color: "#069bd6", bg: "#f0f9ff", border: "#b3e5fc" },
  MODERADO: { color: "#009439", bg: "#f0fff4", border: "#c6f6d5" },
  GRAVE: { color: "#facd07", bg: "#fffdf0", border: "#fef3c7" },
  OBITO: { color: "#fc7600", bg: "#fffaf0", border: "#feebc8" },
  NEVER_EVENT: { color: "#ff0f17", bg: "#fff5f5", border: "#fed7d7" },
};

type Props = {
  incident: Incident;
};

export function IncidentCard({ incident }: Props) {
  const navigate = useNavigate();
  const statusStyle = STATUS_STYLES[incident.status] ?? DEFAULT_STYLE;
  const damageStyle = DAMAGE_STYLES[incident.damageLevel] ?? DAMAGE_STYLES.SEM_CLASSIFICACAO;

  function handleClick() {
    navigate(`/incident/${incident.id}`);
  }

  return (
    <div
      className={styles.card}
      data-testid={`incident-card-${incident.id}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <div
        className={styles.colorBar}
        style={{ backgroundColor: statusStyle.bar }}
        aria-hidden="true"
      />
      <div className={styles.left}>
        <div className={styles.topRow}>
          <span className={styles.id}>#{incident.id.slice(0, 8).toUpperCase()}</span>
          <span className={styles.date}>
            <img src={calendarIcon} alt="" width={13} height={13} className={styles.calendarIcon} />
            {incident.date}
          </span>
        </div>

        <div className={styles.statusRow}>
          <strong className={styles.label}>Status:</strong>
          <span
            className={styles.statusBadge}
            style={{ background: statusStyle.bg, color: statusStyle.text }}
          >
            {incident.status}
          </span>

          <span className={styles.sectorGroup}>
            <strong className={styles.label}>Setor:</strong>
            <span className={styles.sectorValue}>{incident.sector}</span>
          </span>
        </div>

        <p className={styles.description}>
          <strong className={styles.label}>Descrição:</strong>{" "}
          {incident.description && incident.description.length > 200
            ? incident.description.slice(0, 200) + "..."
            : incident.description}
        </p>
      </div>

      <div className={styles.right}>
        <span className={styles.rightItem}>
          <strong className={styles.label}>Responsável:</strong>{" "}
          <span className={styles.rightValue}>{incident.responsavel ?? "—"}</span>
        </span>
        <span className={styles.rightItem}>
          <strong className={styles.label}>Grau de dano:</strong>{" "}
          <span
            className={styles.damageBadge}
            style={{
              color: damageStyle.color,
              backgroundColor: damageStyle.bg,
              borderColor: damageStyle.border,
            }}
          >
            {DAMAGE_LABELS[incident.damageLevel] || incident.damageLevel}
          </span>
        </span>
      </div>
    </div>
  );
}
