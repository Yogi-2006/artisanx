import { Outlet } from 'react-router-dom';
import { MobileShell } from './MobileShell';

export function BuyerLayout() {
  return (
    <MobileShell>
      <Outlet />
    </MobileShell>
  );
}
