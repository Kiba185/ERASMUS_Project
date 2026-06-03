import React from 'react';

const ArrowBack: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return(
        <div className="self-start p-4 pl-0 lg:p-6 lg:pl-0">
        <button onClick={onClick} className="text-palette-pine hover:text-palette-fern transition">
            <img className="w-5 h-5" src="/arrow.png" alt="Zpět" />
        </button>
        </div>
    );
}

export default ArrowBack;
