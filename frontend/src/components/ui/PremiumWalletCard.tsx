interface PremiumWalletCardProps {
  balance?: number;
  isLoading?: boolean;
  walletId?: string | number;
}

export const PremiumWalletCard = ({ balance = 0, isLoading = false, walletId = '0000' }: PremiumWalletCardProps) => {
  return (
    <div className="relative w-full aspect-[1.586/1] max-h-[350px] mx-auto rounded-[20px] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* The Copper/Rose Gold Rim (Thick Border) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E2A980] via-[#D18E66] to-[#E2A980] rounded-[20px] p-[3px]">
        
        {/* Inner Card (Black brushed metal look) */}
        <div className="relative w-full h-full rounded-[17px] bg-gradient-to-br from-[#1c1c1e] to-[#0a0a0c] overflow-hidden">
          
          {/* Subtle Brushed Metal Texture / Noise (using a mix-blend overlay) */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/brushed-alum.png')" }}
          />

          {/* Embossed L Pattern (Background) */}
          <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none flex flex-wrap gap-4 -rotate-12 scale-150 transform-gpu">
            {Array.from({ length: 50 }).map((_, i) => (
              <span key={i} className="material-symbols-outlined text-white text-6xl font-bold tracking-tighter" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>spa</span>
            ))}
          </div>
          
          {/* Subtle spotlight/glare effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full" style={{ transition: 'all 1.5s ease-in-out' }} />

          {/* Card Content Layout */}
          <div className="relative w-full h-full p-6 sm:p-8 flex flex-col justify-between text-[#d6aa85]">
            
            {/* Top Row: Logo & Brand Name */}
            <div className="flex justify-between items-start">
              {/* Left Side: Smart Chip */}
              <div className="flex items-center">
                <div className="w-12 h-10 sm:w-14 sm:h-11 rounded-md border border-[#9c7853] bg-gradient-to-br from-[#d4b08c] via-[#b3885d] to-[#9c7853] shadow-inner relative overflow-hidden flex items-center justify-center">
                  {/* Chip lines */}
                  <div className="absolute w-[1px] h-full bg-[#7a5b3d]/50 left-1/3" />
                  <div className="absolute w-[1px] h-full bg-[#7a5b3d]/50 right-1/3" />
                  <div className="absolute h-[1px] w-full bg-[#7a5b3d]/50 top-1/2" />
                  <div className="w-6 h-6 border border-[#7a5b3d]/50 rounded-full" />
                </div>
                {/* Contactless symbol */}
                <span className="material-symbols-outlined ml-4 text-2xl opacity-80" style={{ transform: 'rotate(90deg)' }}>wifi</span>
              </div>
              
              {/* Right Side: Brand */}
              <div className="text-right flex flex-col items-end">
                <p className="font-display-lg text-lg sm:text-2xl tracking-[0.2em] uppercase bg-gradient-to-r from-[#dca77a] via-[#f7d6b3] to-[#c18d5f] text-transparent bg-clip-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                  Lumina
                </p>
                <p className="font-label-sm text-[8px] sm:text-[10px] tracking-[0.3em] uppercase mt-0.5 opacity-90">
                  Elite
                </p>
              </div>
            </div>

            {/* Center: Large Logo & Name (matching the provided image) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="material-symbols-outlined text-5xl sm:text-7xl mb-2 bg-gradient-to-b from-[#f7d6b3] to-[#b3885d] text-transparent bg-clip-text drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>spa</span>
              <p className="font-display-lg text-xl sm:text-2xl tracking-[0.3em] uppercase bg-gradient-to-r from-[#dca77a] via-[#f7d6b3] to-[#c18d5f] text-transparent bg-clip-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Lumina <span className="opacity-50 font-light px-2">|</span> Elite
              </p>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-col gap-4 relative z-10 mt-auto">
              
              {/* Card Number */}
              <div className="font-mono text-lg sm:text-2xl tracking-[0.2em] sm:tracking-[0.3em] bg-gradient-to-r from-[#dca77a] via-[#f7d6b3] to-[#c18d5f] text-transparent bg-clip-text drop-shadow-[0_1px_2px_rgba(0,0,0,1)] text-right w-full flex justify-end">
                <span className="opacity-70 mr-4">**** **** ****</span> {walletId.toString().padStart(4, '0')}
              </div>
              
              <div className="flex justify-between items-end w-full">
                {/* Member Info */}
                <div className="flex flex-col">
                  <p className="font-serif text-[8px] sm:text-[10px] tracking-widest uppercase opacity-80">Elite Premier Member</p>
                  <p className="font-serif text-[8px] sm:text-[10px] tracking-widest uppercase opacity-80">Since 2024</p>
                  <p className="font-serif text-sm sm:text-lg tracking-[0.1em] sm:tracking-[0.2em] uppercase mt-1 sm:mt-2 bg-gradient-to-r from-[#dca77a] via-[#f7d6b3] to-[#c18d5f] text-transparent bg-clip-text drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                    ALEXANDER VON SCHMIDT
                  </p>
                </div>

                {/* Expiry / Balance info */}
                <div className="flex flex-col items-end text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[6px] sm:text-[8px] uppercase tracking-widest opacity-80 leading-tight">Valid<br/>Thru</p>
                    <p className="font-mono text-sm sm:text-base tracking-widest bg-gradient-to-r from-[#dca77a] via-[#f7d6b3] to-[#c18d5f] text-transparent bg-clip-text drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">11/28</p>
                  </div>
                  {/* Balance Display */}
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-[#9c7853]/30">
                    <p className="text-[8px] uppercase tracking-widest opacity-70 mb-0.5">Balance</p>
                    <p className="font-mono font-bold text-sm sm:text-lg text-white">
                      ₹ {isLoading ? '---' : balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
