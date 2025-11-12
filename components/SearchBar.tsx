

import React, { useState } from 'react';
import type { FilterState } from '../types';
import { UserIcon, UserGroupIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, PlusIcon } from './icons';

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (newFilters: Partial<FilterState>) => void;
    campuses: string[];
    facilities: string[];
    isAdmin: boolean;
    onAddFilter: (type: 'campuses' | 'facilities', value: string) => void;
    onUpdateFilter: (type: 'campuses' | 'facilities', oldValue: string, newValue: string) => void;
    onDeleteFilter: (type: 'campuses' | 'facilities', value: string) => void;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


interface EditableFilterListProps {
    type: 'campuses' | 'facilities';
    items: string[];
    filters: FilterState;
    isAdmin: boolean;
    editingItem: { type: 'campuses' | 'facilities'; originalValue: string; currentValue: string; } | null;
    newItemValue: string;
    handleCheckboxChange: (category: 'campuses' | 'facilities', value: string) => void;
    setEditingItem: React.Dispatch<React.SetStateAction<{ type: 'campuses' | 'facilities'; originalValue: string; currentValue: string; } | null>>;
    handleSaveEdit: () => void;
    onDeleteFilter: (type: 'campuses' | 'facilities', value: string) => void;
    setNewItemValue: React.Dispatch<React.SetStateAction<string>>;
    handleAddNew: (type: 'campuses' | 'facilities') => void;
}

const EditableFilterList: React.FC<EditableFilterListProps> = ({
    type,
    items,
    filters,
    isAdmin,
    editingItem,
    newItemValue,
    handleCheckboxChange,
    setEditingItem,
    handleSaveEdit,
    onDeleteFilter,
    setNewItemValue,
    handleAddNew
}) => {
    const placeholder = type === 'campuses' ? 'Kampus Baru' : 'Fasilitas Baru';

    return (
        <>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2">
                {items.map(item => {
                    const isEditingThis = editingItem?.type === type && editingItem.originalValue === item;
                    return (
                         <div key={item} className="flex items-center group relative -ml-2 -mr-2 px-2 py-0.5 rounded-md hover:bg-gray-100">
                            {isEditingThis ? (
                                <div className="flex items-center w-full gap-1">
                                    <input
                                        type="text"
                                        value={editingItem.currentValue}
                                        onChange={(e) => setEditingItem({ ...editingItem, currentValue: e.target.value })}
                                        className="flex-grow p-1 border border-blue-300 rounded-md text-sm shadow-sm"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit();
                                            if (e.key === 'Escape') setEditingItem(null);
                                        }}
                                    />
                                    <button onClick={handleSaveEdit} className="p-1.5 text-green-500 hover:bg-green-100 rounded-full"><CheckIcon className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingItem(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full"><XMarkIcon className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        id={`${type}-${item}`}
                                        type="checkbox"
                                        checked={filters[type].includes(item)}
                                        onChange={() => handleCheckboxChange(type, item)}
                                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`${type}-${item}`} className="ml-3 text-gray-700 flex-grow cursor-pointer">{item}</label>
                                    {isAdmin && (
                                        <div className="absolute right-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded-full">
                                            <button onClick={() => setEditingItem({ type, originalValue: item, currentValue: item })} className="p-1.5 text-gray-400 hover:text-blue-600" title="Ubah"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => onDeleteFilter(type, item)} className="p-1.5 text-gray-400 hover:text-red-600" title="Hapus"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
            {isAdmin && (
                <div className="mt-3 flex gap-2">
                    <input
                        type="text"
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(e.target.value)}
                        placeholder={`+ Tambah ${placeholder}`}
                        className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNew(type)}
                    />
                     <button
                        onClick={() => handleAddNew(type)}
                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm disabled:bg-gray-300"
                        disabled={!newItemValue.trim()}
                        aria-label={`Tambah ${placeholder}`}
                    >
                       <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </>
    );
};


const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, campuses, facilities, isAdmin, onAddFilter, onUpdateFilter, onDeleteFilter }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [editingItem, setEditingItem] = useState<{ type: 'campuses' | 'facilities'; originalValue: string; currentValue: string; } | null>(null);
    const [newCampus, setNewCampus] = useState('');
    const [newFacility, setNewFacility] = useState('');


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
    
    const activeFiltersCount =
        (filters.area ? 1 : 0) +
        (filters.maxPrice < 3000000 ? 1 : 0) +
        (filters.gender !== 'Semua' ? 1 : 0) +
        filters.campuses.length +
        filters.facilities.length;

    const renderFilterSummary = () => {
        if (activeFiltersCount === 0) {
            return <p className="text-sm text-gray-500 pt-4">Tidak ada filter aktif.</p>;
        }
        
        const Badge: React.FC<{children: React.ReactNode}> = ({ children }) => (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                {children}
            </span>
        );

        return (
            <div className="mt-2 flex flex-wrap gap-2">
                {filters.area && <Badge>Lokasi: {filters.area}</Badge>}
                {filters.maxPrice < 3000000 && <Badge>Harga &lt; {formatPrice(filters.maxPrice)}</Badge>}
                {filters.gender !== 'Semua' && <Badge>Tipe: {filters.gender}</Badge>}
                {filters.campuses.map(c => <Badge key={c}>{c}</Badge>)}
                {filters.facilities.map(f => <Badge key={f}>{f}</Badge>)}
            </div>
        );
    }

    const handleSaveEdit = () => {
        if (editingItem) {
            onUpdateFilter(editingItem.type, editingItem.originalValue, editingItem.currentValue);
            setEditingItem(null);
        }
    };

    const handleAddNew = (type: 'campuses' | 'facilities') => {
        if (type === 'campuses') {
            onAddFilter('campuses', newCampus);
            setNewCampus('');
        } else {
            onAddFilter('facilities', newFacility);
            setNewFacility('');
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg h-fit sticky top-24">
            <button
                onClick={() => setIsPanelOpen(prev => !prev)}
                className="w-full flex justify-between items-center px-6 py-4 focus:outline-none"
                aria-expanded={isPanelOpen}
            >
                <div className="flex items-center">
                    <h3 className="text-xl font-bold text-gray-900">Filter</h3>
                    {activeFiltersCount > 0 && (
                        <span className="ml-3 inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">{activeFiltersCount}</span>
                    )}
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform transform ${isPanelOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {!isPanelOpen && (
                <div className="px-6 pb-4 border-t">
                    {activeFiltersCount > 0 && (
                        <h4 className="text-sm font-semibold text-gray-600 pt-4">Filter Aktif:</h4>
                    )}
                    {renderFilterSummary()}
                </div>
            )}

            {isPanelOpen && (
                <div className="px-6 pb-4 border-t">
                    {/* Location Filter */}
                    <div className="mb-6 pt-4">
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
                         <h4 className="font-medium text-gray-700 text-sm mb-3">Tipe Kost</h4>
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
                    </div>

                    {/* Campus Filter */}
                    <div className="border-t pt-4 mb-6">
                        <h4 className="font-medium text-gray-700 text-sm mb-3">Kampus Terdekat</h4>
                        <EditableFilterList 
                            type="campuses"
                            items={campuses}
                            filters={filters}
                            isAdmin={isAdmin}
                            editingItem={editingItem}
                            newItemValue={newCampus}
                            handleCheckboxChange={handleCheckboxChange}
                            setEditingItem={setEditingItem}
                            handleSaveEdit={handleSaveEdit}
                            onDeleteFilter={onDeleteFilter}
                            setNewItemValue={setNewCampus}
                            handleAddNew={handleAddNew}
                        />
                    </div>

                    {/* Facilities Filter */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-700 text-sm mb-3">Fasilitas</h4>
                        <EditableFilterList
                             type="facilities"
                             items={facilities}
                             filters={filters}
                             isAdmin={isAdmin}
                             editingItem={editingItem}
                             newItemValue={newFacility}
                             handleCheckboxChange={handleCheckboxChange}
                             setEditingItem={setEditingItem}
                             handleSaveEdit={handleSaveEdit}
                             onDeleteFilter={onDeleteFilter}
                             setNewItemValue={setNewFacility}
                             handleAddNew={handleAddNew}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
