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
        image_url: slide?.image_url || null,
        mobile_image_url: slide?.mobile_image_url || null,
        link_url: slide?.link_url || '',
        is_active: slide?.is_active ?? true,
        display_order: slide?.display_order || 0,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(slide?.image_url || null);
    const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
    const [mobilePreviewUrl, setMobilePreviewUrl] = useState<string | null>(slide?.mobile_image_url || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMobileImageFile(file);
            setMobilePreviewUrl(URL.createObjectURL(file));
        }
    };


    const handleChange = (field: keyof typeof formState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let finalImageUrl = formState.image_url;
            let finalMobileImageUrl = formState.mobile_image_url;

            // Upload desktop image
            if (imageFile) {
                if (slide && slide.image_url) {
                    try {
                        const oldFilePath = new URL(slide.image_url).pathname.split('/promo-banners/')[1];
                        if (oldFilePath) await supabase.storage.from('promo-banners').remove([oldFilePath]);
                    } catch (e) { console.warn("Could not delete old desktop banner image.", e); }
                }
                const newFilePath = `public/desktop-${Date.now()}.${imageFile.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage.from('promo-banners').upload(newFilePath, imageFile);
                if (uploadError) throw new Error(`Desktop image upload failed: ${uploadError.message}`);
                finalImageUrl = supabase.storage.from('promo-banners').getPublicUrl(newFilePath).data.publicUrl;
            }

            // Upload mobile image
            if (mobileImageFile) {
                 if (slide && slide.mobile_image_url) {
                    try {
                        const oldFilePath = new URL(slide.mobile_image_url).pathname.split('/promo-banners/')[1];
                        if (oldFilePath) await supabase.storage.from('promo-banners').remove([oldFilePath]);
                    } catch (e) { console.warn("Could not delete old mobile banner image.", e); }
                }
                const newFilePath = `public/mobile-${Date.now()}.${mobileImageFile.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage.from('promo-banners').upload(newFilePath, mobileImageFile);
                if (uploadError) throw new Error(`Mobile image upload failed: ${uploadError.message}`);
                finalMobileImageUrl = supabase.storage.from('promo-banners').getPublicUrl(newFilePath).data.publicUrl;
            }


            const payload: Omit<Database['public']['Tables']['promo_banners']['Insert'], 'id' | 'created_at'> = {
                image_url: finalImageUrl,
                mobile_image_url: finalMobileImageUrl,
                link_url: formState.link_url || null,
                is_active: formState.is_active || false,
                display_order: formState.display_order || 0,
            };

            let result;
            if (slide && slide.id) {
                result = await supabase.from('promo_banners').update(payload).eq('id', slide.id);
            } else {
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
            <div className="bg-admin-card-bg border-admin-card-border rounded-xl shadow-2xl w-full max-w-2xl mt-16">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-admin-card-border">
                        <h2 className="text-xl font-bold text-admin-heading">{slide && slide.id ? 'Edit' : 'Add'} Banner Slide</h2>
                    </div>
                    <div className="p-6 space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-admin-light mb-2">Desktop Image (3:1)</label>
                                <div className="flex items-center gap-4 p-3 bg-admin-main-bg border border-admin-card-border rounded-lg">
                                    {previewUrl ? 
                                        <img src={previewUrl} alt="Desktop Banner preview" className="w-24 h-8 rounded object-cover bg-admin-main-bg/50" />
                                        : <div className="w-24 h-8 rounded bg-admin-main-bg/50 flex items-center justify-center text-xs text-admin-light/50">Desktop</div>
                                    }
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-admin-accent/20 file:text-admin-accent hover:file:bg-admin-accent/30"/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-admin-light mb-2">Mobile Image (16:9)</label>
                                <div className="flex items-center gap-4 p-3 bg-admin-main-bg border border-admin-card-border rounded-lg">
                                    {mobilePreviewUrl ? 
                                        <img src={mobilePreviewUrl} alt="Mobile Banner preview" className="w-16 h-9 rounded object-cover bg-admin-main-bg/50" />
                                        : <div className="w-16 h-9 rounded bg-admin-main-bg/50 flex items-center justify-center text-xs text-admin-light/50">Mobile</div>
                                    }
                                    <input type="file" accept="image/*" onChange={handleMobileFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-admin-accent/20 file:text-admin-accent hover:file:bg-admin-accent/30"/>
                                </div>
                            </div>
                        </div>

                        <input type="url" placeholder="Link URL (Optional)" value={formState.link_url || ''} onChange={e => handleChange('link_url', e.target.value)} className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />

                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Display Order" value={formState.display_order} onChange={e => handleChange('display_order', Number(e.target.value))} required className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                            <label className="flex items-center justify-center gap-2 p-3 bg-admin-main-bg border border-admin-card-border rounded-lg font-semibold cursor-pointer text-admin-heading">
                                <input type="checkbox" checked={formState.is_active} onChange={e => handleChange('is_active', e.target.checked)} className="w-5 h-5 accent-admin-accent rounded"/> 
                                Is Active
                            </label>
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 border-t border-admin-card-border bg-admin-main-bg/50 rounded-b-xl flex justify-end gap-3">
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

  return (
    <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-admin-card-border">
             <h2 className="text-xl font-bold text-admin-heading">Promo Banner Slides</h2>
             <button onClick={() => openModal()} className="px-4 py-2 bg-admin-accent text-white font-bold rounded-lg shadow-sm hover:bg-admin-accent/90 transition-all text-sm">
                Add New Slide
            </button>
        </div>
        
        {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}

        <div className="overflow-x-auto">
          {loading ? <p className="p-6 text-center text-admin-light">Loading banners...</p> : (
              <table className="w-full text-left text-sm">
                  <thead className="text-admin-light">
                      <tr>
                          <th className="p-3 font-semibold">Image Previews</th>
                          <th className="p-3 font-semibold">Link URL</th>
                          <th className="p-3 font-semibold text-center">Order</th>
                          <th className="p-3 font-semibold text-center">Status</th>
                          <th className="p-3 w-36"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-card-border">
                    {banners.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-admin-light/70">No banners created yet.</td></tr>
                    ) : (
                      banners.map(banner => (
                        <tr key={banner.id} className="hover:bg-admin-main-bg">
                            <td className="p-3">
                                <div className="flex items-center gap-2">
                                    {banner.image_url ? (
                                        <img src={banner.image_url} alt="Desktop Banner" className="w-20 h-10 rounded-md object-cover bg-admin-main-bg" />
                                    ) : (
                                        <div className="w-20 h-10 rounded-md bg-admin-main-bg flex items-center justify-center text-xs text-admin-light/50">Desktop</div>
                                    )}
                                    {banner.mobile_image_url ? (
                                        <img src={banner.mobile_image_url} alt="Mobile Banner" className="w-10 h-10 rounded-md object-cover bg-admin-main-bg" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-md bg-admin-main-bg flex items-center justify-center text-xs text-admin-light/50">Mobile</div>
                                    )}
                                </div>
                            </td>
                            <td className="p-3 text-admin-light truncate max-w-xs">{banner.link_url || 'No link'}</td>
                            <td className="p-3 text-center text-admin-light">{banner.display_order}</td>
                            <td className="p-3 text-center">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${banner.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {banner.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="p-3 text-right space-x-4">
                                <button onClick={() => openModal(banner)} className="text-admin-accent hover:underline font-semibold text-sm">Edit</button>
                            </td>
                        </tr>
                      ))
                    )}
                  </tbody>
              </table>
          )}
        </div>

        {isModalOpen && <BannerFormModal slide={selectedBanner} onClose={closeModal} onSave={handleSave} />}
    </div>
  );
};

export default AdminPromoBannerPage;