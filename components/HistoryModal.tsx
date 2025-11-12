


import React, { useState, useEffect } from 'react';
import type { HistoryLog } from '../types';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, CalendarIcon, UndoIcon, HistoryIcon } from './icons';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: HistoryLog[];
  onRestore: (log: HistoryLog) => void;
}

const actionDetails = {
    create: { text: 'Properti Dibuat', icon: PencilIcon, color: 'text-green-500' },
    update: { text: 'Properti Diperbarui', icon: PencilIcon, color: 'text-blue-500' },
    delete: { text: 'Properti Dihapus', icon: TrashIcon, color: 'text-red-500' },
    archive: { text: 'Properti Diarsipkan', icon: EyeSlashIcon, color: 'text-yellow-500' },
    unarchive: { text: 'Properti Batal Arsip', icon: EyeIcon, color: 'text-gray-500' },
    restore: { text: 'Aksi Dikembalikan', icon: HistoryIcon, color: 'text-indigo-500' },
}

const timeAgo = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} detik yang lalu`;
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days <= 7) return `${days} hari yang lalu`;

    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

const getTodayDateString = () => {
    const today = new Date();
    // Adjust for timezone offset to get the correct local date
    const offset = today.getTimezoneOffset();
    const todayLocal = new Date(today.getTime() - (offset*60*1000));
    return todayLocal.toISOString().split('T')[0];
};


const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, logs, onRestore }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
        setSelectedDate(getTodayDateString());
        setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    // Filter by search term
    const term = searchTerm.trim().toLowerCase();
    const searchMatch = term === '' ||
      log.kostName.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term)) ||
      log.username.toLowerCase().includes(term);

    if (!searchMatch) return false;

    // Filter by date
    if (selectedDate) {
      const logDate = new Date(log.timestamp);
      const filterDate = new Date(selectedDate); // 'YYYY-MM-DD' format is parsed as UTC midnight
      return (
        logDate.getUTCFullYear() === filterDate.getUTCFullYear() &&
        logDate.getUTCMonth() === filterDate.getUTCMonth() &&
        logDate.getUTCDate() === filterDate.getUTCDate()
      );
    }
    
    // If date is not selected, the search match is sufficient
    return true;
  });
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
  };
  
  const showPlaceholder = searchTerm === '' && selectedDate === '';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Riwayat Aktivitas</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            {/* Left Panel: Filters */}
            <div className="w-full md:w-64 p-6 border-b md:border-b-0 md:border-r bg-gray-50 flex-shrink-0 flex flex-col">
                <div className="mb-4">
                    <label htmlFor="searchTerm" className="text-sm font-medium text-gray-700 block mb-2">Cari Aktivitas</label>
                    <input 
                        type="text" 
                        id="searchTerm"
                        placeholder="Nama kost, detail, user..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="selectedDate" className="text-sm font-medium text-gray-700 block mb-2">Filter Berdasarkan Tanggal</label>
                    <input 
                        type="date" 
                        id="selectedDate"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="mt-auto">
                    <button 
                        onClick={handleResetFilters}
                        className="w-full text-sm text-center py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>
            {/* Right Panel: Activity Log */}
            <div className="flex-grow p-6 overflow-y-auto">
                {showPlaceholder ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 min-h-[200px]">
                        <CalendarIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="font-semibold text-lg">Gunakan Filter</h3>
                        <p className="max-w-xs">Cari berdasarkan kata kunci atau pilih tanggal untuk melihat riwayat.</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-gray-500 min-h-[200px]">
                        <p>Tidak ada aktivitas yang cocok dengan filter Anda.</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {filteredLogs.map(log => {
                            const { text, icon: Icon, color } = actionDetails[log.action];
                            return (
                                <li key={log.id} className="group flex items-center justify-between gap-4 p-2 -m-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-start gap-4 flex-grow">
                                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 ${color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className={`flex-grow ${log.isRestored ? 'opacity-60' : ''}`}>
                                            <p className={`font-semibold text-gray-800 ${log.isRestored ? 'line-through' : ''}`}>{text}</p>
                                            <p className={`text-sm text-gray-600 ${log.isRestored ? 'line-through' : ''}`}>
                                                <span className="font-medium">{log.kostName}</span>
                                                {log.details && <span className="text-gray-500"> - {log.details}</span>}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">{timeAgo(log.timestamp)} oleh <span className="font-medium">{log.username}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {log.isRestored ? (
                                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full whitespace-nowrap">
                                                Dikembalikan
                                            </span>
                                        ) : (log.action !== 'restore') && (
                                            <button
                                                onClick={() => onRestore(log)}
                                                className="opacity-0 group-hover:opacity-100 transition p-1.5 text-gray-500 rounded-md hover:bg-gray-200 hover:text-gray-700"
                                                aria-label={`Restore action for ${log.kostName}`}
                                                title="Kembalikan aksi ini"
                                            >
                                                <UndoIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;