import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-surface">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-brand text-xs font-bold tracking-[2px] uppercase mb-3">404</p>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
          The page you were looking for has moved or no longer exists.
        </p>
        <Link to="/" className="btn-asaak">
          BACK TO HOME
        </Link>
      </div>
    </section>
  );
}
