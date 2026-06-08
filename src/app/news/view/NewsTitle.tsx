import { GradientDivider } from '@/components/ui/GradientDivider';
import { DotDelimetr } from '@/components/ui/DotDelimetr';

interface NewsTitleProps {
  /** Текущая страница (с 1) */
  page?: number;
  /** Сколько статей показано сейчас */
  shown?: number;
  /** Всего найдено статей */
  total?: number;
}

const NewsTitle = ({ page = 1, shown = 0, total = 0 }: NewsTitleProps) => {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between items-center">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-[7px] h-[16px] bg-cyberPink-500 rounded-full shrink-0" />
        <h3 className="text-xl md:text-2xl font-bold font-orbitron text-sky-100">
          LATEST_TRANSMISSIONS
        </h3>
      </div>
      <GradientDivider className="hidden md:block w-auto min-w-[50%] max-w-[70%]" />
      <div className="flex items-center gap-1">
        <p className="font-tech text-slate-400 w-max tracking-[0.5px]">
          {'page ' + page}
        </p>
        <DotDelimetr className="mx-2" />
        <p className="font-tech text-slate-400 w-max tracking-[0.5px]">
          {shown}/{total}
        </p>
      </div>
    </div>
  );
};

export default NewsTitle;
