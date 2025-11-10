import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FilterPanel from './components/SearchBar';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import LoginModal from './components/LoginModal';
import HistoryModal from './components/HistoryModal';
import ConfirmationModal from './components/ConfirmationModal';
import Pagination from './components/Pagination';
import AdminDashboard from './components/AdminDashboard';
import { INITIAL_KOST_PROPERTIES } from './constants';
import type { Kost, FilterState, HistoryLog } from './types';
import { useLocalStorage } from './hooks';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const ITEMS_PER_PAGE = 12;

const useHashNavigation = () => {
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Scroll to top on navigation
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [hash]);

    return hash;
}

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [kostData, setKostData] = useLocalStorage<Kost[]>('kostData', INITIAL_KOST_PROPERTIES);
  const [historyLog, setHistoryLog] = useLocalStorage<HistoryLog[]>('historyLog', []);
  const hash = useHashNavigation();

  const [filters, setFilters] = useState<FilterState>({
    area: '',
    campuses: [],
    facilities: [],
    maxPrice: 3000000,
    gender: 'Semua',
  });
  const [filteredKost, setFilteredKost] = useState<Kost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- AUTH STATE ---
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const addHistoryLog = (logEntry: Omit<HistoryLog, 'id' | 'timestamp'>) => {
    const newLog: HistoryLog = {
      ...logEntry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setHistoryLog(prev => [newLog, ...prev]);
  };
  
  // --- DYNAMIC SEO & METADATA ---
  useEffect(() => {
    const updateMeta = (title: string, description: string) => {
      document.title = title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
      // Update Open Graph tags for social sharing
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute('content', description);
    };

    const path = hash.split('/');
    
    if (hash.startsWith('#/kost/')) {
      const id = path[2];
      const kost = kostData.find(k => k.id === id);
      if (kost) {
        const shortDesc = kost.description.length > 155 ? kost.description.substring(0, 155) + '...' : kost.description;
        updateMeta(`${kost.name} | Dewa Kost`, shortDesc);
      } else {
        updateMeta('Kost Tidak Ditemukan | Dewa Kost', 'Properti kost yang Anda cari tidak dapat ditemukan.');
      }
    } else if (hash.startsWith('#/admin/')) {
        updateMeta('Admin Panel | Dewa Kost', 'Kelola properti kost melalui panel admin Dewa Kost.');
    } else {
        updateMeta(
          'Dewa Kost | Temukan Kost Impian di Malang', 
          'Platform pencari kost nomor satu di Malang. Temukan kost impianmu dengan mudah, cepat, dan sesuai budget di sekitar kampus ternama.'
        );
    }
  }, [hash, kostData]);


  // --- DATA FILTERING ---
  useEffect(() => {
    let results: Kost[] = [...kostData];

    if (!isAdmin) {
      results = results.filter(k => !k.isArchived);
    }
    if (filters.gender !== 'Semua') {
      results = results.filter(k => k.gender === filters.gender);
    }
    if (filters.area.trim()) {
      results = results.filter(k => 
        k.area.toLowerCase().includes(filters.area.trim().toLowerCase())
      );
    }
    results = results.filter(k => k.pricePerMonth <= filters.maxPrice);
    if (filters.facilities.length > 0) {
      results = results.filter(k => filters.facilities.every(facility => k.facilities.includes(facility)));
    }
    if (filters.campuses.length > 0) {
      results = results.filter(k => filters.campuses.some(campus => k.nearbyCampuses.includes(campus)));
    }
    setFilteredKost(results);
    
    const newTotalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
    }
  }, [filters, kostData, isAdmin, currentPage]);
  
  // --- EVENT HANDLERS (PUBLIC SITE) ---
  const handleFilterChange = (newFilterValues: Partial<FilterState>) => {
    setCurrentPage(1);
    setFilters(prevFilters => ({ ...prevFilters, ...newFilterValues }));
  };
  
  // --- AUTH HANDLERS ---
  const handleLogin = (password: string): boolean => {
    if (password === 'admin123') { 
        setIsAdmin(true);
        setShowLoginModal(false);
        window.location.hash = '#/admin/dashboard';
        return true;
    }
    return false;
  };

  const handleLogout = () => {
      setIsAdmin(false);
      window.location.hash = '#/';
      setCurrentPage(1);
  };

  // --- CRUD HANDLERS (ADMIN) ---
  const handleSaveKost = (kostToSave: Omit<Kost, 'id'> & { id?: string }) => {
    if (kostToSave.id) { // Update existing
      const originalKost = kostData.find(k => k.id === kostToSave.id);
       if (originalKost) {
        const changes: string[] = [];
        if (originalKost.pricePerMonth !== kostToSave.pricePerMonth) {
            changes.push(`harga dari ${formatPrice(originalKost.pricePerMonth)} ke ${formatPrice(kostToSave.pricePerMonth)}`);
        }
        if (originalKost.name !== kostToSave.name) changes.push('nama');
        if (originalKost.area !== kostToSave.area) changes.push('area');
        if (originalKost.address !== kostToSave.address) changes.push('alamat');
        if (originalKost.description !== kostToSave.description) changes.push('deskripsi');
        if (originalKost.gender !== kostToSave.gender) changes.push('tipe gender');
        if (JSON.stringify(originalKost.facilities.sort()) !== JSON.stringify(kostToSave.facilities.sort())) changes.push('fasilitas');
        if (JSON.stringify(originalKost.nearbyCampuses.sort()) !== JSON.stringify(kostToSave.nearbyCampuses.sort())) changes.push('kampus terdekat');
        if (JSON.stringify(originalKost.imageUrls) !== JSON.stringify(kostToSave.imageUrls)) changes.push('gambar');
        if (originalKost.rating !== kostToSave.rating) changes.push('rating');

        if(changes.length > 0){
            addHistoryLog({
                action: 'update',
                kostId: originalKost.id,
                kostName: originalKost.name,
                details: `Memperbarui ${changes.join(', ')}.`,
                previousState: originalKost,
            });
        }
      }
      const updatedData = kostData.map(k => k.id === kostToSave.id ? { ...k, ...kostToSave } as Kost : k);
      setKostData(updatedData);
    } else { // Create new
      const newKost: Kost = { ...kostToSave, id: `k${Date.now()}`, isArchived: false, } as Kost;
      addHistoryLog({
        action: 'create',
        kostId: newKost.id,
        kostName: newKost.name,
        details: 'Menambahkan properti baru.'
      });
      setKostData(prevData => [newKost, ...prevData]);
    }
    window.location.hash = '#/admin/dashboard';
  };
  
  const handleDeleteKost = (kostId: string) => {
    const kostToDelete = kostData.find(k => k.id === kostId);
    if (!kostToDelete) return;

    const confirmAction = () => {
        addHistoryLog({
            action: 'delete',
            kostId: kostToDelete.id,
            kostName: kostToDelete.name,
            previousState: kostToDelete,
        });
        setKostData(prevData => prevData.filter(k => k.id !== kostId));
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    };

    setConfirmation({
        isOpen: true,
        title: 'Konfirmasi Penghapusan',
        message: `Apakah Anda yakin ingin menghapus "${kostToDelete.name}"? Tindakan ini tidak dapat diurungkan.`,
        onConfirm: confirmAction,
    });
  };

  const handleToggleArchive = (kostId: string) => {
    const kostToToggle = kostData.find(k => k.id === kostId);
    if (!kostToToggle) return;
    addHistoryLog({
        action: kostToToggle.isArchived ? 'unarchive' : 'archive',
        kostId: kostToToggle.id,
        kostName: kostToToggle.name,
    });
    setKostData(prevData =>
      prevData.map(k => k.id === kostId ? { ...k, isArchived: !k.isArchived } : k)
    );
  };

  const handleRestore = (log: HistoryLog) => {
    let newKostData = [...kostData];
    let restoredItemName = log.kostName;

    switch (log.action) {
        case 'create':
            newKostData = kostData.filter(k => k.id !== log.kostId);
            break;
        case 'update':
            if (log.previousState) {
                newKostData = kostData.map(k => k.id === log.kostId ? log.previousState! : k);
                restoredItemName = log.previousState.name;
            }
            break;
        case 'delete':
            if (log.previousState) {
                if (!kostData.some(k => k.id === log.kostId)) {
                   newKostData.push(log.previousState);
                   restoredItemName = log.previousState.name;
                }
            }
            break;
        case 'archive':
        case 'unarchive':
            const originalStatus = log.action === 'archive';
            newKostData = kostData.map(k => k.id === log.kostId ? { ...k, isArchived: originalStatus } : k);
            const toggledKost = newKostData.find(k => k.id === log.kostId);
            if (toggledKost) restoredItemName = toggledKost.name;
            break;
        default: return;
    }
    
    setKostData(newKostData);

    setHistoryLog(prevLogs => {
        const newRestoreLog: HistoryLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'restore',
            kostId: log.kostId,
            kostName: restoredItemName,
            details: `Mengembalikan aksi '${log.action}' pada "${log.kostName}"`
        };
        const updatedLogs = prevLogs.map(prevLog => prevLog.id === log.id ? { ...prevLog, isRestored: true } : prevLog);
        return [newRestoreLog, ...updatedLogs];
    });
  };

  const renderContent = () => {
    const path = hash.split('/');
    
    // Admin Routes
    if (isAdmin) {
      if (hash === '#/admin/dashboard') {
          return <AdminDashboard 
              kostData={kostData} 
              onDelete={handleDeleteKost} 
              onToggleArchive={handleToggleArchive} 
          />;
      }
      if (hash === '#/admin/new') {
          return <PropertyDetails 
              mode="new" 
              onBack={() => window.location.hash = '#/admin/dashboard'}
              isAdmin={true} 
              onSubmit={handleSaveKost} 
          />;
      }
      if (hash.startsWith('#/admin/edit/')) {
          const id = path[3];
          const kost = kostData.find(k => k.id === id);
          return kost ? <PropertyDetails 
              kost={kost}
              mode="edit"
              onBack={() => window.location.hash = '#/admin/dashboard'} 
              isAdmin={true} 
              onSubmit={handleSaveKost} 
          /> : <p>Kost not found</p>;
      }
    }
    
    // Public Routes
    if (hash.startsWith('#/kost/')) {
      const id = path[2];
      const kost = kostData.find(k => k.id === id);
      return kost ? <PropertyDetails 
          kost={kost} 
          mode="view"
          onBack={() => window.location.hash = '#/'} 
          isAdmin={isAdmin} 
          onSubmit={handleSaveKost} 
      /> : <p>Kost not found</p>;
    }

    // Default view: Home page with property list
    const totalPages = Math.ceil(filteredKost.length / ITEMS_PER_PAGE);
    const paginatedKost = filteredKost.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    const HeroSection: React.FC = () => (
      <div className="relative h-80 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/hero-malang/1920/1080')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Temukan Kost Impianmu</h1>
            <p className="text-lg md:text-xl max-w-2xl drop-shadow-md">Cari kost terbaik di sekitar kampus ternama di Malang.</p>
        </div>
      </div>
    );

    return (
      <>
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
            </aside>
            <main className="md:col-span-3">
              {paginatedKost.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedKost.map(kost => (
                      <PropertyCard 
                        key={kost.id} 
                        kost={kost} 
                        isAdmin={isAdmin}
                        onDelete={handleDeleteKost}
                        onToggleArchive={handleToggleArchive}
                      />
                    ))}
                  </div>
                   {totalPages > 1 && (
                      <div className="mt-12">
                          <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                          />
                      </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold text-gray-700">Tidak ada kost yang cocok</h2>
                  <p className="text-gray-500 mt-2">Coba ubah atau hapus beberapa filter.</p>
                </div>
              )}
            </main>
          </div>
        </div>
        {isAdmin && (
            <button 
                onClick={() => window.location.hash = '#/admin/new'}
                className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-30"
                aria-label="Tambah Kost Baru"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        )}
      </>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />}
      {isAdmin && <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} logs={historyLog} onRestore={handleRestore} />}
      {confirmation.isOpen && (
        <ConfirmationModal
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        />
      )}
      <Header 
        isAdmin={isAdmin}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
        onHistoryClick={() => setShowHistoryModal(true)}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;