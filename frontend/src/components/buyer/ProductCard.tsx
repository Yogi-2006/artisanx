import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProductCard({ product }: { product: any }) {
  const { t } = useTranslation();
    return (
        <Link to={`/product/${product.id}`} className="group h-full flex flex-col">
            <div className="bg-surface rounded-2xl overflow-hidden shadow-sm border border-outline-variant transition-all hover:shadow-md hover:border-primary flex flex-col h-full">
                <div className="w-full aspect-square bg-stone-100 relative overflow-hidden shrink-0">
                    {product.main_image ? (
                        <img src={product.main_image} alt={product.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm font-medium">No image</div>
                    )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-stone-800 line-clamp-2 min-h-[40px] leading-snug mb-2">{product.title || 'Untitled Product'}</h3>
                    <div className="mb-3">
                        <span className="font-extrabold text-lg text-primary">₹{product.price || 0}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-stone-500 mt-auto pt-3 border-t border-stone-100">
                        <span className="font-bold text-stone-700 truncate">{product.artisan_name || t('auth.artisan')}</span>
                        {product.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{product.location}</span>
                            </div>
                        )}
                        {product.craft_type && (
                            <span className="inline-block px-2 py-1 bg-stone-100 rounded font-medium text-stone-600 w-max max-w-full truncate mt-1">{product.craft_type}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
