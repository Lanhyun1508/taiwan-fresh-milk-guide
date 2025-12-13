import { trpc } from "@/lib/trpc";
import { X, Info, Bell, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function AnnouncementBanner() {
  const { data: announcements } = trpc.announcements.getActive.useQuery();
  const [dismissed, setDismissed] = useState<number[]>([]);

  const visibleAnnouncements = announcements?.filter(
    (a) => !dismissed.includes(a.id)
  );

  if (!visibleAnnouncements?.length) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "important":
        return <AlertTriangle className="w-4 h-4" />;
      case "update":
        return <Bell className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case "important":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "update":
        return "bg-chart-2/10 border-chart-2/20 text-chart-2";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`relative border px-4 py-3 ${getStyles(announcement.type)}`}
        >
          <div className="container flex items-start gap-3">
            <span className="mt-0.5 shrink-0">{getIcon(announcement.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{announcement.title}</p>
              <p className="text-sm opacity-80 mt-0.5">{announcement.content}</p>
            </div>
            <button
              onClick={() => setDismissed([...dismissed, announcement.id])}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
