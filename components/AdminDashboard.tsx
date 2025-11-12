

import React, { useState, useEffect } from 'react';
import type { Kost } from '../types';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, BuildingOfficeIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, InstagramIcon, TiktokIcon, FacebookIcon, CheckCircleIcon, PlusIcon, WhatsAppIcon } from './icons';

interface SocialLinks {
    instagram: string;
    tiktok: string;
    facebook: string;
    whatsapp: string;
}

interface AdminDashboardProps {
  kostData: Kost[];
  onDelete: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  socialLinks: SocialLinks;
  onUpdateSocialLinks: (links: SocialLinks) => void;
  onManageAccount: () => void;
}

const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
        <div className="bg-blue-100 rounded-full p-3 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    kostData, onDelete, onToggleArchive, onExport, onImport, socialLinks, onUpdateSocialLinks, onManageAccount
}) => {
    const totalKost = kostData.length;
    const activeKost = kostData.filter(k => !k.isArchived).length;
    const archivedKost = totalKost - activeKost;
    
    const [localLinks, setLocalLinks] = useState(socialLinks);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalLinks(socialLinks);
    }, [socialLinks]);

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalLinks(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setIsSaved(false);
    };

    const handleSaveSocials = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSocialLinks(localLinks);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Kelola semua properti kost Anda di sini.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button 
                        onClick={onExport}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export Data
                    </button>
                    <label 
                        htmlFor="import-file-input"
                        className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        Import Data
                    </label>
                    <input type="file" id="import-file-input" className="hidden" accept=".json" onChange={onImport} />
                </div>
            </header>
            
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Properti" value={totalKost} icon={<BuildingOfficeIcon className="w-6 h-6 text-blue-600" />} />
                <StatCard title="Properti Aktif" value={activeKost} icon={<EyeIcon className="w-6 h-6 text-green-600" />} />
                <StatCard title="Properti Diarsipkan" value={archivedKost} icon={<EyeSlashIcon className="w-6 h-6 text-yellow-600" />} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Daftar Properti</h2>
                             <button
                                onClick={() => window.location.hash = `#/admin/new?from=${encodeURIComponent('/admin/dashboard')}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Tambah Properti
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kost</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {kostData.map((kost) => (
                                        <tr key={kost.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{kost.name}</div>
                                                <div className="text-sm text-gray-500">{kost.area}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatPrice(kost.pricePerMonth)}</div>
                                                <div className="text-sm text-gray-500">/ bulan</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kost.gender}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {kost.isArchived ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Diarsipkan
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button onClick={() => window.location.hash = `#/admin/edit/${kost.id}?from=${encodeURIComponent('/admin/dashboard')}`} className="p-2 text-gray-400 hover:text-yellow-600 rounded-md hover:bg-gray-100" title="Edit">
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                     <button onClick={() => onToggleArchive(kost.id)} className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100" title={kost.isArchived ? 'Aktifkan' : 'Arsipkan'}>
                                                        {kost.isArchived ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                                                    </button>
                                                    <button onClick={() => onDelete(kost.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100" title="Hapus">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     {kostData.length === 0 && (
                         <div className="text-center py-20 bg-white rounded-lg shadow-md mt-8">
                            <h2 className="text-2xl font-semibold text-gray-700">Belum ada properti</h2>
                            <p className="text-gray-500 mt-2">Gunakan tombol "Tambah Properti" di atas untuk menambahkan properti baru.</p>
                         </div>
                     )}
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <form onSubmit={handleSaveSocials} className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pengaturan Media Sosial</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <InstagramIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="url" name="instagram" id="instagram" value={localLinks.instagram} onChange={handleLinkChange} className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="https://www.instagram.com/..." />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
                                <div className="relative">
                                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <TiktokIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="url" name="tiktok" id="tiktok" value={localLinks.tiktok} onChange={handleLinkChange} className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="https://www.tiktok.com/..." />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FacebookIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="url" name="facebook" id="facebook" value={localLinks.facebook} onChange={handleLinkChange} className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="https://www.facebook.com/..." />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp URL</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <WhatsAppIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input type="url" name="whatsapp" id="whatsapp" value={localLinks.whatsapp || ''} onChange={handleLinkChange} className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="https://wa.me/..." />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end">
                            {isSaved && (
                                <span className="text-sm text-green-600 flex items-center mr-3 transition-opacity duration-300">
                                    <CheckCircleIcon className="w-5 h-5 mr-1"/>
                                    Tersimpan!
                                </span>
                            )}
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Keamanan & Akun</h2>
                        <button
                            onClick={onManageAccount}
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Kelola Akun & Password
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;