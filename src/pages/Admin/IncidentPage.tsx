import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout/AdminLayout";
import { FiltersBar } from "../../components/admin/FiltersBar/FiltersBar";
import { IncidentList } from "../../components/admin/IncidentList/IncidentList";
import { useIncidents } from "../../hooks/useIncidents";
import { useAuth } from "../../hooks/useAuth";
import { fetchSetoresParaUnidade } from "../../hooks/useCamposFormulario";
import { useEffect } from "react";
import type { FetchIncidentsParams } from "../../services/incidentService";

type Props = {
  defaultFilters?: FetchIncidentsParams;
  lockedFilters?: Partial<FetchIncidentsParams>;
};

export function IncidentPage({ defaultFilters = { sort: "recente" }, lockedFilters }: Props) {
  const { usuario } = useAuth();
  const [filters, setFilters] = useState<FetchIncidentsParams>(defaultFilters);
  const [setores, setSetores] = useState<{ id: string; valor: string }[]>([]);
  const { incidents, loading, error } = useIncidents(filters);

  useEffect(() => {
    if (usuario?.unidade_id) {
      fetchSetoresParaUnidade(usuario.unidade_id).then(setSetores);
    }
  }, [usuario?.unidade_id]);

  function handleFilterChange(partial: Partial<FetchIncidentsParams>) {
    setFilters((prev) => ({ ...prev, ...partial, ...lockedFilters, page: 1 }));
  }

  return (
    <AdminLayout>
      <FiltersBar
        search={filters.search ?? ""}
        sort={filters.sort ?? "recente"}
        tipoIncidente={filters.tipo_incidente ?? ""}
        grauDano={filters.grau_dano ?? ""}
        setorId={filters.setor_id ?? ""}
        setores={setores}
        onSearchChange={(v) => handleFilterChange({ search: v || undefined })}
        onSortChange={(v) => handleFilterChange({ sort: v })}
        onTipoIncidenteChange={(v) =>
          handleFilterChange({
            tipo_incidente: v || undefined,
            grau_dano: v === "EVENTO_ADVERSO" ? filters.grau_dano : undefined,
          })
        }
        onGrauDanoChange={(v) => handleFilterChange({ grau_dano: v || undefined })}
        onSetorChange={(v) => handleFilterChange({ setor_id: v || undefined })}
      />

      {loading && (
        <p style={{ padding: "24px", textAlign: "center", color: "#6b6375" }}>
          Carregando notificações...
        </p>
      )}

      {error && (
        <p style={{ padding: "24px", textAlign: "center", color: "#c62828" }}>
          Erro ao carregar notificações: {error}
        </p>
      )}

      {!loading && !error && <IncidentList incidents={incidents} />}
    </AdminLayout>
  );
}
