import React from 'react';
import { Sparkles, Flame } from 'lucide-react';

interface BannerNotificationProps {
  notification: { text: string; type: 'secret' | 'checkpoint'; time: number } | null;
}

export const BannerNotification: React.FC<BannerNotificationProps> = ({ notification }) => {
  if (!notification || Date.now() - notification.time > 3200) return null;

  const isSecret = notification.type === 'secret';

  return (
    <div className="absolute top-18 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-in slide-in-from-top-4 duration-300">
      <div
        className={`px-5 py-2.5 rounded-2xl backdrop-blur-md border shadow-2xl flex items-center gap-2.5 ${
          isSecret
            ? 'bg-amber-950/90 border-amber-400 text-amber-200'
            : 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
        }`}
      >
        {isSecret ? (
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
        ) : (
          <Flame className="w-5 h-5 text-emerald-400 fill-emerald-400" />
        )}
        <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
          {notification.text}
        </span>
      </div>
    </div>
  );
};
