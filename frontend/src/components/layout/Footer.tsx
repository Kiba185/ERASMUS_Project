import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
            <footer className="h-16 lg:px-8 w-full z-5 bg-palette-mist border-t border-palette-lichen/45 flex justify-between items-center">
                <div className="w-32 flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <Logo />
                </div>
                <div className="text-gray-600 text-sm">
                    <p>© 2026 Engineers. All rights reserved (maybe not).</p>
                </div>
                <div>               
                    <a href="https://ctrlv.cz/NMza" className="mr-3">
                        <i className="fa-brands fa-instagram text-2xl"></i>
                    </a>
                    <a href="https://ctrlv.cz/NMza">
                        <i className="fa-brands fa-facebook text-[22px] -translate-y-0.5"></i>
                    </a>
                </div>
            </footer>
    );
};

export default Footer;
