import { useNavigate } from "react-router-dom";
import calendarIcon from "../../../assets/calendar.svg";
import type { Incident } from "../../../types/incident";
import { getStatusColors, GRAU_DANO_COLORS } from "../../../utils/statusColors";
import { GRAU_DANO_LABEL } from "../../../services/notificacaoDetalheService";
import styles from "./IncidentCard.module.css";

type Props = {
  incident: Incident;
};

export function IncidentCard({ incident }: Props) {
  const navigate = useNavigate();
  const statusStyle = getStatusColors(incident.statusRaw);
  const grauDanoStyle = incident.grauDano ? GRAU_DANO_COLORS[incident.grauDano] : null;
  const grauDanoLabel = incident.grauDano
    ? (GRAU_DANO_LABEL[incident.grauDano] ?? incident.grauDano)
    : null;

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
        {grauDanoLabel && grauDanoStyle && (
          <span className={styles.rightItem}>
            <strong className={styles.label}>Grau de dano:</strong>{" "}
            <span
              className={styles.damageBadge}
              style={{ background: grauDanoStyle.bg, color: grauDanoStyle.text }}
            >
              {grauDanoLabel}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
