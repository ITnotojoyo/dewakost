import React from 'react';
import { HistoryIcon } from './icons';

interface HeaderProps {
    isAdmin: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onHistoryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, onLoginClick, onLogoutClick, onHistoryClick }) => {
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
            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span className="sr-only">Help</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </button>
            {isAdmin ? (
                <>
                    <a href="#/admin/dashboard" className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full whitespace-nowrap hover:bg-green-200 transition-colors">
                        Admin Mode
                    </a>
                     <button onClick={onHistoryClick} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Lihat Riwayat">
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