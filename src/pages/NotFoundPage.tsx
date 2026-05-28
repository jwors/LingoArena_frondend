import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-lg text-gray-500 mt-4">页面不存在</p>
      <Link to="/login" className="mt-6 text-indigo-600 hover:underline">返回首页</Link>
    </div>
  );
}
