import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProductCard({ product }: { product: any }) {
  const { t } = useTranslation();
    return (
        <Link to={`/product/${product.id}`} className="group h-full flex flex-col">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 transition-all group-hover:shadow-md group-hover:border-brand-dark flex flex-col flex-1">
                <div className="w-full aspect-[4/3] bg-stone-100 relative overflow-hidden shrink-0">
                    {product.main_image ? (
                        <img src={product.main_image} alt={product.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm font-medium">No image</div>
                    )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-stone-800 line-clamp-2 min-h-[40px] leading-tight mb-2">{product.title || 'Untitled Product'}</h3>
                    <div className="flex items-center justify-between mb-3 mt-auto">
                        <span className="font-extrabold text-lg text-brand-dark">₹{product.price || 0}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-stone-500 mt-auto pt-3 border-t border-stone-100">
                        <span className="font-bold text-stone-700">{product.artisan_name || t('auth.artisan')}</span>
                        {product.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="line-clamp-1">{product.location}</span>
                            </div>
                        )}
                        {product.craft_type && (
                            <span className="inline-block px-2 py-1 bg-stone-100 rounded font-bold text-stone-600 w-max mt-1">{product.craft_type}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
