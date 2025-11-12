
import React from 'react';
import { InstagramIcon, TiktokIcon, FacebookIcon, WhatsAppIcon } from './icons';

interface SocialLinks {
    instagram: string;
    tiktok: string;
    facebook: string;
    whatsapp: string;
}

interface FooterProps {
    socialLinks: SocialLinks;
}

const Footer: React.FC<FooterProps> = ({ socialLinks }) => {
    const socialMedia = [
        { name: 'Instagram', href: socialLinks.instagram, icon: InstagramIcon },
        { name: 'TikTok', href: socialLinks.tiktok, icon: TiktokIcon },
        { name: 'Facebook', href: socialLinks.facebook, icon: FacebookIcon },
        { name: 'WhatsApp', href: socialLinks.whatsapp, icon: WhatsAppIcon },
    ];

    return (
        <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                <div className="flex justify-center space-x-6 mb-4">
                    {socialMedia.map((item) => (
                       item.href && (
                         <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">{item.name}</span>
                            <item.icon className="h-6 w-6" aria-hidden="true" />
                        </a>
                       )
                    ))}
                </div>
                <p>&copy; {new Date().getFullYear()} Dewa Kost. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;