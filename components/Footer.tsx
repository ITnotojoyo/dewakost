import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} Dewa Kost. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
