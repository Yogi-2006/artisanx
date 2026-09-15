import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, Star } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../../components/buyer/ProductCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ArtisanStorePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [artisanInfo, setArtisanInfo] = useState<any>(null);

    useEffect(() => {
        async function fetchStore() {
            try {
                // Fetch catalogue and filter by artisan_id
                // (In a real production app, we would have a dedicated endpoint)
                const res = await axios.get(`${API_URL}/products/catalogue/list`, {
                    params: { per_page: 100 }
                });
                
                const allItems = res.data.items || [];
                const artisanProducts = allItems.filter((p: any) => p.artisan_id === id);
                
                setProducts(artisanProducts);
                
                if (artisanProducts.length > 0) {
                    setArtisanInfo({
                        artisan_name: artisanProducts[0].artisan_name,
                        location: artisanProducts[0].location,
                        state: artisanProducts[0].state,
                        craft_type: artisanProducts[0].craft_type
                    });
                }
            } catch (err) {
                console.error("Failed to load store", err);
            } finally {
                setLoading(false);
            }
        }
        
        if (id) {
            fetchStore();
        }
    }, [id]);

    return (
        <div className="min-h-screen bg-surface-container-lowest pb-24">
            {/* Header / Cover */}
            <div className="bg-primary pt-8 pb-16 px-4 relative overflow-hidden text-on-primary">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                
                <div className="relative z-10 max-w-5xl mx-auto">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-on-primary/10 rounded-full flex items-center justify-center text-white mb-6 hover:bg-on-primary/20 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    {loading ? (
                        <div className="animate-pulse flex gap-4 items-center">
                            <div className="w-20 h-20 bg-on-primary/20 rounded-full"></div>
                            <div className="space-y-2">
                                <div className="h-6 w-32 bg-on-primary/20 rounded"></div>
                                <div className="h-4 w-24 bg-on-primary/20 rounded"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-5 items-center">
                            <div className="w-20 h-20 bg-white text-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                                <Store className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{artisanInfo?.artisan_name || 'Artisan Store'}</h1>
                                <div className="flex items-center gap-2 mt-2 text-primary-container">
                                    <MapPin className="w-4 h-4" />
                                    <span>{artisanInfo?.location || 'Unknown Location'}{artisanInfo?.state ? `, ${artisanInfo.state}` : ''}</span>
                                </div>
                                <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>New Seller (No ratings yet)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-6 mb-8">
                    <h2 className="text-lg font-bold text-on-surface mb-2">About this Store</h2>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                        Welcome to {artisanInfo?.artisan_name || 'this artisan'}'s official store. 
                        They specialize in {artisanInfo?.craft_type || 'handcrafted goods'}.
                    </p>
                    {/* Empty states for metrics */}
                    <div className="flex gap-6 mt-6 pt-6 border-t border-outline-variant/30">
                        <div>
                            <div className="text-2xl font-bold text-primary">--</div>
                            <div className="text-xs text-on-surface-variant">Orders Completed</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">--</div>
                            <div className="text-xs text-on-surface-variant">Avg. Rating</div>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-on-surface mb-4">Published Products ({products.length})</h2>
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-surface rounded-2xl border border-outline-variant">
                        <Store className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-on-surface">No Products Available</h3>
                        <p className="text-on-surface-variant text-sm mt-1">This artisan currently has no published products.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
