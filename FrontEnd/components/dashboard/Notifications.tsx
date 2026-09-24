'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  NotifID: string;
  NotifTitle: string;
  NotifDesc: string;
  IsRead: boolean;
  CreatedAt: string;
}

export default function Notifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/inbox');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/inbox/${id}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setNotifications(notifications.map(n => 
          n.NotifID === id ? { ...n, IsRead: true } : n
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 bg-[#0a0a0a] border border-zinc-800 shadow-2xl rounded-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-[#050505]">
            <h3 className="text-sm font-medium text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-[#1ef2c1]/20 text-[#1ef2c1] px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-zinc-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm">No notifications</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {notifications.map(notif => (
                  <div 
                    key={notif.NotifID} 
                    className={`p-4 transition-colors hover:bg-zinc-900/50 ${!notif.IsRead ? 'bg-zinc-900/20' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className={`text-sm font-medium ${!notif.IsRead ? 'text-white' : 'text-zinc-300'}`}>
                          {notif.NotifTitle}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                          {notif.NotifDesc}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-2">
                          {new Date(notif.CreatedAt).toLocaleString()}
                        </p>
                      </div>
                      {!notif.IsRead && (
                        <button 
                          onClick={(e) => markAsRead(notif.NotifID, e)}
                          className="shrink-0 w-2 h-2 rounded-full bg-[#1ef2c1] hover:scale-150 transition-transform"
                          title="Mark as read"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
