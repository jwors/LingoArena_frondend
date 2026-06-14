import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-bg flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gray-200">404</h1>
        <p className="text-lg text-gray-500 mt-4">页面不存在，可能走错路了</p>
        <Link to="/lobby" className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-150">
          返回大厅
        </Link>
      </div>
    </div>
  );
}
