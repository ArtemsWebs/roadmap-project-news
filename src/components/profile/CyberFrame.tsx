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
        vectorEffect="non-scaling-stroke"
      >
        {/* основной контур с фасками */}
        <path d="M16 4 H584 L596 16 V112 L584 124 H16 L4 112 V16 Z" />
        {/* верхняя внутренняя линия (левая часть) */}
        <path d="M24 13 H236" />
      </g>

      {/* левые «брекеты» у углов */}
      <g stroke="currentColor" strokeWidth={5} vectorEffect="non-scaling-stroke">
        <path d="M4 30 V50" />
        <path d="M4 78 V98" />
      </g>

      {/* диагональные полосы в правом-верхнем углу */}
      <g stroke="currentColor" strokeWidth={5} vectorEffect="non-scaling-stroke">
        <path d="M512 5 L486 41" />
        <path d="M532 5 L506 41" />
        <path d="M552 5 L526 41" />
        <path d="M572 5 L546 41" />
        <path d="M590 9 L566 41" />
      </g>

      {/* шевроны снизу по центру */}
      <g stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke">
        <path d="M336 108 L326 115 L336 122" />
        <path d="M356 108 L346 115 L356 122" />
        <path d="M376 108 L366 115 L376 122" />
        <path d="M396 108 L386 115 L396 122" />
        <path d="M416 108 L406 115 L416 122" />
        <path d="M436 108 L426 115 L436 122" />
      </g>
    </svg>
  );
}
