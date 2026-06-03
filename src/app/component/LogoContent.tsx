import CyberButton from '@/components/ui/CyberButton';
import { LightStrikeIcon } from '@/shared/icons/LightStrike';

const LogoContent = () => {
  return (
    <div className="flex items-center w-full px-6 py-2 justify-between">
      <div className="flex items-center">
        <LightStrikeIcon width={84} height={84} />
        <div className="flex flex-col items-center justify-center items-start">
          <h1
            className="text-[36px]  font-orbitron font-black text-[#00F0FF]"
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
          <p className="text-sm text-gray-500 font-tech">
            v7.3.1 — decentralized news protocol
          </p>
        </div>
      </div>
      <CyberButton>
        <span className="text-sm font-tech">Subscribe</span>
      </CyberButton>
    </div>
  );
};

export default LogoContent;
