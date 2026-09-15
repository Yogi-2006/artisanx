import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';

export function AppLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-surface-container">
            <header className="p-4 border-b border-outline-variant/20 bg-surface flex justify-between items-center">
                <h1 className="font-bold text-on-surface text-xl">ArtisanX</h1>
                <LanguageSwitcher />
            </header>
            <main className="flex-1 p-4 bg-surface-container-lowest">
                <Outlet />
            </main>
            <MobileNav />
        </div>
    );
}
