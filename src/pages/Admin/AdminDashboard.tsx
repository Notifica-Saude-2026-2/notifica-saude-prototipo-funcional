import { AdminLayout } from "../../components/admin/AdminLayout/AdminLayout";
import { FiltersBar } from "../../components/admin/FiltersBar/FiltersBar";
import { IncidentList } from "../../components/admin/IncidentList/IncidentList";
import { MOCK_INCIDENTS } from "../../mocks/incidents";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <FiltersBar />
      <IncidentList incidents={MOCK_INCIDENTS} />
    </AdminLayout>
  );
}
