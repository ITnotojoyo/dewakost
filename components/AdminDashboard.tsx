import React from 'react';
import type { Kost } from '../types';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, BuildingOfficeIcon } from './icons';

interface AdminDashboardProps {
  kostData: Kost[];
  onDelete: (id: string) => void;
  onToggleArchive: (id: string) => void;
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


const AdminDashboard: React.FC<AdminDashboardProps> = ({ kostData, onDelete, onToggleArchive }) => {
    const totalKost = kostData.length;
    const activeKost = kostData.filter(k => !k.isArchived).length;
    const archivedKost = totalKost - activeKost;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Kelola semua properti kost Anda di sini.</p>
            </header>
            
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Properti" value={totalKost} icon={<BuildingOfficeIcon className="w-6 h-6 text-blue-600" />} />
                <StatCard title="Properti Aktif" value={activeKost} icon={<EyeIcon className="w-6 h-6 text-green-600" />} />
                <StatCard title="Properti Diarsipkan" value={archivedKost} icon={<EyeSlashIcon className="w-6 h-6 text-yellow-600" />} />
            </section>

            <section>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Daftar Properti</h2>
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
                                                <a href={`#/kost/${kost.id}`} className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100" title="Lihat">
                                                    <EyeIcon className="w-5 h-5"/>
                                                </a>
                                                <a href={`#/admin/edit/${kost.id}`} className="p-2 text-gray-400 hover:text-yellow-600 rounded-md hover:bg-gray-100" title="Edit">
                                                    <PencilIcon className="w-5 h-5" />
                                                </a>
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
                        <p className="text-gray-500 mt-2">Klik tombol '+' di kanan bawah untuk menambahkan properti baru.</p>
                     </div>
                 )}
            </section>
        </div>
    );
};

export default AdminDashboard;
