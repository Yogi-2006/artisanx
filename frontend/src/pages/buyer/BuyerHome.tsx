import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronRight, LogOut } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import ProductCard from '../../components/buyer/ProductCard';
import { NotificationBell } from '../../components/notifications/NotificationBell';

export default function BuyerHome() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Weaving', 'Pottery', 'Woodwork', 'Textile', 'Jewelry', 'Metalwork', 'Leather'];

    useEffect(() => {
        api.get('/products/catalogue/list?sort_by=newest&per_page=6').then(res => {
            setFeatured(res.data.items || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/buyer/catalogue?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleCategory = (cat: string) => {
        if (cat === 'All') navigate('/buyer/catalogue');
        else navigate(`/buyer/catalogue?category=${encodeURIComponent(cat)}`);
    };

    return (
        <div className="w-full relative pb-20">
            <div className="bg-brand-dark px-6 py-8 rounded-b-[2rem] text-white shadow-md">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-3xl font-bold">Discover Artisan Craft</h1>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => { logout(); navigate('/login'); }} 
                            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            title="Log Out"
                        >
                            <LogOut size={18} className="text-white" />
                        </button>
                        <NotificationBell />
                    </div>
                </div>
                <p className="text-brand-light/80 mb-6">Authentic products straight from the creators.</p>
                
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-neon focus:bg-white/20 transition-all"
                    />
                    <Search className="absolute left-4 top-3.5 text-white/50 w-5 h-5" />
                </form>
            </div>

            <div className="mt-8 px-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-stone-800">Categories</h2>
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => handleCategory(cat)}
                            className="px-4 py-2 bg-white border border-stone-200 rounded-full whitespace-nowrap text-sm font-bold text-stone-600 hover:border-brand-dark hover:text-brand-dark transition-all"
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 px-6">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold text-stone-800">Featured</h2>
                    <Link to="/buyer/catalogue" className="text-sm font-bold text-brand-dark flex items-center hover:underline">
                        See All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                
                {loading ? (
                    <div className="flex justify-center p-8"><div className="animate-pulse w-8 h-8 bg-stone-300 rounded-full"></div></div>
                ) : featured.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {featured.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-stone-500">No products available yet.</div>
                )}
            </div>
        </div>
    );
}
