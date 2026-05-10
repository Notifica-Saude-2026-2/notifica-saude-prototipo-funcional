import { IncidentPage } from "./IncidentPage";

export default function AdminDashboard() {
  return <IncidentPage defaultFilters={{ sort: "recente" }} />;
}
