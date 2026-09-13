import { Outlet } from 'react-router-dom';
import { MobileShell } from './MobileShell';

export function FacilitatorLayout() {
  return (
    <MobileShell>
      <Outlet />
    </MobileShell>
  );
}
