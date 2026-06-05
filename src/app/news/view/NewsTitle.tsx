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
    <div className="flex gap-4 justify-start items-center">
      <div className="flex items-center gap-4">
        <div className="w-[7px] h-[16px] bg-cyberPink-500 rounded-full" />
        <h3 className="text-2xl font-bold font-orbitron text-sky-100">
          LATEST_TRANSMISSIONS
        </h3>
      </div>
      <div
        className="h-[1px] w-[70%] opacity-60"
        style={{
          background:
            'linear-gradient(90deg, rgba(0, 0, 0, 0.00) 0%, #00F0FF 33.33%, #FF2BD6 66.67%, rgba(0, 0, 0, 0.00) 100%)',
        }}
      />
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
