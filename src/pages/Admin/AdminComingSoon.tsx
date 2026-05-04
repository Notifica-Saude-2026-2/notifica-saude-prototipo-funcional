import { AdminLayout } from '../../components/admin/AdminLayout/AdminLayout';

export default function AdminComingSoon() {
  return (
    <AdminLayout>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p
          style={{
            fontSize: '1.25rem',
            color: '#6b6375',
            fontWeight: 500,
          }}
        >
          Em desenvolvimento!
        </p>
      </div>
    </AdminLayout>
  );
}
