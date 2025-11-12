
import React from 'react';
import { HistoryIcon, Squares2X2Icon, EyeIcon } from './icons';
import type { Account } from '../types';

interface HeaderProps {
    loggedInAccount: Account | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onHistoryClick: () => void;
    currentHash: string;
}

const Header: React.FC<HeaderProps> = ({ loggedInAccount, onLoginClick, onLogoutClick, onHistoryClick, currentHash }) => {
  const isInAdminArea = currentHash.startsWith('#/admin/');
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center min-h-16 py-3">
          <div className="flex-shrink-0">
            <a href="#/" className="flex items-center">
              <img src="https://i.ibb.co.com/93wz07PS/dewakos1.png" alt="Dewa Kost Logo" className="h-12" />
            </a>
          </div>
          <div className="flex items-center flex-wrap justify-end gap-x-4 gap-y-2">
            {loggedInAccount ? (
                <>
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Masuk sebagai: <span className="font-bold">{loggedInAccount.username}</span>
                    </span>
                    {isInAdminArea ? (
                        <button onClick={() => window.location.hash = '#/'} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Lihat Live View" title="Live View">
                            <EyeIcon className="h-6 w-6" />
                        </button>
                    ) : (
                        <button onClick={() => window.location.hash = '#/admin/dashboard'} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Buka Dashboard" title="Dashboard">
                            <Squares2X2Icon className="h-6 w-6" />
                        </button>
                    )}
                     <button onClick={onHistoryClick} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Lihat Riwayat" title="Riwayat Aktivitas">
                        <HistoryIcon className="h-6 w-6" />
                    </button>
                    <button onClick={onLogoutClick} className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition duration-150">
                        Sign out
                    </button>
                </>
            ) : (
                <button onClick={onLoginClick} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-150">
                    Sign in
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;