import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh' }}>
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          background: 'var(--bg)',
          padding: '28px 36px 60px',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
