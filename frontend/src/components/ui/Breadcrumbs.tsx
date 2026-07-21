import { useLocation, Link } from 'react-router-dom';

export const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(p => p);

  if (paths.length <= 1) return null;

  return (
    <nav className="flex text-label-md text-on-surface-variant mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const href = `/${paths.slice(0, index + 1).join('/')}`;
          
          // Format text (capitalize and replace hyphens)
          const text = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

          return (
            <li key={path} className="inline-flex items-center">
              {index > 0 && (
                <span className="material-symbols-outlined text-[16px] mx-1 opacity-50">chevron_right</span>
              )}
              {isLast ? (
                <span className="text-primary font-medium tracking-wide" aria-current="page">
                  {text}
                </span>
              ) : (
                <Link to={href} className="hover:text-primary transition-colors">
                  {text}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
