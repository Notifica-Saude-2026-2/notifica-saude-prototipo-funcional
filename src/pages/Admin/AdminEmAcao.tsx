import { IncidentPage } from "./IncidentPage";

export default function AdminEmAcao() {
  return (
    <IncidentPage
      defaultFilters={{ status: "EM_ACAO", sort: "recente" }}
      lockedFilters={{ status: "EM_ACAO" }}
    />
  );
}
