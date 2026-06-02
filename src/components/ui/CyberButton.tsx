'use client';

const CyberButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative px-8 py-3 font-orbitron font-bold text-[#00F0FF] tracking-widest uppercase text-sm cursor-pointer"
    >
      {/* gradient background: dark teal left → dark purple right */}
      <span className="absolute inset-0 bg-gradient-to-r from-[#0a2a2a] to-[#1a0a2e] transition-all duration-300 group-hover:from-[#00F0FF]/20 group-hover:to-[#7C3AED]/30" />
      {/* cyan border — top & left */}
      <span className="absolute inset-0 border border-[#00F0FF] transition-all duration-300 group-hover:shadow-[0_0_12px_#00F0FF,inset_0_0_12px_#00F0FF22]" />
      {/* purple border offset (bottom-right corner accent) */}
      <span className="absolute bottom-[-3px] right-[-3px] w-full h-full border border-[#7C3AED] transition-all duration-300 group-hover:bottom-[-5px] group-hover:right-[-5px]" />
      {/* glitch scan line on hover */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00F0FF08_2px,#00F0FF08_4px)]" />
      <span className="relative">{children}</span>
    </button>
  );
};

export default CyberButton;
