'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ScrollbarManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if the current page is Jobs list, Job detail, Freelancers list, Freelancer detail, or Profile
    const isJobOrProfilePage =
      pathname === '/' ||
      pathname.startsWith('/jobs') ||
      pathname.startsWith('/freelancers') ||
      pathname.startsWith('/profile');

    if (isJobOrProfilePage) {
      document.documentElement.classList.add('custom-scrollbar');
    } else {
      document.documentElement.classList.remove('custom-scrollbar');
    }
  }, [pathname]);

  return null;
}
