'use client';

import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import {
  X,
  User,
  CalendarDays,
  FileText,
  Headphones,
  Info,
  Wallet,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Gift,
} from 'lucide-react';

interface ProfileDrawerProps {
  onClose: () => void;
}

export default function ProfileDrawer({ onClose }: ProfileDrawerProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('navigate_auth');
    router.push('/login');
  };

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const menuItems = [
    {
      section: 'RIDE',
      items: [
        { icon: CalendarDays, label: 'My Bookings', desc: 'View ride history', path: '/profile/bookings', color: '#A29BFE' },
        { icon: Wallet, label: 'Wallet', desc: 'Balance: ₹1,250', path: '#', color: '#00E676' },
        { icon: Gift, label: 'Offers & Promos', desc: 'Use code FIRST50', path: '#', color: '#FF9100' },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [
        { icon: FileText, label: 'My Policies', desc: 'Terms, privacy, refund', path: '/profile/policies', color: '#00D2FF' },
        { icon: Headphones, label: 'Support', desc: '24/7 help center', path: '/profile/support', color: '#FF4081' },
        { icon: Star, label: 'Rate NaviGet', desc: 'Love us? Let us know!', path: '#', color: '#FFD600' },
        { icon: Settings, label: 'Settings', desc: 'Notifications, language', path: '#', color: '#78909C' },
      ],
    },
    {
      section: 'INFO',
      items: [
        { icon: Info, label: 'About NaviGet', desc: 'Version 1.0.0', path: '#', color: '#A29BFE' },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[340px] z-50 flex flex-col overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header / Profile card */}
        <div className="p-5 gradient-mesh" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <NaviGetLogo size="sm" />
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Profile info */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                boxShadow: '0 4px 16px rgba(108, 92, 231, 0.35)',
              }}>
              <User className="w-7 h-7 text-[var(--text-primary)]" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-[var(--text-primary)]">User</h2>
              <p className="text-sm text-white/35">+91 98765 43210</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3" fill={s <= 4 ? '#FFD600' : 'none'}
                      stroke={s <= 4 ? '#FFD600' : 'rgba(255,255,255,0.15)'} />
                  ))}
                </div>
                <span className="text-xs text-[var(--text-muted)] ml-1">4.8</span>
              </div>
            </div>
            <button className="p-2 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto py-3 px-3" style={{ scrollbarWidth: 'none' }}>
          {menuItems.map((section) => (
            <div key={section.section} className="mb-3">
              <p className="text-[10px] font-bold text-white/15 tracking-[0.15em] uppercase px-3 mb-1.5">
                {section.section}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className="menu-item w-full group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                  transition-all duration-200"
                      style={{ background: `${item.color}12` }}>
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-muted)] transition-colors" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Logout + Footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            className="menu-item w-full group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255, 82, 82, 0.08)' }}>
              <LogOut className="w-5 h-5" style={{ color: '#FF5252' }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Log out</p>
            </div>
          </button>

          <div className="flex items-center justify-center gap-2 mt-3 pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <Shield className="w-3 h-3 text-[var(--text-muted)]" />
            <p className="text-[10px] text-[var(--text-muted)]">NaviGet v1.0.0 • Made in India</p>
          </div>
        </div>
      </div>
    </>
  );
}
