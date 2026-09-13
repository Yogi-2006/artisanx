
import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';

export function AppLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="p-4 border-b flex justify-between">
                <h1 className="font-bold">ArtisanX</h1>
                <LanguageSwitcher />
            </header>
            <main className="flex-1 p-4">
                <Outlet />
            </main>
            <MobileNav />
        </div>
    );
}
