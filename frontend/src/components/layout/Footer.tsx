import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
            <footer className="w-full z-5 bg-palette-mist border-t border-palette-lichen/45 px-3 py-3 sm:px-6 lg:px-8 flex min-h-16 items-center justify-between gap-3">
                <div className="w-20 shrink-0 scale-90 flex items-center justify-start space-x-2 cursor-pointer sm:w-32 sm:scale-100" onClick={() => navigate('/dashboard')}>
                    <Logo />
                </div>
                <div className="min-w-0 flex-1 px-1 text-center text-[11px] leading-snug text-gray-600 sm:px-4 sm:text-sm sm:leading-relaxed">
                    <p>© 2026 Engineers. All rights reserved (maybe not).</p>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">               
                    <a href="https://ctrlv.cz/NMza">
                        <i className="fa-brands fa-instagram text-xl sm:text-2xl"></i>
                    </a>
                    <a href="https://ctrlv.cz/NMza">
                        <i className="fa-brands fa-facebook text-xl -translate-y-0.5 sm:text-[22px]"></i>
                    </a>
                </div>
            </footer>
    );
};

export default Footer;
