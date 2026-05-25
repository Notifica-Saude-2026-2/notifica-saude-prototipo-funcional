import { IncidentPage } from "./IncidentPage";

export default function AdminNovos() {
  return (
    <IncidentPage
      defaultFilters={{ status: "NOVA", sort: "recente" }}
      lockedFilters={{ status: "NOVA" }}
    />
  );
}
