import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const ClientGallery = () => {
  const { eventId } = useParams();
  
  const [galleryData, setGalleryData] = useState(null);
  const [error, setError] = useState('');
  const [activeFolderId, setActiveFolderId] = useState(null);
  
  const [images, setImages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const imageDictionary = useRef(new Map());
  const fetchAbortController = useRef(null);
  
  const selectionsRef = useRef(new Set());
  const folderSelectionsRef = useRef({}); 
  const [selectionCount, setSelectionCount] = useState(0);
  
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const observer = useRef();

  useEffect(() => {
    let isCurrent = true;

    api.get(`/galleries/public/${eventId}`)
      .then(res => {
        if (!isCurrent) return;
        setGalleryData(res.data);
        
        if (res.data.selectedIds) {
          selectionsRef.current = new Set(res.data.selectedIds);
          setSelectionCount(res.data.selectedIds.length);
        }
        if (res.data.selectionsByFolder) {
          folderSelectionsRef.current = res.data.selectionsByFolder;
        }

        if (res.data.folders?.length > 0) {
          setActiveFolderId(res.data.folders[0].id);
        } else {
          setIsLoadingInitial(false);
        }
      })
      .catch(() => {
        if (isCurrent) setError('Gallery link has expired or does not exist.');
      });

    return () => { isCurrent = false; };
  }, [eventId]);

  useEffect(() => {
    if (!activeFolderId) return;
    
    if (fetchAbortController.current) {
        fetchAbortController.current.abort();
    }
    fetchAbortController.current = new AbortController();
    
    setIsLoadingInitial(true);
    setImages([]);
    setNextPageToken(null);
    setLightboxIndex(-1);

    api.get(`/galleries/folder/${activeFolderId}/images`, {
        signal: fetchAbortController.current.signal
    })
      .then(res => {
        const fetchedImages = res.data.images || [];
        setImages(fetchedImages);
        setNextPageToken(res.data.next_page_token || null);
        
        const currentFolderName = galleryData?.folders?.find(f => f.id === activeFolderId)?.name || 'Uncategorized';
        
        fetchedImages.forEach(img => {
          imageDictionary.current.set(img.id, { ...img, folderId: activeFolderId, folderName: currentFolderName });
        });
      })
      .catch(err => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
            console.log('Fetch aborted for previous tab - isolating folder view.');
        } else {
            console.error("Error fetching folder images:", err);
            setImages([]);
        }
      })
      .finally(() => { setIsLoadingInitial(false); });

    return () => {
        if (fetchAbortController.current) {
            fetchAbortController.current.abort();
        }
    };
  }, [activeFolderId, galleryData]);

  const lastImageElementRef = useCallback(node => {
    if (isLoadingInitial || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextPageToken) {
        setIsFetchingMore(true);
        const folderTargetId = activeFolderId;
        
        api.get(`/galleries/folder/${folderTargetId}/images?pageToken=${nextPageToken}`)
          .then(res => {
            if (activeFolderId !== folderTargetId) return; 

            const newImages = res.data.images || [];
            const currentFolderName = galleryData?.folders?.find(f => f.id === folderTargetId)?.name || 'Uncategorized';
            
            setImages(prev => {
              const existingIds = new Set(prev.map(img => img.id));
              const filteredNew = newImages.filter(img => !existingIds.has(img.id));
              return [...prev, ...filteredNew];
            });

            setNextPageToken(res.data.next_page_token || null);
            newImages.forEach(img => {
              imageDictionary.current.set(img.id, { ...img, folderId: folderTargetId, folderName: currentFolderName });
            });
          })
          .catch(console.error)
          .finally(() => setIsFetchingMore(false));
      }
    }, { rootMargin: '400px' });
    
    if (node) observer.current.observe(node);
  }, [isLoadingInitial, isFetchingMore, nextPageToken, activeFolderId, galleryData]);

  const toggleSelection = (imageId, overrideFolderId = null) => {
    const cachedImg = imageDictionary.current.get(imageId);
    const targetFolderId = overrideFolderId || cachedImg?.folderId || activeFolderId;

    const newSet = new Set(selectionsRef.current);
    const folderMappings = { ...folderSelectionsRef.current };
    
    if (!folderMappings[targetFolderId]) {
      folderMappings[targetFolderId] = [];
    }
    
    if (newSet.has(imageId)) {
      newSet.delete(imageId);
      folderMappings[targetFolderId] = folderMappings[targetFolderId].filter(id => id !== imageId);
    } else {
      newSet.add(imageId);
      folderMappings[targetFolderId] = [...folderMappings[targetFolderId], imageId]; 
    }
    
    selectionsRef.current = newSet;
    folderSelectionsRef.current = folderMappings;
    setSelectionCount(newSet.size);

    api.post(`/galleries/${eventId}/selections`, { 
      selectedIds: Array.from(newSet),
      selectionsByFolder: folderMappings 
    }).catch(console.error);
  };

  const submitFinalSelections = async () => {
    if (!window.confirm("Are you ready to finalize and transmit these selections to the studio?")) return;
    setIsSubmitting(true);
    try {
      await api.post(`/galleries/${eventId}/selections`, { 
        selectedIds: Array.from(selectionsRef.current),
        selectionsByFolder: folderSelectionsRef.current
      });
      alert("Transmission Successful. Your finalized selections are now in the studio vault.");
      setIsReviewMode(false);
    } catch (err) {
      alert("Transmission failed. Please attempt again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#050507] text-zinc-400 font-mono uppercase tracking-widest text-xs flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!galleryData) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-serif text-2xl font-bold animate-pulse">E</div>
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Unlocking Vault...</p>
      </div>
    );
  }

  const groupedReviewImages = {};
  Array.from(selectionsRef.current).forEach(id => {
    const img = imageDictionary.current.get(id);
    if (img) {
      const fName = img.folderName || 'Uncategorized Assets';
      if (!groupedReviewImages[fName]) groupedReviewImages[fName] = [];
      groupedReviewImages[fName].push(img);
    }
  });

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans pb-32">
      <nav className="sticky top-0 z-40 bg-[#050507]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-5 transition-all shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex w-11 h-11 bg-gradient-to-tr from-zinc-200 to-white text-black items-center justify-center font-serif font-bold text-xl rounded-sm shadow-lg">
              {galleryData.clientName?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight leading-tight">{galleryData.clientName}</h1>
              <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 mt-1">{galleryData.eventTitle}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsReviewMode(!isReviewMode);
              setLightboxIndex(-1);
            }} 
            className={`group relative px-6 py-2.5 overflow-hidden rounded-full font-mono text-[11px] uppercase tracking-widest font-bold transition-all duration-300 hover:scale-105 shadow-xl ${
              isReviewMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-black hover:shadow-white/20'
            }`}
          >
            {isReviewMode ? 'Exit Review' : 'Review Room'}
            {!isReviewMode && selectionCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-black text-white rounded-full text-[10px] shadow-inner">
                {selectionCount}
              </span>
            )}
          </button>
        </div>

        {!isReviewMode && galleryData.folders?.length > 1 && (
          <div className="max-w-7xl mx-auto mt-6 flex gap-6 overflow-x-auto scrollbar-hide">
            {galleryData.folders.map(f => (
              <button 
                key={`tab-${f.id}`} 
                onClick={() => {
                  if (activeFolderId !== f.id) setActiveFolderId(f.id);
                }} 
                className={`text-[11px] font-mono uppercase tracking-widest pb-3 whitespace-nowrap transition-all duration-300 ${
                  activeFolderId === f.id ? 'border-b-2 border-white text-white font-bold' : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="p-4 sm:p-8 max-w-7xl mx-auto min-h-[60vh] animate-fade-in">
        {isReviewMode ? (
          <div className="space-y-12">
            <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-serif">Final Selections</h2>
                <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider mt-2">You have curated {selectionCount} assets across {Object.keys(groupedReviewImages).length} directories.</p>
              </div>
              <button 
                onClick={submitFinalSelections}
                disabled={selectionCount === 0 || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-mono text-xs uppercase tracking-widest px-8 py-4 rounded transition-all w-full md:w-auto flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/50"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Transmitting...</>
                ) : 'Confirm & Submit to Studio'}
              </button>
            </div>
            
            {Object.keys(groupedReviewImages).length === 0 ? (
              <div className="text-center py-32 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Your curation vault is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-16">
                {Object.entries(groupedReviewImages).map(([folderName, folderImages]) => (
                  <div key={folderName} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-300 bg-zinc-900/80 px-4 py-2 rounded-sm border border-zinc-800 shadow-sm inline-block">
                        {folderName}
                      </h3>
                      <div className="h-px bg-zinc-800 flex-1"></div>
                      <span className="text-xs font-mono text-zinc-500">{folderImages.length} Assets</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {folderImages.map((img, idx) => (
                        <div key={`review-${img.id}-${idx}`} className="relative group overflow-hidden bg-zinc-900 rounded-sm aspect-[4/5] shadow-lg">
                          <img 
                            src={img.thumbnail} 
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => { 
                              if (e.target.src !== img.full) {
                                e.target.src = img.full;
                              } else {
                                e.target.onerror = null;
                              }
                            }} 
                            className="w-full h-full object-cover transition-all duration-700 opacity-100 hover:scale-105" 
                            alt={img.name} 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                            <button 
                              onClick={() => toggleSelection(img.id, img.folderId)} 
                              className="bg-red-500/90 text-white font-mono text-[10px] uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-red-400 transition transform hover:scale-105"
                            >
                              Remove Selection
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {isLoadingInitial ? (
              <div className="flex justify-center items-center py-32">
                <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : images.length === 0 ? (
              <div className="flex justify-center items-center py-32 border border-dashed border-zinc-800 rounded-xl text-zinc-500 font-mono text-[11px] uppercase tracking-widest">
                No visual assets discovered in this directory.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {images.map((img, idx) => {
                  const isSelected = selectionsRef.current.has(img.id);
                  const isLastItem = images.length === idx + 1;
                  
                  return (
                    <div 
                      key={`${activeFolderId}-${img.id}-${idx}`} 
                      ref={isLastItem ? lastImageElementRef : null}
                      className="relative group overflow-hidden bg-zinc-900 rounded-sm aspect-[4/5] shadow-lg"
                    >
                      <img 
                        src={img.thumbnail} 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => { 
                          if (e.target.src !== img.full) {
                            e.target.src = img.full;
                          } else {
                            e.target.onerror = null;
                          }
                        }} 
                        onClick={() => setLightboxIndex(idx)} 
                        className={`w-full h-full object-cover cursor-zoom-in transition-all duration-700 ${isSelected ? 'scale-95 opacity-50' : 'group-hover:scale-105 opacity-100'}`} 
                        alt={img.name} 
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          toggleSelection(img.id);
                        }} 
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 shadow-xl ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-900/50' : 'bg-black/40 border-white/70 text-transparent hover:border-white hover:bg-black/60'
                        }`}
                        aria-label="Toggle select photo"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {isFetchingMore && (
              <div className="flex justify-center items-center py-10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 animate-pulse flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div> Extracting more assets...
                </span>
              </div>
            )}
          </>
        )}
      </main>

      {!isReviewMode && selectionCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-full px-6 py-3 flex items-center gap-6">
            <span className="text-xs font-mono uppercase tracking-widest text-white">
              <strong className="text-emerald-400 font-bold">{selectionCount}</strong> Assets Selected
            </span>
            <button 
              onClick={() => {
                setIsReviewMode(true);
                setLightboxIndex(-1);
              }}
              className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors shadow-lg"
            >
              Review Vault &rarr;
            </button>
          </div>
        </div>
      )}

      {lightboxIndex >= 0 && lightboxIndex < images.length && !isReviewMode && (
        <div className="fixed inset-0 z-50 bg-[#050507]/95 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
          
          <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
            <div className="flex flex-col">
              <span className="font-mono text-xs text-zinc-400 font-bold">{lightboxIndex + 1} <span className="text-zinc-600 font-normal">/ {images.length}</span></span>
              <span className="font-mono text-[10px] uppercase text-zinc-500 mt-1">{images[lightboxIndex]?.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleSelection(images[lightboxIndex].id)}
                className={`px-6 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors ${
                  selectionsRef.current.has(images[lightboxIndex].id) 
                    ? 'bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-black/50 text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm'
                }`}
              >
                {selectionsRef.current.has(images[lightboxIndex].id) ? 'Selected ✓' : 'Select'}
              </button>
              <button onClick={() => setLightboxIndex(-1)} className="text-zinc-400 hover:text-white p-2 transition-transform hover:scale-110 bg-black/50 rounded-full">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <button 
            onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(prev => Math.max(0, prev - 1));
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 z-10 hidden sm:block transition-all hover:-translate-x-1 bg-black/20 hover:bg-black/50 rounded-full"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <button 
            onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(prev => Math.min(images.length - 1, prev + 1));
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 z-10 hidden sm:block transition-all hover:translate-x-1 bg-black/20 hover:bg-black/50 rounded-full"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <div className="relative w-full h-full max-w-6xl p-4 sm:p-12 flex items-center justify-center">
            <img 
              src={images[lightboxIndex]?.thumbnail} 
              referrerPolicy="no-referrer"
              className="relative z-10 max-h-[85vh] max-w-full object-contain shadow-2xl animate-fade-in" 
              alt={images[lightboxIndex]?.name || 'Preview'}
              onError={(e) => { 
                if (e.target.src !== images[lightboxIndex].full) {
                  e.target.src = images[lightboxIndex].full; 
                } else {
                  e.target.onerror = null;
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientGallery;