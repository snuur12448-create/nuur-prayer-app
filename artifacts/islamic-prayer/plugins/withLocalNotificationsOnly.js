const { withEntitlementsPlist } = require("expo/config-plugins");

/**
 * Nuur schedules notifications entirely on-device and never requests a remote
 * push token. expo-notifications enables the APNs entitlement by default, so
 * remove it after the library's config plugin runs. This keeps regenerated
 * native projects aligned with the checked-in release project and avoids
 * requiring an unused Push Notifications provisioning capability.
 */
module.exports = function withLocalNotificationsOnly(config) {
  return withEntitlementsPlist(config, (nextConfig) => {
    delete nextConfig.modResults["aps-environment"];
    return nextConfig;
  });
};
