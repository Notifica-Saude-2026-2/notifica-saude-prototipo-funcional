import { IncidentPage } from "./IncidentPage";

export default function AdminEncaminhados() {
  return (
    <IncidentPage
      defaultFilters={{ status: "ENCAMINHADA_SETOR", sort: "recente" }}
      lockedFilters={{ status: "ENCAMINHADA_SETOR" }}
    />
  );
}
