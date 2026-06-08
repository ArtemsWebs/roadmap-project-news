/**
 * Жёлтая HUD-рамка (по мотивам нижней-левой рамки из набора):
 * угловые фаски, диагональные полосы в правом-верхнем углу, шевроны снизу.
 * Растягивается под размер контейнера (preserveAspectRatio=none),
 * толщина линий стабильна за счёт non-scaling-stroke.
 */
export default function CyberFrame({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 128"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* основной контур с фасками */}
        <path d="M16 4 H584 L596 16 V112 L584 124 H16 L4 112 V16 Z" />
        {/* верхняя внутренняя линия (левая часть) */}
        <path d="M24 13 H236" />
      </g>

      {/* левые грипы: толстая скруглённая палка + тонкий акцент, с инсетом от края */}
      <g
        stroke="currentColor"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        <path d="M8 30 V52" strokeWidth={5} />
        <path d="M13 35 V47" strokeWidth={2} />
        <path d="M8 76 V98" strokeWidth={5} />
        <path d="M13 81 V93" strokeWidth={2} />
      </g>

      {/* диагональные полосы в правом-верхнем углу */}

      <g
        stroke="currentColor"
        stroke-linecap=""
        vector-effect="non-scaling-stroke"
      >
        <path d="M596 30 V52" stroke-width="5"></path>
        <path d="M591 35 V47" stroke-width="2"></path>
        <path d="M596 76 V98" stroke-width="5"></path>
        <path d="M591 81 V93" stroke-width="2"></path>
      </g>
    </svg>
  );
}
