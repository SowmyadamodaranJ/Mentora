import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: '#0B0F1A' }}>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
