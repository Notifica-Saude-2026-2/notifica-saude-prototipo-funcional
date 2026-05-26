import { IncidentPage } from "./IncidentPage";

export default function AdminArquivados() {
  return (
    <IncidentPage
      defaultFilters={{ status: "ARQUIVADA", sort: "recente" }}
      lockedFilters={{ status: "ARQUIVADA" }}
    />
  );
}
