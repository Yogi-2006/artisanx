import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../../lib/api';
import ProductCard from '../../components/buyer/ProductCard';
import { useTranslation } from 'react-i18next';

export default function CataloguePage() {
  const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    
    // Filters state
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        sort_by: searchParams.get('sort_by') || 'newest',
    });

    const categories = ['All', 'Weaving', 'Pottery', 'Woodwork', 'Textile', 'Jewelry', 'Metalwork', 'Leather'];

    useEffect(() => {
        fetchProducts(1, true);
    }, [filters.category, filters.sort_by, searchParams.get('search')]); 

    const fetchProducts = async (pageNumber: number, reset: boolean = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category && filters.category !== 'All') params.append('category', filters.category);
            params.append('sort_by', filters.sort_by);
            params.append('page', pageNumber.toString());
            params.append('per_page', '12');

            const res = await api.get(`/products/catalogue/list?${params.toString()}`);
            if (reset) {
                setProducts(res.data.items);
            } else {
                setProducts(prev => [...prev, ...res.data.items] as any);
            }
            setHasMore(res.data.items.length === 12);
            setPage(pageNumber);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts(1, true);
        setSearchParams({ search: filters.search, category: filters.category, sort_by: filters.sort_by });
    };

    return (
        <div className="w-full relative pb-20">
            <div className="bg-white px-6 py-4 sticky top-0 z-10 shadow-sm flex flex-col gap-4">
            <div className="flex gap-3">
                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-stone-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark transition-all"
                    />
                    <Search className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                </form>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 rounded-xl border flex-shrink-0 transition-all ${showFilters ? 'bg-brand-dark border-brand-dark text-white' : 'bg-white border-stone-200 text-stone-600 hover:border-brand-dark'}`}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </div>
            </div>
            
            {showFilters && (
                <div className="bg-white px-6 py-4 border-b border-stone-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-stone-800">Filters</h3>
                        <button onClick={() => setShowFilters(false)}><X className="w-5 h-5 text-stone-400" /></button>
                    </div>
                    
                    <div className="mb-4">
                        <label className="text-xs font-bold text-stone-500 uppercase block mb-2">{t('products.category')}</label>
                        <select 
                            value={filters.category}
                            onChange={(e) => setFilters({...filters, category: e.target.value})}
                            className="w-full p-2 border border-stone-200 rounded-2xl text-sm bg-brand-bg"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <label className="text-xs font-bold text-stone-500 uppercase block mb-2">Sort By</label>
                        <select 
                            value={filters.sort_by}
                            onChange={(e) => setFilters({...filters, sort_by: e.target.value})}
                            className="w-full p-2 border border-stone-200 rounded-2xl text-sm bg-brand-bg"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="p-6">
                {products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
                        </div>
                        {hasMore && (
                            <div className="mt-8 flex justify-center">
                                <button 
                                    onClick={() => fetchProducts(page + 1)}
                                    disabled={loading}
                                    className="px-6 py-2 border border-brand-dark text-brand-dark rounded-full font-bold hover:bg-brand-dark hover:text-white transition-colors"
                                >
                                    {loading ? t('common.loading') : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    !loading && (
                        <div className="text-center py-20">
                            <p className="text-stone-500 font-medium">No products found matching your criteria.</p>
                        </div>
                    )
                )}
                {loading && products.length === 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-stone-200 animate-pulse aspect-[3/4] rounded-2xl"></div>)}
                    </div>
                )}
            </div>
        </div>
    );
}
