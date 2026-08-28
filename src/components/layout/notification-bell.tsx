 "use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions";
import { Button } from "@/components/ui/button";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function NotificationBell({
  notifications: initialNotifications,
}: {
  notifications: Notification[];
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [pending, setPending] = useState<string | null>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/notifications", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        setNotifications(data);
      } catch {
        // Ignora erros temporários de atualização
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function handleRead(id: string) {
    if (pending) return;

    const notification = notifications.find((item) => item.id === id);
    if (!notification || notification.read) return;

    setPending(id);

    try {
      await markNotificationAsRead(id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      );
    } finally {
      setPending(null);
    }
  }

  async function handleReadAll() {
    if (unreadCount === 0 || pending) return;

    setPending("all");

    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      );
    } finally {
      setPending(null);
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notificações"
        onClick={() => setOpen((value) => !value)}
        className="relative"
      >
        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Fechar notificações"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-11 z-50 w-96 overflow-hidden rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold">Notificações</h3>
                <p className="text-xs text-muted-foreground">
                  {unreadCount === 0
                    ? "Nenhuma notificação nova"
                    : `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`}
                </p>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReadAll}
                  disabled={pending === "all"}
                  className="text-xs"
                >
                  <CheckCheck className="mr-1 h-3.5 w-3.5" />
                  Marcar todas
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Tudo tranquilo por aqui
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Suas novas notificações aparecerão aqui.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleRead(notification.id)}
                    disabled={pending === notification.id}
                    className={`flex w-full gap-3 border-b px-4 py-3 text-left transition hover:bg-muted/50 ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                  >
                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notification.read
                          ? "bg-transparent"
                          : "bg-primary"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>

                        {notification.read && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
