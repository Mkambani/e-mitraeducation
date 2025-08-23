import React, { useState, useMemo, useContext } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { DocumentRequirement, Service } from '../types';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ServiceContext } from '../context/ServiceContext';
import { Database, Json } from '../database.types';

export type UploadedFileRecord = Record<string, { name: string; path: string; size: number }>;

interface DocumentUploaderProps {
  documentRequirements: DocumentRequirement[];
  service: Service;
  userDetails: Record<string, any>;
}

type SelectedFilesState = Record<string, File | null>;
type UploadErrorState = Record<string, string | null>;
type SubmissionState = 'idle' | 'submitting' | 'error';

const { useNavigate } = ReactRouterDOM as any;

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ documentRequirements, service, userDetails }) => {
  const { user } = useAuth();
  const { settings } = useContext(ServiceContext);
  const navigate = useNavigate();
  
  const [selectedFiles, setSelectedFiles] = useState<SelectedFilesState>(
    documentRequirements.reduce((acc, doc) => ({ ...acc, [doc.id]: null }), {})
  );
  const [uploadError, setUploadError] = useState<UploadErrorState>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const handleFileSelect = (docId: string, file: File) => {
    if (!file || !user) return;

    // File size validation
    const maxSizeMB = settings.max_document_upload_size_mb || 5; // Default to 5MB
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(prev => ({ ...prev, [docId]: `File is too large (max ${maxSizeMB}MB)` }));
      setSelectedFiles(prev => ({ ...prev, [docId]: null }));
      return;
    }

    setUploadError(prev => ({ ...prev, [docId]: null }));
    setSelectedFiles(prev => ({ ...prev, [docId]: file }));
  };
  
  const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(docId, e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>, docId: string) => {
    e.preventDefault();
    setIsDragging(docId);
  };
  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(null);
  };
  const onDrop = (e: React.DragEvent<HTMLLabelElement>, docId: string) => {
    e.preventDefault();
    setIsDragging(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(docId, e.dataTransfer.files[0]);
    }
  };

  const allDocsSelected = useMemo(() => {
    if (documentRequirements.length === 0) return true;
    return documentRequirements.every(doc => selectedFiles[doc.id] !== null);
  }, [documentRequirements, selectedFiles]);
  
  const handleProceed = async () => {
    if (!allDocsSelected || !user) return;
    setSubmissionState('submitting');
    
    const filesToUpload: Record<string, File> = {};
    for (const docId in selectedFiles) {
        const file = selectedFiles[docId];
        if (file) {
            filesToUpload[docId] = file;
        }
    }
    
    const finalPrice = service.price || 0;
    const isFreeService = finalPrice === 0;

    try {
        if (isFreeService) {
            // For free services, upload files and create booking immediately.
            const finalFiles: UploadedFileRecord = {};
            const uploadPromises = Object.entries(filesToUpload).map(async ([docId, file]) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${docId}-${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${service.id}/${fileName}`;
                
                const { error } = await supabase.storage.from('documents').upload(filePath, file);
                if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);
                
                finalFiles[docId] = { name: file.name, path: filePath, size: file.size };
            });

            await Promise.all(uploadPromises);

            const newBookingPayload: Database['public']['Tables']['bookings']['Insert'] = {
                user_id: user.id,
                service_id: service.id,
                status: 'Pending',
                user_details: userDetails as unknown as Json,
                uploaded_files: finalFiles as unknown as Json,
                payment_method: 'N/A (Free)',
                final_price: 0,
            };
            const { data, error } = await supabase.from('bookings').insert(newBookingPayload).select().single();
            if (error) throw error;
            const bookingId = (data as any).id;
            navigate('/booking-confirmed', { state: { serviceName: service.name, bookingId, price: finalPrice } });
        } else {
            // For paid services, pass File objects to the payment page to be uploaded after payment.
            navigate('/payment', { 
                state: { 
                    serviceId: service.id,
                    serviceName: service.name, 
                    price: finalPrice,
                    userDetails: userDetails,
                    filesToUpload: filesToUpload,
                }
            });
        }
    } catch (err) {
        console.error("Failed to submit booking:", err);
        setSubmissionState('error');
    }
  }
  
  const buttonLabel = (service.price || 0) === 0 ? 'Complete Booking' : 'Proceed to Payment';

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documentRequirements.map(doc => {
          const file = selectedFiles[doc.id];
          const error = uploadError[doc.id];
          const isSelected = !!file && !error;

          return (
            <div key={doc.id} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/50">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{doc.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{doc.description}</p>
                
                {isSelected && file ? (
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-emerald-300 dark:border-emerald-500/50">
                        <div className="flex items-center gap-3">
                           <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                           </div>
                           <div className="flex-1 min-w-0">
                               <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                           </div>
                            <label className="cursor-pointer">
                              <span className="text-xs font-semibold text-cyan-600 hover:underline">Change</span>
                              <input type="file" className="hidden" onChange={(e) => handleFileChange(doc.id, e)} />
                            </label>
                       </div>
                    </div>
                ) : (
                     <label 
                        onDragOver={(e) => onDragOver(e, doc.id)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, doc.id)}
                        className={`flex flex-col items-center justify-center w-full h-32 px-4 transition-colors duration-300 border-2 border-dashed rounded-xl cursor-pointer ${isDragging === doc.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30' : error ? 'border-red-400 bg-red-50 dark:bg-red-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-cyan-400 bg-white dark:bg-slate-700/50'}`}
                    >
                        {error ? (
                            <div className="flex flex-col items-center text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <span className="mt-2 text-sm font-medium text-red-600">{error}</span>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <span className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 text-center">Drag & Drop or <span className="text-cyan-600 dark:text-cyan-400 font-semibold">click to upload</span></span>
                            </div>
                        )}
                        <input type="file" className="hidden" onChange={(e) => handleFileChange(doc.id, e)} />
                    </label>
                )}
            </div>
          );
        })}
      </div>
      
      <div className="pt-10 text-center">
        <button
          onClick={handleProceed}
          disabled={!allDocsSelected || submissionState === 'submitting'}
          className="w-full sm:w-auto px-16 py-4 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:transform-none"
        >
          {submissionState === 'submitting' ? 'Submitting...' : buttonLabel}
        </button>
        {submissionState === 'error' && (
            <p className="text-red-600 mt-4">Failed to submit booking. Please try again.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;