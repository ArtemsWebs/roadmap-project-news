import { LightStrikeIcon } from '@/shared/icons/LightStrike';

const LogoContent = () => {
  return (
    <div className="flex items-center w-full px-3 md:px-6 py-2 justify-between gap-2 flex-wrap">
      <div className="flex items-center min-w-0 [&>svg]:w-14 [&>svg]:h-14 md:[&>svg]:w-[84px] md:[&>svg]:h-[84px] [&>svg]:shrink-0">
        <LightStrikeIcon width={84} height={84} />
        <div className="flex flex-col items-start justify-center min-w-0">
          <h1
            className="text-[22px] sm:text-[28px] md:text-[36px] font-orbitron font-black text-[#00F0FF]"
            style={{
              letterSpacing: '1.5px',
              textShadow: [
                '2px 0px 0px white', // белый 1й слой
                '4px 0px 0px #FF2BD6', // фиолетовый 2й слой
              ].join(', '),
            }}
          >
            NEON://NEWS
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-tech truncate">
            v7.3.1 — decentralized news protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoContent;
