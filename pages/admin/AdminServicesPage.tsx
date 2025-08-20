

import React, { useState, useContext, useEffect, useReducer } from 'react';
import { supabase } from '../../supabaseClient';
import { Service, BookingConfig, FormField, DocumentRequirement } from '../../types';
import { ServiceContext } from '../../context/ServiceContext';
import IconMap, { iconList } from '../../components/IconMap';
import { Json, Database } from '../../database.types';

// --- Form Reducer for complex state in modal ---
type FormState = Omit<Service, 'id' | 'subServices'>;
type FormAction = 
    | { type: 'SET_FIELD'; field: keyof FormState; value: any }
    | { type: 'ADD_FORM_FIELD' }
    | { type: 'REMOVE_FORM_FIELD'; index: number }
    | { type: 'UPDATE_FORM_FIELD'; index: number; field: keyof FormField; value: any }
    | { type: 'ADD_DOC_REQ' }
    | { type: 'REMOVE_DOC_REQ'; index: number }
    | { type: 'UPDATE_DOC_REQ'; index: number; field: keyof DocumentRequirement; value: any };

function formReducer(state: FormState, action: FormAction): FormState {
    const newState = { ...state, booking_config: { ...state.booking_config, form_fields: [...(state.booking_config?.form_fields || [])], document_requirements: [...(state.booking_config?.document_requirements || [])] }};
    const { form_fields, document_requirements } = newState.booking_config!;

    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        case 'ADD_FORM_FIELD':
            form_fields.push({ id: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false });
            return newState;
        case 'REMOVE_FORM_FIELD':
            form_fields.splice(action.index, 1);
            return newState;
        case 'UPDATE_FORM_FIELD':
            form_fields[action.index] = { ...form_fields[action.index], [action.field]: action.value };
            return newState;
        case 'ADD_DOC_REQ':
            document_requirements.push({ id: `doc_${Date.now()}`, name: 'New Document', description: 'Description' });
            return newState;
        case 'REMOVE_DOC_REQ':
            document_requirements.splice(action.index, 1);
            return newState;
        case 'UPDATE_DOC_REQ':
            document_requirements[action.index] = { ...document_requirements[action.index], [action.field]: action.value };
            return newState;
        default: return state;
    }
}

// --- ServiceFormModal Component ---
const ServiceFormModal: React.FC<{
    service?: Service | null;
    parentId?: number | null;
    allServices: Service[];
    onClose: () => void;
    onSave: () => void;
}> = ({ service, parentId, allServices, onClose, onSave }) => {
    const initialState: FormState = {
        name: service?.name || '',
        description: service?.description || '',
        icon_name: service?.icon_name || iconList[0],
        parent_id: service ? service.parent_id : parentId,
        is_featured: service?.is_featured || false,
        display_order: service?.display_order || 0,
        is_bookable: service?.is_bookable || false,
        booking_config: service?.booking_config || { form_fields: [], document_requirements: [] },
        price: service?.price ?? null,
    };
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeConfigTab, setActiveConfigTab] = useState<'form' | 'docs'>('form');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const serviceData = {
            name: state.name,
            description: state.description,
            icon_name: state.icon_name,
            parent_id: state.parent_id,
            is_featured: state.is_featured,
            display_order: state.display_order,
            is_bookable: state.is_bookable,
            booking_config: state.is_bookable ? (state.booking_config as unknown as Json) : null,
            price: state.price,
        };

        try {
            let result;
            if (service) {
                result = await supabase.from('services').update(serviceData).eq('id', service.id);
            } else {
                result = await supabase.from('services').insert([serviceData]);
            }
            if (result.error) throw result.error;
            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Create a flattened list for the parent dropdown
    const flatServices: {id: number, name: string, level: number}[] = [];
    const generateFlatList = (services: Service[], level: number) => {
        services.forEach(s => {
            flatServices.push({ id: s.id, name: s.name, level: level });
            if (s.subServices) {
                generateFlatList(s.subServices, level + 1);
            }
        });
    };
    generateFlatList(allServices, 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-start z-50 p-4 animate-fade-in overflow-y-auto">
            <div className="bg-admin-surface-glass border border-admin-border rounded-2xl shadow-2xl w-full max-w-3xl my-8 flex flex-col mt-20">
                <div className="p-6 border-b border-admin-border">
                    <h2 className="text-2xl font-bold text-admin-heading">{service ? 'Edit' : 'Add'} Service</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Service Name" value={state.name} onChange={e => dispatch({type: 'SET_FIELD', field: 'name', value: e.target.value})} required className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                        <input type="number" placeholder="Display Order" value={state.display_order} onChange={e => dispatch({type: 'SET_FIELD', field: 'display_order', value: Number(e.target.value)})} required className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                    </div>
                    <textarea placeholder="Description" value={state.description || ''} onChange={e => dispatch({type: 'SET_FIELD', field: 'description', value: e.target.value})} className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg min-h-[80px] focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition"></textarea>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={state.icon_name} onChange={e => dispatch({type: 'SET_FIELD', field: 'icon_name', value: e.target.value})} className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition">
                            {iconList.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                        </select>
                        <select value={state.parent_id || ''} onChange={e => dispatch({type: 'SET_FIELD', field: 'parent_id', value: Number(e.target.value) || null})} className="w-full p-3 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition">
                            <option value="">None (Top-Level Service)</option>
                            {flatServices.filter(s => s.id !== service?.id).map(s => <option key={s.id} value={s.id}>{'--'.repeat(s.level)} {s.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-admin-border">
                         <label className="flex items-center gap-3 font-semibold text-admin-heading"><input type="checkbox" checked={state.is_bookable} onChange={e => dispatch({type: 'SET_FIELD', field: 'is_bookable', value: e.target.checked})} className="w-5 h-5 accent-admin-accent rounded"/> Is Bookable</label>
                    </div>

                    {/* Pricing */}
                     {state.is_bookable && (
                        <div>
                            <label className="text-sm font-semibold text-admin-light">Price (₹)</label>
                            <input 
                                type="number" 
                                placeholder="e.g., 50 or 0 for FREE" 
                                value={state.price ?? ''} 
                                onChange={e => dispatch({type: 'SET_FIELD', field: 'price', value: e.target.value ? Number(e.target.value) : null})} 
                                step="0.01"
                                min="0"
                                className="w-full mt-1 p-2 bg-admin-surface text-admin-heading border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition"
                            />
                        </div>
                    )}

                    {/* Dynamic Booking Config */}
                    {state.is_bookable && (
                        <div className="p-4 bg-admin-accent-light/30 dark:bg-admin-surface rounded-lg space-y-4 border border-admin-border">
                            <h3 className="font-bold text-admin-heading">Booking Configuration</h3>
                            <div className="flex gap-2 border-b border-admin-border">
                                <button type="button" onClick={() => setActiveConfigTab('form')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors ${activeConfigTab === 'form' ? 'bg-admin-surface text-admin-accent border-b-0' : 'text-admin-light border-b border-transparent'}`}>Form Fields</button>
                                <button type="button" onClick={() => setActiveConfigTab('docs')} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors ${activeConfigTab === 'docs' ? 'bg-admin-surface text-admin-accent border-b-0' : 'text-admin-light border-b border-transparent'}`}>Documents</button>
                            </div>
                            
                            {activeConfigTab === 'form' && <div className="space-y-3">
                                {(state.booking_config?.form_fields || []).map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 p-2 bg-admin-bg/50 rounded-md animate-list-item-in">
                                        <input value={field.label} onChange={e => dispatch({type:'UPDATE_FORM_FIELD', index, field: 'label', value: e.target.value})} placeholder="Label" className="p-2 bg-admin-bg text-admin-light border border-admin-border rounded text-sm focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition" />
                                        <input value={field.id} onChange={e => dispatch({type:'UPDATE_FORM_FIELD', index, field: 'id', value: e.target.value})} placeholder="Field ID (no spaces)" className="p-2 bg-admin-bg text-admin-light border border-admin-border rounded text-sm focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition" />
                                        <select value={field.type} onChange={e => dispatch({type:'UPDATE_FORM_FIELD', index, field: 'type', value: e.target.value})} className="p-2 bg-admin-bg text-admin-light border border-admin-border rounded text-sm focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition">
                                            <option value="text">Text</option><option value="email">Email</option><option value="date">Date</option><option value="tel">Phone</option><option value="number">Number</option>
                                        </select>
                                        <div className="flex items-center gap-2 text-admin-light">
                                          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={field.required} onChange={e => dispatch({type:'UPDATE_FORM_FIELD', index, field: 'required', value: e.target.checked})} className="accent-admin-accent" /> Req.</label>
                                          <button type="button" onClick={() => dispatch({type: 'REMOVE_FORM_FIELD', index})} className="text-red-500 hover:text-red-400 p-1 font-bold">&times;</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => dispatch({type: 'ADD_FORM_FIELD'})} className="text-sm font-semibold text-admin-accent hover:brightness-125">+ Add Form Field</button>
                            </div>}

                            {activeConfigTab === 'docs' && <div className="space-y-3">
                                {(state.booking_config?.document_requirements || []).map((doc, index) => (
                                    <div key={doc.id} className="grid grid-cols-[1fr,1fr,auto] gap-2 p-2 bg-admin-bg/50 rounded-md animate-list-item-in">
                                         <input value={doc.name} onChange={e => dispatch({type:'UPDATE_DOC_REQ', index, field: 'name', value: e.target.value})} placeholder="Document Name" className="p-2 bg-admin-bg text-admin-light border border-admin-border rounded text-sm focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition" />
                                         <input value={doc.description} onChange={e => dispatch({type:'UPDATE_DOC_REQ', index, field: 'description', value: e.target.value})} placeholder="Description" className="p-2 bg-admin-bg text-admin-light border border-admin-border rounded text-sm focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition" />
                                         <button type="button" onClick={() => dispatch({type: 'REMOVE_DOC_REQ', index})} className="text-red-500 hover:text-red-400 p-1 font-bold">&times;</button>
                                    </div>
                                ))}
                                 <button type="button" onClick={() => dispatch({type: 'ADD_DOC_REQ'})} className="text-sm font-semibold text-admin-accent hover:brightness-125">+ Add Document Requirement</button>
                            </div>}
                        </div>
                    )}
                </form>
                <div className="p-4 border-t border-admin-border bg-admin-surface/50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-admin-light/20 text-admin-heading font-semibold rounded-lg hover:bg-admin-light/30 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 bg-admin-accent text-white font-semibold rounded-lg hover:brightness-110 disabled:bg-slate-400 transition shadow-md hover:shadow-lg shadow-admin-accent/30">
                        {loading ? 'Saving...' : 'Save Service'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Service Tree Item ---
const ServiceListItem: React.FC<{
    service: Service;
    level: number;
    onEdit: (service: Service) => void;
    onDelete: (id: number) => void;
    onAddSub: (parentId: number) => void;
}> = ({ service, level, onEdit, onDelete, onAddSub }) => {
    const [isExpanded, setIsExpanded] = useState(level < 1); // Expand top levels by default
    const hasSubServices = service.subServices && service.subServices.length > 0;

    return (
        <div className="animate-list-item-in" style={{ animationDelay: `${level * 10}ms` }}>
            <div className="flex items-center bg-admin-surface/70 hover:bg-admin-accent-light transition-colors group" style={{ paddingLeft: `${1 + level * 2}rem` }}>
                 <div className="flex-1 flex items-center gap-4 py-3">
                    <button onClick={() => setIsExpanded(!isExpanded)} disabled={!hasSubServices} className="text-admin-light/50 disabled:invisible hover:text-admin-light">
                       <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <IconMap iconName={service.icon_name} className="h-6 w-6 text-admin-accent" />
                    <span className="font-bold text-admin-heading">{service.name}</span>
                    <span className="font-mono text-sm text-admin-light/40">#{service.id}</span>
                    {!service.is_bookable && <span className="text-xs font-bold uppercase text-admin-light/60 bg-admin-surface-glass border border-admin-border px-2 py-0.5 rounded-full">Category</span>}
                </div>
                <div className="px-4 py-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {service.is_bookable && <span className="font-bold text-sm text-green-500 font-mono">{service.price === 0 ? 'FREE' : `₹${service.price}`}</span>}
                    <button onClick={() => onAddSub(service.id)} className="text-sm font-semibold text-admin-accent hover:brightness-125 transition">Add Sub</button>
                    <button onClick={() => onEdit(service)} className="text-sm font-semibold text-admin-purple hover:brightness-125 transition">Edit</button>
                    <button onClick={() => onDelete(service.id)} className="text-sm font-semibold text-admin-pink hover:brightness-125 transition">Delete</button>
                </div>
            </div>
            {isExpanded && hasSubServices && (
                <div className="border-l border-admin-border/50">
                    {service.subServices?.map(sub => (
                        <ServiceListItem key={sub.id} service={sub} level={level + 1} onEdit={onEdit} onDelete={onDelete} onAddSub={onAddSub} />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Main Page Component ---
const AdminServicesPage: React.FC = () => {
  const { allServices, loading: serviceLoading, refetchServices } = useContext(ServiceContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);

  const openModal = (service: Service | null = null, parentId: number | null = null) => {
    setSelectedService(service);
    setCurrentParentId(parentId);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
      setIsModalOpen(false);
      setSelectedService(null);
      setCurrentParentId(null);
  };

  const handleSave = () => {
    refetchServices();
    closeModal();
  };

  const handleDelete = async (id: number) => {
      if (window.confirm("Are you sure you want to delete this service? This will also delete all its sub-services and may affect existing bookings.")) {
          await supabase.from('services').delete().eq('id', id);
          refetchServices();
      }
  };

  const handleAddSub = (parentId: number) => {
      openModal(null, parentId);
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-3xl font-extrabold text-admin-heading tracking-tight">Manage Services</h1>
             <button onClick={() => openModal()} className="px-6 py-3 bg-admin-accent text-white font-bold rounded-xl shadow-lg hover:brightness-110 hover:shadow-xl shadow-admin-accent/30 transition-all transform hover:-translate-y-0.5">
                Add Top-Level Service
            </button>
        </div>
        
        <div className="bg-admin-surface-glass border border-admin-border backdrop-blur-2xl rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
              {serviceLoading ? <div className="p-10 text-center animate-pulse text-admin-light">Loading services...</div> : (
                  <div className="divide-y divide-admin-border">
                      {allServices.map(service => (
                          <ServiceListItem 
                            key={service.id} 
                            service={service} 
                            level={0}
                            onEdit={openModal}
                            onDelete={handleDelete}
                            onAddSub={handleAddSub}
                          />
                      ))}
                  </div>
              )}
        </div>

        {isModalOpen && <ServiceFormModal service={selectedService} parentId={currentParentId} allServices={allServices} onClose={closeModal} onSave={handleSave} />}
    </div>
  );
};

export default AdminServicesPage;