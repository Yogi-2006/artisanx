import { Outlet } from 'react-router-dom';
import { MobileShell } from './MobileShell';

export function AuthLayout() {
  return (
    <MobileShell>
      <Outlet />
    </MobileShell>
  );
}
