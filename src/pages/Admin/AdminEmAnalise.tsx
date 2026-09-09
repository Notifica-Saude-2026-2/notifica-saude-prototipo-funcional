import { IncidentPage } from "./IncidentPage";

export default function AdminEmAnalise() {
  return (
    <IncidentPage
      defaultFilters={{ status: "EM_ANALISE", sort: "recente" }}
      lockedFilters={{ status: "EM_ANALISE" }}
    />
  );
}
