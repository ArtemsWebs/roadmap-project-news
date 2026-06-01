'use client';
import { Dot, Wifi } from 'lucide-react';

const TopMenu = () => {
    return (
        <div className="flex justify-between items-center w-full px-6 py-2 border-b border-cyan-200">
            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'><Wifi className="w-4 h-4 text-cyan-400" /> <span className='font-tech text-cyan-400'>UPLINK_OK</span></div>
                <p className="font-tech text-slate-400">SECTOR-7 / DUBNA_CITY</p>
            </div>
            <div className='flex items-center gap-2'>
                <div className='font-tech text-slate-400'>{new Date().toLocaleTimeString()}</div>
                <div className='flex items-center gap-2 rounded-full'>
                    <Dot className='w-1 h-1 bg-fuchsia-400 rounded-full animate-ping' />
                    <p className='font-tech text-fuchsia-400 animate-pulse'>Live</p>
                </div>
            </div>
        </div>
    )
}

export default TopMenu;