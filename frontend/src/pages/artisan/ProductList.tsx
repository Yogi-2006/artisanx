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
    <div className="w-full relative pb-24 font-sans text-on-surface bg-surface min-h-screen">
      {/* Header */}
      <header className="bg-surface/90 backdrop-blur-md px-4 pt-10 pb-2 sticky top-0 z-20 border-b border-outline-variant/20">
        <div className="flex items-center space-x-4 mb-4">
          <button onClick={() => navigate('/artisan')} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft size={24} className="text-on-surface" />
          </button>
          <h1 className="text-xl font-bold">{t('common.products')}</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-2">
          <button 
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${tab === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {t('products.all')}
          </button>
          <button 
            onClick={() => setTab('published')}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${tab === 'published' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {t('products.published')}
          </button>
          <button 
            onClick={() => setTab('draft')}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${tab === 'draft' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            {t('products.drafts')}
          </button>
        </div>
      </header>


      {/* Product List */}
      <div className="p-4 space-y-4 w-full max-w-lg mx-auto">
        {loading ? (
          <div className="text-center py-10 text-on-surface-variant font-medium">{t('common.loading')}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-24 h-24 bg-surface-container-highest rounded-full mb-4 flex items-center justify-center">
               <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">inventory_2</span>
            </div>
            <p className="text-on-surface-variant font-bold">{t('products.no_products')}</p>
          </div>
        ) : (
          products.map(product => (
            <div 
              key={product.id} 
              className="bg-surface-container-lowest rounded-[20px] p-3 shadow-sm border border-outline-variant/30 flex gap-4 items-center relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => navigate(`/artisan/products/${product.id}/edit`)}
            >
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-2xl bg-surface-container-high flex-shrink-0 overflow-hidden border border-outline-variant/20">
                {product.main_image ? (
                  <img src={product.main_image} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50 text-xs font-medium">{t('common.no_image')}</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-extrabold text-on-surface text-base truncate">{product.title || 'Untitled'}</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${product.status === 'published' ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {product.status === 'published' ? t('products.published') : t('products.drafts')}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium truncate">{product.category || 'No category'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-black text-on-surface text-lg leading-none">
                    {product.price ? `₹${product.price}` : <span className="text-on-surface-variant/60 font-medium text-sm">{t('products.no_price_set')}</span>}
                  </p>
                </div>
                
                {/* Readiness Score Bar */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${product.readiness_score >= 100 ? 'bg-tertiary' : product.readiness_score > 50 ? 'bg-secondary' : 'bg-error'}`} 
                      style={{ width: `${Math.min(product.readiness_score || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant">{product.readiness_score || 0}% ready</span>
                </div>
              </div>

              {/* Actions Overlay */}
              <div className="absolute top-0 right-0 h-full bg-surface-container-lowest/90 p-2 flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-full group-hover:translate-x-0 backdrop-blur-md border-l border-outline-variant/30">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/artisan/products/${product.id}/edit`); }}
                  className="p-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDuplicate(product.id); }}
                  className="p-2 bg-surface-container rounded-full text-secondary hover:bg-surface-container-highest transition-colors"
                >
                  <Copy size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}
                  className="p-2 bg-error-container text-on-error-container rounded-full hover:opacity-90 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => navigate('/artisan/product/create')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-[20px] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border border-primary-container"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <BottomNav />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-2xl">delete</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">{t('products.delete_product')}</h2>
            <p className="text-on-surface-variant font-medium mb-8">{t('products.are_you_sure_delete')}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3.5 font-bold text-on-surface bg-surface-container-highest rounded-xl hover:bg-surface-container transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3.5 font-bold text-on-error bg-error rounded-xl hover:opacity-90 transition-opacity"
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
