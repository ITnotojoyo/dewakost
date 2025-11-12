import React, { useState, useEffect } from 'react';
import type { Kost } from '../types';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon, StarIcon, TrashIcon, PencilIcon, UserGroupIcon, UserIcon } from './icons';

interface PropertyDetailsProps {
    kost?: Kost;
    onBack: () => void;
    isAdmin: boolean;
    onSubmit: (data: Omit<Kost, 'id'> & { id?: string }) => void;
    mode: 'view' | 'edit' | 'new';
    campuses: string[];
    facilities: string[];
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ kost, onBack, isAdmin, onSubmit, mode, campuses, facilities }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'new');
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    
    const isNew = mode === 'new';

    const [formData, setFormData] = useState({
        id: isNew ? undefined : kost?.id,
        name: isNew ? '' : kost?.name ?? '',
        area: isNew ? '' : kost?.area ?? '',
        address: isNew ? '' : kost?.address ?? '',
        pricePerMonth: isNew ? 750000 : kost?.pricePerMonth ?? 750000,
        rating: isNew ? 4.5 : kost?.rating ?? 4.5,
        imageUrls: isNew ? [] : kost?.imageUrls ?? [],
        description: isNew ? '' : kost?.description ?? '',
        facilities: isNew ? [] : kost?.facilities ?? [],
        nearbyCampuses: isNew ? [] : kost?.nearbyCampuses ?? [],
        contactLink: isNew ? '' : kost?.contactLink ?? '',
        gender: isNew ? 'Campur' as const : kost?.gender ?? 'Campur' as const,
    });

    useEffect(() => {
        if (kost) {
            setFormData({
                id: kost.id,
                name: kost.name ?? '',
                area: kost.area ?? '',
                address: kost.address ?? '',
                pricePerMonth: kost.pricePerMonth ?? 750000,
                rating: kost.rating ?? 4.5,
                imageUrls: kost.imageUrls ?? [],
                description: kost.description ?? '',
                facilities: kost.facilities ?? [],
                nearbyCampuses: kost.nearbyCampuses ?? [],
                contactLink: kost.contactLink ?? '',
                gender: kost.gender ?? 'Campur',
            });
        }
        setIsEditing(mode === 'edit' || mode === 'new');
    }, [kost, mode]);
    
    const displayData = isEditing ? {
      ...formData,
      rating: formData.rating,
      gender: formData.gender,
    } : kost;

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number;

        switch (name) {
            case 'pricePerMonth':
                processedValue = parseInt(value, 10) || 0;
                break;
            default:
                processedValue = value;
        }
        
        setFormData(prev => ({ ...prev, [name]: processedValue as any }));
    };

    const handleCheckboxChange = (category: 'facilities' | 'nearbyCampuses', value: string) => {
        setFormData(prev => {
            const currentValues = prev[category];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(item => item !== value)
                : [...currentValues, value];
            return { ...prev, [category]: newValues };
        });
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);

        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        const QUALITY = 0.7; // For JPEG compression

        const resizeAndCompressImage = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (typeof event.target?.result !== 'string') {
                        return reject(new Error('FileReader did not return a string.'));
                    }

                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let { width, height } = img;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height = Math.round(height * (MAX_WIDTH / width));
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width = Math.round(width * (MAX_HEIGHT / height));
                                height = MAX_HEIGHT;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            return reject(new Error('Failed to get canvas context.'));
                        }

                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL('image/jpeg', QUALITY);
                        resolve(compressedBase64);
                    };
                    img.onerror = (err) => reject(err);
                    img.src = event.target.result;
                };
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(file);
            });
        };

        const imageProcessingPromises = filesArray.map(file => 
            resizeAndCompressImage(file).catch(error => {
                console.error(`Failed to process image ${file.name}:`, error);
                return null; // Return null for failed images
            })
        );

        Promise.all(imageProcessingPromises).then((base64results) => {
            const successfulUploads = base64results.filter((result): result is string => result !== null);
            if (successfulUploads.length < base64results.length) {
                alert('Beberapa gambar gagal diproses. Silakan coba lagi atau gunakan gambar lain.');
            }
            if (successfulUploads.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    imageUrls: [...prev.imageUrls, ...successfulUploads],
                }));
            }
        }).finally(() => {
            // Reset file input to allow uploading the same file again
            if (e.target) {
                e.target.value = '';
            }
        });
    };


    const handleRemoveImage = (indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
        }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    const handleCancel = () => {
      onBack();
    }

    const nextImage = () => {
        if (!displayData || displayData.imageUrls.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % displayData.imageUrls.length);
    };

    const prevImage = () => {
        if (!displayData || displayData.imageUrls.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + displayData.imageUrls.length) % displayData.imageUrls.length);
    };

    const calculateRatingFromEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): number => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const rawRating = (x / width) * 5;
        const preciseRating = Math.round(rawRating * 10) / 10;
        return Math.max(0, Math.min(5, preciseRating));
    };

    const handleStarMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setHoverRating(calculateRatingFromEvent(e));
    };

    const handleStarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const newRating = calculateRatingFromEvent(e);
        setFormData(prev => ({ ...prev, rating: newRating }));
    };

    const getGenderBadgeClass = (gender: Kost['gender']) => {
        switch (gender) {
          case 'Putra': return 'bg-blue-500';
          case 'Putri': return 'bg-pink-500';
          case 'Campur': return 'bg-green-500';
          default: return 'bg-gray-500';
        }
    };
    const GenderIcon = displayData?.gender === 'Campur' ? UserGroupIcon : UserIcon;
    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(displayData?.address || 'Malang')}&t=&z=15&ie=UTF8&iwloc=&output=embed`;


    if (!displayData && !isNew) return <p>Loading...</p>

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
                 <button 
                    onClick={onBack} 
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium py-2 px-4 rounded-lg inline-flex items-center transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    {isEditing ? 'Batal' : 'Kembali ke hasil'}
                </button>
                {isAdmin && !isEditing && kost && (
                     <button
                        type="button"
                        onClick={() => window.location.hash = `#/admin/edit/${kost.id}?from=${encodeURIComponent(window.location.hash.substring(1))}`}
                        className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Edit Properti"
                    >
                        <PencilIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
           
            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image Gallery */}
                        <div className="p-4 sm:p-6">
                            {isEditing ? (
                                <div>
                                    <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700">Tambah Gambar</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="image-upload-input" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload file</span>
                                                    <input id="image-upload-input" name="imageUrls" type="file" className="sr-only" multiple onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" />
                                                </label>
                                                <p className="pl-1">atau drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Gambar pertama akan menjadi thumbnail.</p>
                                    
                                    {formData.imageUrls.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                            {formData.imageUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img src={url} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-md" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Remove image"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                             <div className={`relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden ${isEditing && !formData.imageUrls.length ? 'mt-4' : ''} ${!isEditing ? 'mt-0' : ''}`}>
                                {displayData.imageUrls.length > 0 ? (
                                    <img src={displayData.imageUrls[currentImageIndex]} alt={`${displayData.name} ${currentImageIndex + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">Tidak ada gambar</div>
                                )}
                                { displayData.imageUrls.length > 1 &&
                                <div className="absolute inset-0 flex items-center justify-between px-2">
                                    <button type="button" onClick={prevImage} className="bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full p-2 transition">
                                        <ChevronLeftIcon className="w-6 h-6" />
                                    </button>
                                    <button type="button" onClick={nextImage} className="bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full p-2 transition">
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                }
                            </div>
                            {/* Thumbnail Gallery */}
                            {!isEditing && displayData.imageUrls.length > 1 && (
                                <div className="mt-4 grid grid-cols-5 gap-3">
                                    {displayData.imageUrls.map((url, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`relative aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${currentImageIndex === index ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent hover:ring-gray-400'}`}
                                            aria-label={`Lihat gambar ${index + 1}`}
                                        >
                                            <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                            <div className={`absolute inset-0 bg-white transition-opacity duration-200 ${currentImageIndex === index ? 'opacity-0' : 'opacity-40 hover:opacity-10'}`}></div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Kost Details */}
                        <div className="p-4 sm:p-8 flex flex-col justify-between">
                            <div>
                                {isEditing ? (
                                    <div className="mb-4">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Kost</label>
                                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 text-3xl font-bold bg-white text-gray-900 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                ) : (
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayData.name}</h1>
                                )}
                                
                                <div className="flex items-center text-gray-600 mb-4">
                                    <MapPinIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                                    {isEditing ? (
                                        <div className="w-full">
                                            <label htmlFor="address" className="sr-only">Alamat Lengkap</label>
                                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="w-full bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" placeholder="Alamat Lengkap"/>
                                        </div>
                                    ) : (
                                        <p>{displayData.address}</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <>
                                        <div className="mb-4">
                                            <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area/Kawasan</label>
                                            <input type="text" name="area" id="area" value={formData.area} onChange={handleChange} required className="mt-1 w-full bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" placeholder="Cth: Sumbersari" />
                                        </div>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Tipe Kost</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['Putra', 'Putri', 'Campur'] as const).map(genderType => {
                                                    const isActive = formData.gender === genderType;
                                                    let colors = '';
                                                    switch(genderType) {
                                                        case 'Putra': colors = 'bg-blue-500 hover:bg-blue-600 text-white'; break;
                                                        case 'Putri': colors = 'bg-pink-500 hover:bg-pink-600 text-white'; break;
                                                        case 'Campur': colors = 'bg-green-500 hover:bg-green-600 text-white'; break;
                                                    }
                                                    const Icon = genderType === 'Campur' ? UserGroupIcon : UserIcon;
                                                    return (
                                                        <button
                                                            key={genderType}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, gender: genderType }))}
                                                            className={`flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all duration-150 ${colors} ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                                        >
                                                            <Icon className="w-4 h-4 mr-1.5" />
                                                            <span>{genderType}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                <div className="flex items-center mb-4 space-x-4">
                                    <div className="flex items-center bg-blue-100 text-blue-800 text-md font-bold px-3 py-1 rounded-full">
                                        <StarIcon className="w-5 h-5 mr-1.5 text-blue-500" />
                                        {displayData.rating.toFixed(1)}
                                    </div>
                                    {!isEditing && (
                                        <div className={`flex items-center text-md font-bold px-3 py-1 rounded-full text-white ${getGenderBadgeClass(displayData.gender)}`}>
                                            <GenderIcon className="w-5 h-5 mr-1.5" />
                                            <span>{displayData.gender}</span>
                                        </div>
                                    )}
                                </div>
                                {isEditing ? (
                                    <>
                                        <div className="mb-4">
                                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="flex relative cursor-pointer"
                                                    onMouseMove={handleStarMouseMove}
                                                    onMouseLeave={() => setHoverRating(null)}
                                                    onClick={handleStarClick}
                                                >
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon key={`bg-${i}`} className="w-8 h-8 text-gray-300" />
                                                        ))}
                                                    </div>
                                                    <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${((hoverRating ?? formData.rating) / 5) * 100}%` }}>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <StarIcon key={`fg-${i}`} className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-100 border border-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded-md w-28 text-center tabular-nums">
                                                    {(hoverRating ?? formData.rating).toFixed(1)} / 5.0
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-700 leading-relaxed mb-6">{displayData.description}</p>
                                )}
                                
                                {displayData.address && (
                                <div className="my-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Lokasi di Peta</h3>
                                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow">
                                        <iframe
                                            key={displayData.address}
                                            className="w-full h-full border-0"
                                            loading="lazy"
                                            allowFullScreen
                                            src={mapSrc}>
                                        </iframe>
                                    </div>
                                </div>
                                )}
                                
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Fasilitas</h3>
                                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                                        { (isEditing ? facilities : displayData.facilities).map(facility => (
                                            isEditing ? (
                                                <div key={facility} className="flex items-center">
                                                    <input id={`facility-${facility}`} type="checkbox" checked={formData.facilities.includes(facility)} onChange={() => handleCheckboxChange('facilities', facility)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                                    <label htmlFor={`facility-${facility}`} className="ml-3 block text-sm text-gray-700">{facility}</label>
                                                </div>
                                            ) : (
                                                <li key={facility} className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                    {facility}
                                                </li>
                                            )
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Kampus Terdekat</h3>
                                    <div className="flex flex-wrap gap-2">
                                        { (isEditing ? campuses : displayData.nearbyCampuses).map(campus => (
                                            isEditing ? (
                                                <div key={campus} className="flex items-center">
                                                    <input id={`campus-${campus}`} type="checkbox" checked={formData.nearbyCampuses.includes(campus)} onChange={() => handleCheckboxChange('nearbyCampuses', campus)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                                    <label htmlFor={`campus-${campus}`} className="ml-3 block text-sm text-gray-700">{campus}</label>
                                                </div>
                                            ) : (
                                               <span key={campus} className="bg-gray-200 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{campus}</span>
                                            )
                                        ))}
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="mt-6">
                                        <label htmlFor="contactLink" className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp Pemilik</label>
                                        <div className="mt-1">
                                            <input
                                                type="tel"
                                                name="contactLink"
                                                id="contactLink"
                                                value={formData.contactLink.replace('https://wa.me/', '')}
                                                onChange={(e) => {
                                                    const numberOnly = e.target.value.replace(/\D/g, ''); // Allow only digits
                                                    setFormData(prev => ({...prev, contactLink: `https://wa.me/${numberOnly}`}));
                                                }}
                                                placeholder="628123456789"
                                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">Hanya masukkan nomor, contoh: 6281234567890</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200">
                               <div className="mb-4">
                                    <span className="text-sm text-gray-500">Mulai dari</span>
                                    {isEditing ? (
                                        <input type="number" name="pricePerMonth" id="pricePerMonth" value={formData.pricePerMonth} onChange={handleChange} required min="0" step="50000" className="mt-1 text-3xl font-bold bg-white text-gray-900 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" />
                                    ) : (
                                        <p className="text-3xl font-bold text-gray-900">
                                            {formatPrice(displayData.pricePerMonth)}
                                            <span className="text-lg font-normal text-gray-500"> / bulan</span>
                                        </p>
                                    )}
                                </div>
                                {isAdmin && isEditing ? (
                                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 shadow-lg text-lg">
                                        Simpan Perubahan
                                    </button>
                                ) : (
                                    <>
                                        {displayData.contactLink && displayData.contactLink.replace('https://wa.me/', '').length > 0 ? (
                                            <a
                                                href={displayData.contactLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-center w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg text-lg"
                                            >
                                                Hubungi Pemilik
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full bg-gray-400 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed shadow-lg text-lg"
                                            >
                                                Kontak Tidak Tersedia
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PropertyDetails;