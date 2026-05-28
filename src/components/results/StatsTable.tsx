import type { GameStats } from '../../types';

interface Props {
  myNickname: string;
  oppNickname: string;
  myStats?: GameStats;
  oppStats?: GameStats;
}

export function StatsTable({ myNickname, oppNickname, myStats, oppStats }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <h3 className="text-sm font-medium text-gray-500 px-4 py-3 border-b">答题统计</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b">
            <th className="text-left px-4 py-2 font-normal">{myNickname}</th>
            <th className="px-4 py-2 font-normal text-center">正确</th>
            <th className="px-4 py-2 font-normal text-center">错误</th>
            <th className="px-4 py-2 font-normal text-center">平均用时</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2 font-medium">{myNickname}</td>
            <td className="px-4 py-2 text-center text-green-600">{myStats?.correct ?? 0}</td>
            <td className="px-4 py-2 text-center text-red-500">{myStats?.wrong ?? 0}</td>
            <td className="px-4 py-2 text-center">{(myStats?.avgTime ?? 0).toFixed(1)}s</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-medium">{oppNickname}</td>
            <td className="px-4 py-2 text-center text-green-600">{oppStats?.correct ?? 0}</td>
            <td className="px-4 py-2 text-center text-red-500">{oppStats?.wrong ?? 0}</td>
            <td className="px-4 py-2 text-center">{(oppStats?.avgTime ?? 0).toFixed(1)}s</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
