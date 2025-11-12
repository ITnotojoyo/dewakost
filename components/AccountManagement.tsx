



import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, TrashIcon, UserPlusIcon, UserGroupIcon, EyeIcon, EyeSlashIcon } from './icons';
import type { Account } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface AccountManagementProps {
    accounts: Account[];
    loggedInAccount: Account;
    onChangePassword: (accountId: string, currentPassword: string, newPassword: string) => { success: boolean; message: string };
    onAddAccount: (username: string, password: string) => { success: boolean; message: string };
    onDeleteAccount: (accountId: string) => { success: boolean; message: string };
}

const AccountManagement: React.FC<AccountManagementProps> = ({ 
    accounts,
    loggedInAccount,
    onChangePassword,
    onAddAccount,
    onDeleteAccount
}) => {
    // State for changing OWN password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [ownPasswordNotification, setOwnPasswordNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // State for adding a NEW account
    const [newUsername, setNewUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [addAccountNotification, setAddAccountNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    
    // State for general notifications on the account list (e.g., delete)
    const [listNotification, setListNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    const [deleteConfirmation, setDeleteConfirmation] = useState<{
      isOpen: boolean;
      accountId?: string;
      username?: string;
    }>({ isOpen: false });


    const handleMyPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOwnPasswordNotification(null);

        if (newPassword !== confirmPassword) {
            setOwnPasswordNotification({ type: 'error', message: 'Password baru tidak cocok.' });
            return;
        }

        const result = onChangePassword(loggedInAccount.id, currentPassword, newPassword);
        setOwnPasswordNotification({
            type: result.success ? 'success' : 'error',
            message: result.message
        });

        if (result.success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };
    
    const handleAddAccountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAddAccountNotification(null);
        
        const result = onAddAccount(newUsername, newUserPassword);
        setAddAccountNotification({
             type: result.success ? 'success' : 'error',
             message: result.message
        });
        
        if (result.success) {
            setNewUsername('');
            setNewUserPassword('');
        }
    };

    const handleDeleteClick = (accountId: string, username: string) => {
        setListNotification(null);
        setDeleteConfirmation({ isOpen: true, accountId, username });
    };
    
    const handleConfirmDelete = () => {
        if (deleteConfirmation.accountId) {
            const result = onDeleteAccount(deleteConfirmation.accountId);
            setListNotification({
                type: result.success ? 'success' : 'error',
                message: result.message
            });
            if (result.success) {
                setTimeout(() => setListNotification(null), 3000);
            }
        }
        setDeleteConfirmation({ isOpen: false });
    };

    
    const toggleShowPassword = (accountId: string) => {
        setShowPasswords(prev => ({...prev, [accountId]: !prev[accountId]}));
    };
    
    const handleBack = () => {
        window.location.hash = '#/admin/dashboard';
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
             {deleteConfirmation.isOpen && (
                <ConfirmationModal
                    isOpen={deleteConfirmation.isOpen}
                    title="Konfirmasi Hapus Akun"
                    message={`Apakah Anda yakin ingin menghapus akun "${deleteConfirmation.username}"? Tindakan ini tidak dapat diurungkan.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteConfirmation({ isOpen: false })}
                    confirmText="Ya, Hapus"
                />
            )}
            <button 
                onClick={handleBack} 
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium py-2 px-4 rounded-lg inline-flex items-center transition-colors mb-6"
            >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Kembali ke Dashboard
            </button>
            <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Akun</h1>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                     {/* Form for adding account */}
                     <div>
                         <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><UserPlusIcon className="w-5 h-5 mr-2" /> Tambah Akun Baru</h2>
                         <form onSubmit={handleAddAccountSubmit} className="space-y-4">
                             <div>
                                 <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700">Username</label>
                                 <input type="text" id="newUsername" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                             </div>
                             <div>
                                 <label htmlFor="newUserPassword" className="block text-sm font-medium text-gray-700">Password</label>
                                 <input type="password" id="newUserPassword" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required minLength={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                 <p className="mt-1 text-xs text-gray-500">Minimal 6 karakter.</p>
                             </div>
                             {addAccountNotification && (
                                 <div className={`flex items-center p-3 rounded-md text-sm ${addAccountNotification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                     {addAccountNotification.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
                                     {addAccountNotification.message}
                                 </div>
                             )}
                             <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                 Tambah Akun
                             </button>
                         </form>
                     </div>
                     {/* Form for changing own password */}
                     <div>
                         <h2 className="text-lg font-semibold text-gray-800 mb-4">Ubah Password Saya ({loggedInAccount.username})</h2>
                         <form onSubmit={handleMyPasswordSubmit} className="space-y-4">
                             <div>
                                 <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
                                 <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                             </div>
                             <div>
                                 <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Password Baru</label>
                                 <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                  <p className="mt-1 text-xs text-gray-500">Minimal 6 karakter.</p>
                             </div>
                             <div>
                                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                                 <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                             </div>

                             {ownPasswordNotification && (
                                <div className={`flex items-center p-3 rounded-md text-sm ${ownPasswordNotification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {ownPasswordNotification.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
                                    {ownPasswordNotification.message}
                                </div>
                             )}
                             
                             <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Ubah Password</button>
                         </form>
                     </div>
                 </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-xl">
                <h2 className="text-xl font-bold text-gray-900 p-6 border-b flex items-center"><UserGroupIcon className="w-6 h-6 mr-3 text-gray-500"/> Daftar Akun Admin</h2>
                {listNotification && (
                    <div className={`mx-6 mt-[-1rem] mb-4 p-3 rounded-md text-sm flex items-center gap-2 ${listNotification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {listNotification.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                        {listNotification.message}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                           {accounts.map(account => (
                               <tr key={account.id}>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-medium text-gray-800">{account.username} {account.id === loggedInAccount.id && <span className="text-xs text-blue-600 font-normal bg-blue-100 px-2 py-0.5 rounded-full">(Anda)</span>}</p>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <input type={showPasswords[account.id] ? "text" : "password"} value={account.password} readOnly className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 w-32" />
                                            <button onClick={() => toggleShowPassword(account.id)} className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                                {showPasswords[account.id] ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button 
                                            onClick={() => handleDeleteClick(account.id, account.username)} 
                                            disabled={account.id === loggedInAccount.id || accounts.length <= 1}
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                                            title="Hapus Akun"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                   </td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccountManagement;