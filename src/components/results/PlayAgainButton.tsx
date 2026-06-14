import { Link } from 'react-router-dom';

export function PlayAgainButton() {
  return (
    <Link to="/lobby" className="block w-full btn-primary py-3 text-base">
      再来一局
    </Link>
  );
}
