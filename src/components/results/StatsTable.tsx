import type { GameStats } from '../../types';

interface Props {
  myNickname: string;
  oppNickname: string;
  myStats?: GameStats;
  oppStats?: GameStats;
}

export function StatsTable({ myNickname, oppNickname, myStats, oppStats }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-500">答题统计</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-100">
            <th className="text-left px-5 py-2.5 font-normal">玩家</th>
            <th className="px-4 py-2.5 font-normal text-center">正确</th>
            <th className="px-4 py-2.5 font-normal text-center">错误</th>
            <th className="px-4 py-2.5 font-normal text-center">平均用时</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-50 bg-violet-50/30">
            <td className="px-5 py-3 font-medium text-gray-900">{myNickname}</td>
            <td className="px-4 py-3 text-center"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-medium">{myStats?.correct ?? 0}</span></td>
            <td className="px-4 py-3 text-center"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-medium">{myStats?.wrong ?? 0}</span></td>
            <td className="px-4 py-3 text-center text-gray-500">{(myStats?.avgTime ?? 0).toFixed(1)}s</td>
          </tr>
          <tr>
            <td className="px-5 py-3 font-medium text-gray-900">{oppNickname}</td>
            <td className="px-4 py-3 text-center"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-medium">{oppStats?.correct ?? 0}</span></td>
            <td className="px-4 py-3 text-center"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-medium">{oppStats?.wrong ?? 0}</span></td>
            <td className="px-4 py-3 text-center text-gray-500">{(oppStats?.avgTime ?? 0).toFixed(1)}s</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
