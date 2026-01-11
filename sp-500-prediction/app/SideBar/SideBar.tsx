import React from 'react';
import { Heart, ChartCandlestick, Spotlight } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  topItems?: { label: string; icon: React.ReactNode; href: string }[];
  bottomItem?: { label: string; icon: React.ReactNode; href: string };
}

const Sidebar: React.FC<SidebarProps> = ({
  topItems = [
    { label: "S&P 500", icon: <ChartCandlestick size={20} />, href: "/sp500" },
    { label: "Heart", icon: <Heart size={20} />, href: "/heart-disease" },
  ],
  bottomItem = { label: "Autor", icon: <Spotlight size={20} />, href: "/autor" }
}) => {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg flex flex-col justify-between">

      <div className="flex flex-col mt-6 bg-red">
        <div className=" h-[45px] bg-red-50 flex text-center mx-auto py-0">
          <h1 className='font-bold font-lg'>Trabalhos ML</h1>
        </div>
        {topItems.map(item => (
          <Link key={item.label} href={item.href} className="flex items-center gap-4 px-6 m-2 rounded-xl py-3 hover:bg-blue-50 transition">
            <span className="text-blue-600">{item.icon}</span>
            <span className="text-slate-900 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Footer Item */}
      {bottomItem && (
        <div className="mb-6 border-t-[1px] border-[#eee]">
          <Link href={bottomItem.href} className="flex items-center gap-5 px-6 py-2 hover:bg-blue-50 transition m-2 rounded-xl">
            <span className="text-blue-600">{bottomItem.icon}</span>
            <span className="text-slate-900 font-medium">{bottomItem.label}</span>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
