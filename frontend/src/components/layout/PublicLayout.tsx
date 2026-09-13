import { Outlet } from 'react-router-dom';
import { MobileShell } from './MobileShell';

export function PublicLayout() {
  return (
    <MobileShell>
      <Outlet />
    </MobileShell>
  );
}
