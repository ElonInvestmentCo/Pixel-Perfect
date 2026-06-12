import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { getDataBaseUrl } from "@/constants/apiUrls";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type NotificationType = "transfer" | "card" | "info";

export interface InAppNotification {
  id:        string;
  type:      NotificationType;
  title:     string;
  body:      string;
  amount?:   string;
  extra?:    Record<string, unknown>;
  timestamp: number;
}

interface NotificationContextValue {
  pushToken:               string | null;
  currentNotification:     InAppNotification | null;
  showNotification:        (n: Omit<InAppNotification, "id" | "timestamp">) => void;
  triggerTestNotification: (type: NotificationType) => void;
  dismissCurrent:          () => void;
}

/* ─── Foreground handler ─────────────────────────────────────────────────── */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  false,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: false,
    shouldShowList:   true,
  }),
});

/* ─── Context ────────────────────────────────────────────────────────────── */

const NotificationContext = createContext<NotificationContextValue | null>(null);

const API_BASE = getDataBaseUrl();

/* ─── Provider ───────────────────────────────────────────────────────────── */

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [pushToken, setPushToken]               = useState<string | null>(null);
  const [queue, setQueue]                       = useState<InAppNotification[]>([]);
  const [currentNotification, setCurrent]       = useState<InAppNotification | null>(null);
  const showingRef                              = useRef(false);

  /* ── show / queue ──────────────────────────────────────────────────────── */

  const showNotification = useCallback(
    (n: Omit<InAppNotification, "id" | "timestamp">) => {
      const full: InAppNotification = {
        ...n,
        id:        Math.random().toString(36).slice(2, 9),
        timestamp: Date.now(),
      };
      setQueue((prev) => [...prev, full]);
    },
    [],
  );

  /* ── dequeue ───────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!showingRef.current && queue.length > 0) {
      const [next, ...rest] = queue;
      showingRef.current = true;
      setCurrent(next);
      setQueue(rest);
    }
  }, [queue]);

  /* ── dismiss ───────────────────────────────────────────────────────────── */

  const dismissCurrent = useCallback(() => {
    setCurrent(null);
    showingRef.current = false;
  }, []);

  /* ── test helpers ──────────────────────────────────────────────────────── */

  const triggerTestNotification = useCallback(
    (type: NotificationType) => {
      if (type === "transfer") {
        showNotification({
          type,
          title:  "Transfer Received",
          body:   "Alex Johnson sent you money",
          amount: "$500.00",
        });
      } else if (type === "card") {
        showNotification({
          type,
          title:  "Card Activity",
          body:   "Card ••4242 used at Amazon",
          amount: "$29.99",
        });
      } else {
        showNotification({
          type,
          title: "PayVora",
          body:  "Your account has been verified.",
        });
      }
    },
    [showNotification],
  );

  /* ── register for push ─────────────────────────────────────────────────── */

  useEffect(() => {
    if (Platform.OS === "web") return;

    (async () => {
      try {
        if (!Device.isDevice) return;

        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;

        if (existing !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") return;

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          (Constants as Record<string, unknown>).easConfig?.projectId as string | undefined;

        const tokenResult = projectId
          ? await Notifications.getExpoPushTokenAsync({ projectId })
          : await Notifications.getExpoPushTokenAsync();

        const token = tokenResult.data;
        setPushToken(token);

        await fetch(`${API_BASE}/api/notifications/register`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ token }),
        }).catch(() => {});
      } catch {
        /* silent — push unavailable in simulator */
      }
    })();

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("payvora", {
        name:              "PayVora",
        importance:        Notifications.AndroidImportance.MAX,
        vibrationPattern:  [0, 200, 100, 200],
        lightColor:        "#C8FF00",
        sound:             "default",
      }).catch(() => {});
    }
  }, []);

  /* ── foreground listener ───────────────────────────────────────────────── */

  useEffect(() => {
    if (Platform.OS === "web") return;

    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      showNotification({
        type:   (data?.type as NotificationType) ?? "info",
        title:  title ?? "PayVora",
        body:   body  ?? "",
        amount: (data?.amount as string) ?? undefined,
        extra:  data as Record<string, unknown>,
      });
    });

    return () => sub.remove();
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        currentNotification,
        showNotification,
        triggerTestNotification,
        dismissCurrent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside <NotificationProvider>");
  return ctx;
}
