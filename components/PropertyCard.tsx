import React from 'react';
import type { Kost } from '../types';
import { MapPinIcon, StarIcon, TrashIcon, EyeIcon, EyeSlashIcon, UserGroupIcon, UserIcon } from './icons';

interface PropertyCardProps {
  kost: Kost;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ kost, isAdmin, onDelete, onToggleArchive }) => {
  
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    onDelete(kost.id);
  }

  const handleToggleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleArchive(kost.id);
  };
  
  const getGenderBadgeClass = (gender: Kost['gender']) => {
    switch (gender) {
      case 'Putra': return 'bg-blue-500';
      case 'Putri': return 'bg-pink-500';
      case 'Campur': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  const GenderIcon = kost.gender === 'Campur' ? UserGroupIcon : UserIcon;
  const cardClasses = `rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative ${kost.isArchived ? 'bg-gray-100 opacity-60' : 'bg-white'}`;

  const handleCardClick = () => {
    window.location.hash = `#/kost/${kost.id}`;
  };

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button
                onClick={handleToggleArchive}
                className="bg-yellow-500 text-white rounded-full p-2 hover:bg-yellow-600 transition-colors shadow-md"
                aria-label={kost.isArchived ? "Unarchive property" : "Archive property"}
            >
                {kost.isArchived ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
            </button>
            <button 
              onClick={handleDelete}
              className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-md"
              aria-label="Delete property"
            >
               <TrashIcon className="h-5 w-5" />
            </button>
        </div>
      )}
      {kost.isArchived && (
          <div className="absolute top-2 left-2 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded z-10">
              DIARSIPKAN
          </div>
      )}
      <img className="h-56 w-full object-cover" src={kost.imageUrls[0]} alt={kost.name} />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 leading-tight mb-2">{kost.name}</h3>
        <div className="flex items-center flex-wrap gap-2 mb-2">
            <div className="flex items-center bg-blue-100 text-blue-800 text-sm font-bold px-2.5 py-0.5 rounded-full">
                <StarIcon className="w-4 h-4 mr-1 text-blue-500" />
                {kost.rating.toFixed(1)}
            </div>
            <div className={`flex items-center text-sm font-bold px-2.5 py-0.5 rounded-full text-white ${getGenderBadgeClass(kost.gender)}`}>
              <GenderIcon className="w-4 h-4 mr-1.5" />
              <span>{kost.gender}</span>
            </div>
        </div>
        <div className="flex flex-wrap items-center text-gray-600 text-sm mb-4">
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>{kost.area}, Malang</span>
            </div>
        </div>
        <div className="mt-auto">
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(kost.pricePerMonth)}
            <span className="text-sm font-normal text-gray-500"> / bulan</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;