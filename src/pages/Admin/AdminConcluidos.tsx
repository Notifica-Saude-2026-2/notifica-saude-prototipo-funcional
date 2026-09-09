import { IncidentPage } from "./IncidentPage";

export default function AdminConcluidos() {
  return (
    <IncidentPage
      defaultFilters={{ status: "CONCLUIDA", sort: "recente" }}
      lockedFilters={{ status: "CONCLUIDA" }}
    />
  );
}
