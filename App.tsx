

import React, { useState, useEffect, useRef } from 'react';
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
import AccountManagement from './components/AccountManagement';
import { INITIAL_KOST_PROPERTIES, INITIAL_CAMPUSES, INITIAL_FACILITIES } from './constants';
import type { Kost, FilterState, HistoryLog, Account } from './types';
import { useLocalStorage } from './hooks';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  confirmButtonVariant?: 'danger' | 'primary';
}

interface SocialLinks {
    instagram: string;
    tiktok: string;
    facebook: string;
    whatsapp: string;
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

    return hash;
}

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [kostData, setKostData] = useLocalStorage<Kost[]>('kostData', INITIAL_KOST_PROPERTIES);
  const [historyLog, setHistoryLog] = useLocalStorage<HistoryLog[]>('historyLog', []);
  const [campuses, setCampuses] = useLocalStorage<string[]>('filterCampuses', INITIAL_CAMPUSES);
  const [facilities, setFacilities] = useLocalStorage<string[]>('filterFacilities', INITIAL_FACILITIES);
  const [socialLinks, setSocialLinks] = useLocalStorage<SocialLinks>('socialLinks', {
    instagram: 'https://www.instagram.com/dewakos',
    tiktok: 'https://www.tiktok.com/@dewakos',
    facebook: 'https://www.facebook.com/dewakos',
    whatsapp: 'https://wa.me/6281234567890',
  });
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', [
    { id: 'admin-main', username: 'admin', password: 'admin123' }
  ]);


  const hash = useHashNavigation();
  const scrollPositions = useRef<Record<string, number>>({});


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
  const [loggedInAccount, setLoggedInAccount] = useState<Account | null>(null);
  const [authAction, setAuthAction] = useState<'login' | 'manageAccount' | null>(null);
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

  const addHistoryLog = (logEntry: Omit<HistoryLog, 'id' | 'timestamp' | 'accountId' | 'username'>) => {
    if (!loggedInAccount) return;
    const newLog: HistoryLog = {
      ...logEntry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      accountId: loggedInAccount.id,
      username: loggedInAccount.username,
    };
    setHistoryLog(prev => [newLog, ...prev]);
  };

  // --- SCROLL MANAGEMENT ---
  const getNormalizedHashKey = (h: string): string => {
    if (h === '' || h === '#') {
        return '#/';
    }
    return h;
  };

  // Effect to SAVE scroll positions continuously via a passive listener
  useEffect(() => {
    const handleScroll = () => {
        const key = getNormalizedHashKey(window.location.hash);
        scrollPositions.current[key] = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to RESTORE scroll position on navigation
  useEffect(() => {
    const currentPageKey = getNormalizedHashKey(hash);
    const savedPosition = scrollPositions.current[currentPageKey];
    
    if (typeof savedPosition === 'number') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedPosition, behavior: 'auto' });
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);
  
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

    if (!loggedInAccount) {
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
  }, [filters, kostData, loggedInAccount, currentPage]);
  
  // --- EVENT HANDLERS (PUBLIC SITE) ---
  const handleFilterChange = (newFilterValues: Partial<FilterState>) => {
    setCurrentPage(1);
    setFilters(prevFilters => ({ ...prevFilters, ...newFilterValues }));
  };
  
  // --- AUTH HANDLERS ---
  const handleAuthAttempt = (username: string, password: string): boolean => {
    const account = accounts.find(acc => acc.username === username && acc.password === password);
    if (account) {
      setLoggedInAccount(account);
      if (authAction === 'manageAccount') {
        window.location.hash = '#/admin/account';
      } else if (authAction === 'login') {
        window.location.hash = '#/';
      }
      setAuthAction(null);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
      setLoggedInAccount(null);
      window.location.hash = '#/';
      setCurrentPage(1);
  };
  
  const handleChangePassword = (accountId: string, currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) return { success: false, message: 'Akun tidak ditemukan.' };
    
    const account = accounts[accountIndex];
    if (account.password !== currentPassword) {
        return { success: false, message: 'Password saat ini salah.' };
    }
    if (newPassword.length < 6) {
         return { success: false, message: 'Password baru harus minimal 6 karakter.' };
    }
    
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex] = { ...account, password: newPassword };
    setAccounts(updatedAccounts);
    
    if (loggedInAccount?.id === accountId) {
        setLoggedInAccount(updatedAccounts[accountIndex]);
    }
    return { success: true, message: 'Password berhasil diperbarui.' };
  };

  const handleAddAccount = (username: string, password: string): { success: boolean; message: string } => {
      if (username.trim().length < 3) return { success: false, message: 'Username harus minimal 3 karakter.' };
      if (password.trim().length < 6) return { success: false, message: 'Password harus minimal 6 karakter.' };
      if (accounts.some(acc => acc.username.toLowerCase() === username.trim().toLowerCase())) {
          return { success: false, message: 'Username sudah digunakan.' };
      }
      
      const newAccount: Account = {
          id: `acc-${Date.now()}`,
          username: username.trim(),
          password: password.trim()
      };
      setAccounts(prev => [...prev, newAccount]);
      return { success: true, message: `Akun "${username}" berhasil ditambahkan.` };
  };

  const handleDeleteAccount = (accountId: string): { success: boolean; message: string } => {
      const accountToDelete = accounts.find(acc => acc.id === accountId);
      if (!accountToDelete) {
        return { success: false, message: 'Akun tidak ditemukan.' };
      }

      if (accounts.length <= 1) return { success: false, message: 'Tidak dapat menghapus satu-satunya akun admin.' };
      if (loggedInAccount?.id === accountId) return { success: false, message: 'Anda tidak dapat menghapus akun yang sedang Anda gunakan.' };
      
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      return { success: true, message: `Akun "${accountToDelete.username}" berhasil dihapus.` };
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
    
    // For both new and existing kost, check for a return path
    const currentHash = window.location.hash;
    const queryIndex = currentHash.indexOf('?');
    let returnTo = '#/admin/dashboard'; // Default return path
    if (queryIndex !== -1) {
        const params = new URLSearchParams(currentHash.substring(queryIndex + 1));
        const from = params.get('from');
        if (from) {
            returnTo = `#${decodeURIComponent(from)}`;
        }
    }
    window.location.hash = returnTo;
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
            details: `Mengembalikan aksi '${log.action}' pada "${log.kostName}"`,
            accountId: loggedInAccount!.id,
            username: loggedInAccount!.username,
        };
        const updatedLogs = prevLogs.map(prevLog => prevLog.id === log.id ? { ...prevLog, isRestored: true } : prevLog);
        return [newRestoreLog, ...updatedLogs];
    });
  };

  // --- FILTER MANAGEMENT HANDLERS ---
    const handleAddFilterOption = (type: 'campuses' | 'facilities', newValue: string) => {
        if (!newValue.trim()) return;
        if (type === 'campuses') {
            if (!campuses.includes(newValue)) {
                setCampuses(prev => [...prev, newValue].sort());
            }
        } else {
            if (!facilities.includes(newValue)) {
                setFacilities(prev => [...prev, newValue].sort());
            }
        }
    };
    
    const handleUpdateFilterOption = (type: 'campuses' | 'facilities', oldValue: string, newValue: string) => {
        if (!newValue.trim() || oldValue === newValue) return;
        
        if (type === 'campuses') {
            setCampuses(prev => prev.map(c => (c === oldValue ? newValue : c)).sort());
            setKostData(prev =>
                prev.map(kost => ({
                    ...kost,
                    nearbyCampuses: kost.nearbyCampuses.map(c => (c === oldValue ? newValue : c)),
                }))
            );
        } else {
            setFacilities(prev => prev.map(f => (f === oldValue ? newValue : f)).sort());
            setKostData(prev =>
                prev.map(kost => ({
                    ...kost,
                    facilities: kost.facilities.map(f => (f === oldValue ? newValue : f)),
                }))
            );
        }
    };

    const handleDeleteFilterOption = (type: 'campuses' | 'facilities', valueToDelete: string) => {
        const confirmAction = () => {
            if (type === 'campuses') {
                setCampuses(prev => prev.filter(c => c !== valueToDelete));
                setKostData(prev =>
                    prev.map(kost => ({
                        ...kost,
                        nearbyCampuses: kost.nearbyCampuses.filter(c => c !== valueToDelete),
                    }))
                );
            } else {
                setFacilities(prev => prev.filter(f => f !== valueToDelete));
                setKostData(prev =>
                    prev.map(kost => ({
                        ...kost,
                        facilities: kost.facilities.filter(f => f !== valueToDelete),
                    }))
                );
            }
            setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        };

        setConfirmation({
            isOpen: true,
            title: 'Konfirmasi Hapus Filter',
            message: `Yakin ingin menghapus "${valueToDelete}"? Opsi ini juga akan dihapus dari semua properti yang ada.`,
            onConfirm: confirmAction,
        });
    };

  // --- IMPORT/EXPORT/BACKUP HANDLERS ---
  const getBackupDataAsString = (): string => {
    const dataToExport = {
        kostData: kostData,
        historyLog: historyLog,
        campuses: campuses,
        facilities: facilities,
        socialLinks: socialLinks,
        accounts: accounts,
        timestamp: new Date().toISOString(),
    };
    return JSON.stringify(dataToExport, null, 2);
  }

  const handleExportData = () => {
    try {
        const jsonString = getBackupDataAsString();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        a.download = `dewakost_backup_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export data:", error);
        alert("Gagal mengekspor data.");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target?.result;
            if (typeof text !== 'string') throw new Error('Gagal membaca file.');
            
            const importedData = JSON.parse(text);

            if (!Array.isArray(importedData.kostData) || !Array.isArray(importedData.historyLog) || !Array.isArray(importedData.campuses) || !Array.isArray(importedData.facilities) || typeof importedData.socialLinks !== 'object' || !Array.isArray(importedData.accounts)) {
                throw new Error('Format file tidak valid. Pastikan file backup berisi semua data yang diperlukan.');
            }
            
            const confirmAction = () => {
                setKostData(importedData.kostData);
                setHistoryLog(importedData.historyLog);
                setCampuses(importedData.campuses);
                setFacilities(importedData.facilities);
                setSocialLinks(importedData.socialLinks);
                setAccounts(importedData.accounts);
                setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                alert('Data berhasil diimpor!');
            };

            setConfirmation({
                isOpen: true,
                title: 'Konfirmasi Impor Data',
                message: 'Apakah Anda yakin ingin mengimpor data ini? Semua data saat ini akan ditimpa. Tindakan ini tidak dapat diurungkan.',
                onConfirm: confirmAction,
                confirmText: 'Ya, Impor Data',
                confirmButtonVariant: 'primary'
            });

        } catch (error: any) {
            console.error('Error importing data:', error);
            alert(`Gagal mengimpor data: ${error.message}`);
        } finally {
            if (e.target) {
                e.target.value = '';
            }
        }
    };
    reader.readAsText(file);
  };
  
  const handleUpdateSocialLinks = (newLinks: SocialLinks) => {
      setSocialLinks(newLinks);
  }

  const renderContent = () => {
    const path = hash.split('/');
    
    // Admin Routes
    if (loggedInAccount) {
      if (hash === '#/admin/dashboard') {
          return <AdminDashboard 
              kostData={kostData} 
              onDelete={handleDeleteKost} 
              onToggleArchive={handleToggleArchive} 
              onExport={handleExportData}
              onImport={handleImportData}
              socialLinks={socialLinks}
              onUpdateSocialLinks={handleUpdateSocialLinks}
              onManageAccount={() => setAuthAction('manageAccount')}
          />;
      }
      if (hash === '#/admin/account') {
        return <AccountManagement 
            accounts={accounts}
            loggedInAccount={loggedInAccount}
            onChangePassword={handleChangePassword}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
        />;
      }
      if (hash.startsWith('#/admin/new')) {
          const queryIndex = hash.indexOf('?');
          let backPath = '#/admin/dashboard'; // Default back path
          if (queryIndex !== -1) {
              const params = new URLSearchParams(hash.substring(queryIndex + 1));
              const from = params.get('from');
              if (from) {
                  backPath = `#${decodeURIComponent(from)}`;
              }
          }

          return <PropertyDetails 
              mode="new" 
              onBack={() => window.location.hash = backPath}
              isAdmin={!!loggedInAccount} 
              onSubmit={handleSaveKost} 
              campuses={campuses}
              facilities={facilities}
          />;
      }
      if (hash.startsWith('#/admin/edit/')) {
          const id = hash.split('?')[0].split('/')[3];
          const kost = kostData.find(k => k.id === id);

          const queryIndex = hash.indexOf('?');
          let backPath = '#/admin/dashboard'; // Default
          if (queryIndex !== -1) {
              const params = new URLSearchParams(hash.substring(queryIndex + 1));
              const from = params.get('from');
              if (from) {
                  backPath = `#${decodeURIComponent(from)}`;
              }
          }
          
          return kost ? <PropertyDetails 
              kost={kost}
              mode="edit"
              onBack={() => window.location.hash = backPath} 
              isAdmin={!!loggedInAccount} 
              onSubmit={handleSaveKost} 
              campuses={campuses}
              facilities={facilities}
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
          isAdmin={!!loggedInAccount} 
          onSubmit={handleSaveKost} 
          campuses={campuses}
          facilities={facilities}
      /> : <p>Kost not found</p>;
    }

    // Default view: Home page with property list
    const totalPages = Math.ceil(filteredKost.length / ITEMS_PER_PAGE);
    const paginatedKost = filteredKost.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    const HeroSection: React.FC = () => (
      <div className="relative h-80 bg-cover bg-center" style={{ backgroundImage: "url('https://www.agoda.com/wp-content/uploads/2024/08/Alun-Alun-Tugu-Malang-Indonesia-featured-1244x700.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Dewakos</h1>
            <p className="text-lg md:text-xl max-w-2xl drop-shadow-md">Solusi cepat cari kosan di Malang</p>
        </div>
      </div>
    );

    return (
      <>
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
              <FilterPanel 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                campuses={campuses} 
                facilities={facilities} 
                isAdmin={!!loggedInAccount}
                onAddFilter={handleAddFilterOption}
                onUpdateFilter={handleUpdateFilterOption}
                onDeleteFilter={handleDeleteFilterOption}
              />
            </aside>
            <main className="md:col-span-3">
              {paginatedKost.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedKost.map(kost => (
                      <PropertyCard 
                        key={kost.id} 
                        kost={kost} 
                        isAdmin={!!loggedInAccount}
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
        {loggedInAccount && !hash.startsWith('#/admin/') && (
            <button 
                onClick={() => window.location.hash = `#/admin/new?from=${encodeURIComponent(hash.substring(1) || '/')}`}
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
      {authAction && (
        <LoginModal
          onClose={() => setAuthAction(null)}
          onLogin={handleAuthAttempt}
          title={authAction === 'manageAccount' ? 'Verifikasi Keamanan' : undefined}
          description={authAction === 'manageAccount' ? 'Masukkan kredensial Anda untuk melanjutkan.' : undefined}
        />
      )}
      {loggedInAccount && <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} logs={historyLog} onRestore={handleRestore} />}
      {confirmation.isOpen && (
        <ConfirmationModal
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
            confirmText={confirmation.confirmText}
            confirmButtonVariant={confirmation.confirmButtonVariant}
        />
      )}
      <Header 
        loggedInAccount={loggedInAccount}
        onLoginClick={() => setAuthAction('login')}
        onLogoutClick={handleLogout}
        onHistoryClick={() => setShowHistoryModal(true)}
        currentHash={hash}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer socialLinks={socialLinks} />
    </div>
  );
};

export default App;