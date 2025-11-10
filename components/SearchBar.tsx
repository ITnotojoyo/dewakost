
import React, { useState } from 'react';
import type { FilterState } from '../types';
import { CAMPUSES, FACILITIES } from '../constants';
import { UserIcon, UserGroupIcon } from './icons';

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (newFilters: Partial<FilterState>) => void;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
    const [openSections, setOpenSections] = useState({
        gender: true,
        campus: true,
        facilities: true,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCheckboxChange = (category: 'campuses' | 'facilities', value: string) => {
        const currentValues = filters[category];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value];
        onFilterChange({ [category]: newValues });
    };

    const handleGenderChange = (gender: FilterState['gender']) => {
        onFilterChange({ gender });
    };

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }

    return (
        <div className="bg-white rounded-lg shadow-lg px-6 pt-4 pb-4 h-fit sticky top-24">
            <h3 className="text-xl font-bold mb-4">Filter</h3>

            {/* Location Filter */}
            <div className="mb-6">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
                <input
                    type="text"
                    id="location"
                    value={filters.area}
                    onChange={(e) => onFilterChange({ area: e.target.value })}
                    placeholder="Cth: Sumbersari, Tlogomas..."
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                />
            </div>

            {/* Price Filter */}
            <div className="mb-6">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Harga Maksimal per Bulan</label>
                <input
                    type="range"
                    id="price"
                    min="500000"
                    max="3000000"
                    step="100000"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange({ maxPrice: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-gray-600 mt-2 font-semibold">{formatPrice(filters.maxPrice)}</div>
            </div>
            
            {/* Gender Filter */}
            <div className="border-t pt-4 mb-6">
                <button
                    onClick={() => toggleSection('gender')}
                    className="w-full flex justify-between items-center font-medium text-gray-700 focus:outline-none"
                    aria-expanded={openSections.gender}
                >
                    <span className="text-sm">Tipe Kost</span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform transform ${openSections.gender ? 'rotate-180' : ''}`} />
                </button>
                {openSections.gender && (
                     <div className="mt-3 grid grid-cols-2 gap-2">
                        {(['Semua', 'Putra', 'Putri', 'Campur'] as const).map(genderType => {
                            const isActive = filters.gender === genderType;
                            let colors = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
                            let IconComponent = null;

                            if (genderType === 'Putra') {
                                colors = 'bg-blue-500 hover:bg-blue-600 text-white';
                                IconComponent = UserIcon;
                            } else if (genderType === 'Putri') {
                                colors = 'bg-pink-500 hover:bg-pink-600 text-white';
                                IconComponent = UserIcon;
                            } else if (genderType === 'Campur') {
                                colors = 'bg-green-500 hover:bg-green-600 text-white';
                                IconComponent = UserGroupIcon;
                            }
                            
                            return (
                                <button
                                    key={genderType}
                                    type="button"
                                    onClick={() => handleGenderChange(genderType)}
                                    className={`col-span-${genderType === 'Semua' ? 2 : 1} flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all duration-150 ${colors} ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                >
                                    {IconComponent && <IconComponent className="w-4 h-4 mr-1.5" />}
                                    <span>{genderType}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Campus Filter */}
            <div className="border-t pt-4 mb-6">
                 <button
                    onClick={() => toggleSection('campus')}
                    className="w-full flex justify-between items-center font-medium text-gray-700 focus:outline-none"
                    aria-expanded={openSections.campus}
                >
                    <span className="text-sm">Kampus Terdekat</span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform transform ${openSections.campus ? 'rotate-180' : ''}`} />
                </button>
                {openSections.campus && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2">
                        {CAMPUSES.map(campus => (
                            <div key={campus} className="flex items-center">
                                <input
                                    id={`campus-${campus}`}
                                    type="checkbox"
                                    checked={filters.campuses.includes(campus)}
                                    onChange={() => handleCheckboxChange('campuses', campus)}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`campus-${campus}`} className="ml-3 text-gray-700">{campus}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Facilities Filter */}
            <div className="border-t pt-4">
                <button
                    onClick={() => toggleSection('facilities')}
                    className="w-full flex justify-between items-center font-medium text-gray-700 focus:outline-none"
                    aria-expanded={openSections.facilities}
                >
                    <span className="text-sm">Fasilitas</span>
                     <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform transform ${openSections.facilities ? 'rotate-180' : ''}`} />
                </button>
                {openSections.facilities && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2">
                        {FACILITIES.map(facility => (
                            <div key={facility} className="flex items-center">
                                <input
                                    id={`facility-${facility}`}
                                    type="checkbox"
                                    checked={filters.facilities.includes(facility)}
                                    onChange={() => handleCheckboxChange('facilities', facility)}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`facility-${facility}`} className="ml-3 text-gray-700">{facility}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterPanel;