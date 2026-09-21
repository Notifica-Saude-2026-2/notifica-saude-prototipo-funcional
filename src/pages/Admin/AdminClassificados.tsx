import { IncidentPage } from "./IncidentPage";

export default function AdminClassificados() {
  return (
    <IncidentPage
      defaultFilters={{ status: "CLASSIFICADA", sort: "recente" }}
      lockedFilters={{ status: "CLASSIFICADA" }}
    />
  );
}
