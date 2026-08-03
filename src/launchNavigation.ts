const forceLaunchStorageKey = "go-irl-force-launch-once";

export const requestLaunchSurface = () => {
  try {
    sessionStorage.setItem(forceLaunchStorageKey, "1");
  } catch {
    // Navigation still falls back to the regular root route.
  }
};

export const consumeLaunchSurfaceRequest = () => {
  try {
    const requested = sessionStorage.getItem(forceLaunchStorageKey) === "1";
    if (requested) sessionStorage.removeItem(forceLaunchStorageKey);
    return requested;
  } catch {
    return false;
  }
};
