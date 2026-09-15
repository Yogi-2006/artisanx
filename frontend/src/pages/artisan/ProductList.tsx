import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ArrowLeft, Copy } from 'lucide-react';
import api from '../../lib/api';
import BottomNav from '../../components/BottomNav';

export default function ProductList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'published' | 'draft'>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [tab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const statusParam = tab === 'all' ? '' : `?status=${tab}`;
      const { data } = await api.get(`/products/my${statusParam}`);
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setDeleteId(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoading(true);
      await api.post(`/products/${id}/duplicate`);
      fetchProducts();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative pb-24 font-sans text-on-surface bg-surface-container-lowest">
      {/* Header */}
      <div className="bg-surface px-6 pt-10 pb-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/artisan')} className="p-2 -ml-2 rounded-full hover:bg-stone-100">
            <ArrowLeft size={24} className="text-on-surface" />
          </button>
          <h1 className="text-xl font-bold">{t('common.products')}</h1>
        </div>

        {/* Tabs */}
        <div className="flex mt-6 space-x-6 border-b border-stone-200">
          <button 
            onClick={() => setTab('all')}
            className={`pb-3 font-bold text-sm ${tab === 'all' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}
          >
            {t('products.all')}
          </button>
          <button 
            onClick={() => setTab('published')}
            className={`pb-3 font-bold text-sm ${tab === 'published' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}
          >
            {t('products.published')}
          </button>
          <button 
            onClick={() => setTab('draft')}
            className={`pb-3 font-bold text-sm ${tab === 'draft' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}
          >
            {t('products.drafts')}
          </button>
        </div>
      </div>


      {/* Product List */}
      <div className="p-6 space-y-4 w-full">
        {loading ? (
          <div className="text-center py-10 text-stone-500">{t('common.loading')}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center">
               <span className="text-3xl text-stone-400">📦</span>
            </div>
            <p className="text-stone-500 font-medium">{t('products.no_products')}</p>
          </div>
        ) : (
          products.map(product => (
            <div 
              key={product.id} 
              className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant flex gap-4 items-center relative overflow-hidden group cursor-pointer"
              onClick={() => navigate(`/artisan/products/${product.id}/edit`)}
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-xl bg-stone-100 flex-shrink-0 overflow-hidden">
                {product.main_image ? (
                  <img src={product.main_image} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">{t('common.no_image')}</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-base truncate">{product.title || 'Untitled'}</h3>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${product.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                    {product.status === 'published' ? t('products.published') : t('products.drafts')}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mb-2 truncate">{product.category || 'No category'}</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-sm">
                    {product.price ? `₹${product.price}` : <span className="text-stone-400 font-normal">{t('products.no_price_set')}</span>}
                  </p>
                </div>
                
                {/* Readiness Score Bar */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${product.readiness_score >= 100 ? 'bg-green-500' : product.readiness_score > 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
                      style={{ width: `${Math.min(product.readiness_score || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-stone-400">{product.readiness_score || 0}%</span>
                </div>
              </div>

              {/* Actions Overlay (visible on hover or focus for desktop, swipe for mobile is abstracted here as standard buttons for simplicity) */}
              <div className="absolute top-0 right-0 h-full bg-white/90 p-2 flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-full group-hover:translate-x-0 backdrop-blur-sm border-l border-stone-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/artisan/products/${product.id}/edit`); }}
                  className="p-2 bg-stone-100 rounded-full text-brand-dark hover:bg-stone-200"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDuplicate(product.id); }}
                  className="p-2 bg-stone-100 rounded-full text-secondary hover:bg-stone-200"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}
                  className="p-2 bg-red-50 rounded-full text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => navigate('/artisan/products/new')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <BottomNav />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold mb-2">{t('products.delete_product')}</h2>
            <p className="text-stone-600 mb-8">{t('products.are_you_sure_delete')}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-4 font-bold text-stone-600 bg-stone-100 rounded-2xl"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-4 font-bold text-white bg-error rounded-2xl"
              >
                {t('products.delete_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
