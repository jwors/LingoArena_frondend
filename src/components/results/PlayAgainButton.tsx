import { Link } from 'react-router-dom';

export function PlayAgainButton() {
  return (
    <Link to="/lobby" className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
      再来一局
    </Link>
  );
}
