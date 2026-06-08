import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-tech uppercase tracking-widest text-cyan-300/80">
            {label}
          </label>
        )}
        <input
          {...props}
          id={id}
          ref={ref}
          className={cn(
            'w-full min-w-0 h-[40px] px-3 py-0',
            'border text-cyan-100 placeholder:text-cyan-300/40 font-tech',
            'caret-cyan-300 outline-none transition-all duration-300 ease-out',
            error ? 'border-rose-400' : 'border-cyan-300/60 focus:border-cyan-300',
            'focus:shadow-[0_0_5px_#22d3ee,0_0_15px_#22d3ee,0_0_30px_rgba(34,211,238,0.5)]',
            className,
          )}
          style={{ background: 'rgba(0, 0, 0, 0.55)' }}
        />
        {error && <span className="text-xs font-tech text-rose-400">{error}</span>}
      </div>
    );
  },
);

CyberInput.displayName = 'CyberInput';

export default CyberInput;
