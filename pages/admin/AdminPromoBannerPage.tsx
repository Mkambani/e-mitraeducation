
import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { PromoBannerSlide } from '../../types';
import { ServiceContext } from '../../context/ServiceContext';
import { Database } from '../../database.types';

// --- FormModal Component ---
const BannerFormModal: React.FC<{
    slide: Partial<PromoBannerSlide> | null;
    onClose: () => void;
    onSave: () => void;
}> = ({ slide, onClose, onSave }) => {
    const [formState, setFormState] = useState<Partial<PromoBannerSlide>>({
        title: slide?.title || '',
        subtitle: slide?.subtitle || '',
        code: slide?.code || '',
        is_active: slide?.is_active ?? true,
        display_order: slide?.display_order || 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field: keyof typeof formState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                title: formState.title || '',
                subtitle: formState.subtitle || '',
                code: formState.code || '',
                is_active: formState.is_active || false,
                display_order: formState.display_order || 0,
            };

            let result;
            if (slide && slide.id) {
                // Editing existing slide
                result = await supabase.from('promo_banners').update(payload).eq('id', slide.id);
            } else {
                // Creating new slide
                result = await supabase.from('promo_banners').insert(payload);
            }
            if (result.error) throw result.error;
            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-admin-surface-glass border-admin-border rounded-2xl shadow-2xl w-full max-w-lg mt-16">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-admin-border">
                        <h2 className="text-2xl font-bold text-admin-heading">{slide ? 'Edit' : 'Add'} Banner Slide</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <input type="text" placeholder="Title" value={formState.title} onChange={e => handleChange('title', e.target.value)} required className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                        <input type="text" placeholder="Subtitle" value={formState.subtitle} onChange={e => handleChange('subtitle', e.target.value)} required className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                        <input type="text" placeholder="Code / Call to Action" value={formState.code} onChange={e => handleChange('code', e.target.value)} required className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Display Order" value={formState.display_order} onChange={e => handleChange('display_order', Number(e.target.value))} required className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                            <label className="flex items-center justify-center gap-2 p-3 bg-admin-surface border border-admin-border rounded-lg font-semibold cursor-pointer text-admin-heading">
                                <input type="checkbox" checked={formState.is_active} onChange={e => handleChange('is_active', e.target.checked)} className="w-5 h-5 accent-admin-accent rounded"/> 
                                Is Active
                            </label>
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 border-t border-admin-border bg-admin-surface/50 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-admin-light/20 text-admin-heading font-semibold rounded-lg hover:bg-admin-light/30 transition">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-admin-accent text-white font-semibold rounded-lg hover:brightness-110 disabled:bg-slate-400 transition">
                            {loading ? 'Saving...' : 'Save Slide'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AdminPromoBannerPage: React.FC = () => {
  const [banners, setBanners] = useState<PromoBannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refetchServices } = useContext(ServiceContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<PromoBannerSlide | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError('');
    try {
        const { data, error } = await supabase
            .from('promo_banners')
            .select('*')
            .order('display_order', { ascending: true });
        if (error) throw error;
        setBanners((data as unknown as PromoBannerSlide[]) || []);
    } catch(err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openModal = (banner: PromoBannerSlide | null = null) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  const handleSave = () => {
    fetchBanners();
    refetchServices(); // This updates the live site
    closeModal();
  };

  const handleDelete = async (id: number) => {
      if (window.confirm("Are you sure you want to delete this banner slide?")) {
          const { error } = await supabase.from('promo_banners').delete().eq('id', id);
          if (error) {
            setError(error.message);
          } else {
            handleSave();
          }
      }
  };
  
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-3xl font-extrabold text-admin-heading tracking-tight">Promo Banner</h1>
             <button onClick={() => openModal()} className="px-5 py-2.5 bg-admin-accent text-white font-bold rounded-lg shadow-lg shadow-admin-accent/20 hover:brightness-110 transition-all transform hover:-translate-y-0.5">
                Add New Slide
            </button>
        </div>
        
        {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}

        <div className="bg-admin-surface-glass border border-admin-border backdrop-blur-2xl rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? <p className="p-6 text-center text-admin-light">Loading banners...</p> : (
                  <table className="w-full text-left text-sm">
                      <thead className="bg-admin-surface/70 text-admin-light">
                          <tr>
                              <th className="p-3 font-semibold">Title</th>
                              <th className="p-3 font-semibold hidden sm:table-cell">Subtitle</th>
                              <th className="p-3 font-semibold text-center">Order</th>
                              <th className="p-3 font-semibold text-center">Status</th>
                              <th className="p-3 w-36"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-admin-border">
                        {banners.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-admin-light/70">No banners created yet.</td></tr>
                        ) : (
                          banners.map(banner => (
                            <tr key={banner.id} className="hover:bg-admin-accent-light">
                                <td className="p-3 font-semibold text-admin-heading">{banner.title}</td>
                                <td className="p-3 hidden sm:table-cell text-admin-light">{banner.subtitle}</td>
                                <td className="p-3 text-center text-admin-light">{banner.display_order}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${banner.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                                        {banner.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-3 text-right space-x-4">
                                    <button onClick={() => openModal(banner)} className="text-admin-accent hover:underline font-semibold text-sm">Edit</button>
                                    <button onClick={() => handleDelete(banner.id)} className="text-admin-pink hover:underline font-semibold text-sm">Delete</button>
                                </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                  </table>
              )}
            </div>
        </div>

        {isModalOpen && <BannerFormModal slide={selectedBanner} onClose={closeModal} onSave={handleSave} />}
    </div>
  );
};

export default AdminPromoBannerPage;