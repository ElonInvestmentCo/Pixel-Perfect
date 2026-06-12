import React from "react";
import { StyleSheet, View } from "react-native";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationBanner } from "./NotificationBanner";

/**
 * Rendered as a sibling to the navigator root.
 * `pointerEvents="box-none"` passes all touches through when no banner is visible.
 * `key={id}` remounts the banner for each new notification, resetting all animations.
 */
export function NotificationOverlay() {
  const { currentNotification, dismissCurrent } = useNotifications();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {currentNotification ? (
        <NotificationBanner
          key={currentNotification.id}
          notification={currentNotification}
          onDismiss={dismissCurrent}
        />
      ) : null}
    </View>
  );
}
