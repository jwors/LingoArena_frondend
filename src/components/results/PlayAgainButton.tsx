import { Link } from 'react-router-dom';

export function PlayAgainButton() {
  return (
    <Link to="/lobby"
      className="block w-full bg-violet-600 text-white text-center py-3 rounded-xl
                 hover:bg-violet-700 hover:shadow-lg
                 transition-all duration-200 font-medium
                 active:scale-[0.98]">
      🔄 再来一局
    </Link>
  );
}
