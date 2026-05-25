import { IncidentPage } from "./IncidentPage";

export default function AdminResolvidos() {
  return (
    <IncidentPage
      defaultFilters={{ status: "ARQUIVADA", sort: "recente" }}
      lockedFilters={{ status: "ARQUIVADA" }}
    />
  );
}
