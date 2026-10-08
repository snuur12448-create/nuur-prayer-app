import * as Notifications from 'expo-notifications';
import { isStorageMaintenanceActive, storageReady } from './AppStorage';

const pending = new Set<Promise<string>>();
/** Test/milestone alerts also participate in restore/reset draining. */
export async function scheduleAuxiliaryNotification(request: Notifications.NotificationRequestInput): Promise<string | null> {
  await storageReady();
  if (isStorageMaintenanceActive()) return null;
  const operation = Notifications.scheduleNotificationAsync(request);
  pending.add(operation);
  try { return await operation; } finally { pending.delete(operation); }
}

export async function drainAuxiliaryNotifications(): Promise<void> {
  if (!isStorageMaintenanceActive()) throw new Error('Close the maintenance gate before draining auxiliary alerts.');
  await Promise.allSettled([...pending]);
}
