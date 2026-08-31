export const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const getNotificationPermission = () =>
  notificationsSupported() ? Notification.permission : 'denied';

export const requestNotificationPermission = async () => {
  if (!notificationsSupported()) {
    return 'denied';
  }

  return Notification.requestPermission();
};

export const showNotification = (title: string, options: NotificationOptions = {}) => {
  if (getNotificationPermission() !== 'granted') {
    return null;
  }

  try {
    return new Notification(title, options);
  } catch (err) {
    console.error('Failed to show notification:', err);
    return null;
  }
};
