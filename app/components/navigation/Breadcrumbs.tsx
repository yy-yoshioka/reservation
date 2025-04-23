'use client';

import { cn } from '@/app/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface BreadcrumbProps {
  homeElement?: React.ReactNode;
  separator?: React.ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
}

export default function Breadcrumbs({
  homeElement = 'Home',
  separator = '/',
  containerClasses = '',
  listClasses = '',
  activeClasses = 'text-blue-500',
  capitalizeLinks = true,
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  const breadcrumbs = useMemo(() => {
    // Remove any query parameters
    const asPathWithoutQuery = pathname.split('?')[0];
    
    // Split and remove empty items
    const asPathNestedRoutes = asPathWithoutQuery
      .split('/')
      .filter(v => v.length > 0);
    
    // Map to create breadcrumb items for rendering
    const crumblist = asPathNestedRoutes.map((subpath, idx) => {
      // Create the href for the crumb
      const href = '/' + asPathNestedRoutes.slice(0, idx + 1).join('/');
      
      // Format the text
      let text = capitalizeLinks
        ? subpath.charAt(0).toUpperCase() + subpath.slice(1)
        : subpath;
      
      // Replace hyphens and underscores with spaces
      text = text.replace(/[-_]/g, ' ');
      
      return { href, text };
    });
    
    // Add the home page at the beginning
    return [{ href: '/', text: homeElement }, ...crumblist];
  }, [pathname, homeElement, capitalizeLinks]);
  
  return (
    <nav aria-label="breadcrumbs" className={cn('py-3', containerClasses)}>
      <ol className={cn('flex items-center space-x-2', listClasses)}>
        {breadcrumbs.map((crumb, idx) => (
          <li key={idx} className={cn('flex items-center')}>
            {idx > 0 && (
              <span className="mx-2 text-gray-400">{separator}</span>
            )}
            
            {idx === breadcrumbs.length - 1 ? (
              <span className={cn('font-medium', activeClasses)}>
                {crumb.text}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-600 hover:text-gray-900"
              >
                {crumb.text}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}