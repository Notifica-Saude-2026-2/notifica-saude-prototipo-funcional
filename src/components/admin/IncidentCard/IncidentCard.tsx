import { useNavigate } from "react-router-dom";
import calendarIcon from "../../../assets/calendar.svg";
import type { Incident } from "../../../mocks/incidents";
import styles from "./IncidentCard.module.css";

const STATUS_STYLES: Record<string, { bg: string; text: string; bar: string }> = {
  "Sem classificação": { bg: "#f5f5f5", text: "#757575", bar: "#bdbdbd" },
  Novo: { bg: "#e3f2fd", text: "#1565c0", bar: "#1565c0" },
  "Em análise": { bg: "#fff8e1", text: "#e65100", bar: "#f58220" },
  Encaminhado: { bg: "#f3e5f5", text: "#6a1b9a", bar: "#6a1b9a" },
  Resolvido: { bg: "#e8f5e9", text: "#2e7d32", bar: "#3FA35C" },
};

const DEFAULT_STYLE = { bg: "#f5f5f5", text: "#616161", bar: "#bdbdbd" };

type Props = {
  incident: Incident;
};

export function IncidentCard({ incident }: Props) {
  const navigate = useNavigate();
  const statusStyle = STATUS_STYLES[incident.status] ?? DEFAULT_STYLE;

  function handleClick() {
    navigate(`/incident/${incident.id.replace("#", "")}`);
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
          <span className={styles.id}>{incident.id}</span>
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
          <strong className={styles.label}>Descrição:</strong> {incident.description}
        </p>
      </div>
    </div>
  );
}
