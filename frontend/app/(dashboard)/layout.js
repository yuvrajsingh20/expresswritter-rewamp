import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <NotificationBell />
      {children}
    </div>
  );
}
