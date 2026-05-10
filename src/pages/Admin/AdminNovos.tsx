import { IncidentPage } from "./IncidentPage";

export default function AdminNovos() {
  return (
    <IncidentPage
      defaultFilters={{ status: "REGISTRADA", sort: "recente" }}
      lockedFilters={{ status: "REGISTRADA" }}
    />
  );
}
