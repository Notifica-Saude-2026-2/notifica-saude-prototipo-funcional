import { useNavigate } from "react-router-dom";
import calendarIcon from "../../../assets/calendar.svg";
import type { Incident } from "../../../types/incident";
import { getStatusColors } from "../../../utils/statusColors";
import styles from "./IncidentCard.module.css";

type Props = {
  incident: Incident;
};

export function IncidentCard({ incident }: Props) {
  const navigate = useNavigate();
  const statusStyle = getStatusColors(incident.statusRaw);

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
          <span className={styles.id}>#{incident.codigo}</span>
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
      </div>
    </div>
  );
}
