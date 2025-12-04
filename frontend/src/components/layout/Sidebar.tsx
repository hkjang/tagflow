'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    ...(isAdmin ? [{ name: 'User Management', href: '/admin/users', icon: '👥' }] : []),
    { name: 'Tag Management', href: '/tags', icon: '🏷️' },
    { name: 'Tag Input', href: '/scan', icon: '📱' },
    { name: 'Reports', href: '/reports', icon: '📈' },
    ...(isAdmin ? [{ name: 'Settings', href: '/settings', icon: '⚙️' }] : []),
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: '#1f2937',
      color: 'white',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #374151',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>TagFlow</h1>
      </div>

      <nav style={{ flex: 1, padding: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} style={{ marginBottom: '0.5rem' }}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    color: isActive ? 'white' : '#9ca3af',
                    backgroundColor: isActive ? '#374151' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{
        padding: '1rem',
        borderTop: '1px solid #374151',
      }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          Logged in as: <br />
          <strong style={{ color: 'white' }}>{user?.username}</strong>
        </div>
      </div>
    </aside>
  );
}
