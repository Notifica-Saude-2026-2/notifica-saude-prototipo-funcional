import { useState } from 'react';
import { IncidentCard } from '../IncidentCard/IncidentCard';
import type { Incident } from '../../../mocks/incidents';
import styles from './IncidentList.module.css';

const PAGE_SIZE = 5;

type Props = {
  incidents: Incident[];
};

export function IncidentList({ incidents }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(incidents.length / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = incidents.slice(startIdx, startIdx + PAGE_SIZE);

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  function goTo(page: number) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  if (incidents.length === 0) {
    return (
      <div className={styles.empty}>Nenhuma notificação encontrada.</div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {pageItems.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            data-testid="pagination-prev"
            className={styles.pageBtn}
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            ‹ Anterior
          </button>

          {pageNumbers.map((item, idx) =>
            item === '...' ? (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                key={item}
                data-testid={`pagination-page-${item}`}
                className={`${styles.pageBtn} ${currentPage === item ? styles.active : ''}`}
                onClick={() => goTo(item as number)}
                aria-current={currentPage === item ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}

          <button
            data-testid="pagination-next"
            className={styles.pageBtn}
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Próxima página"
          >
            Próxima ›
          </button>
        </div>
      )}
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}
