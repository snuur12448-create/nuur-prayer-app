/**
 * Shared TypeScript shape for the platform-split QiblaMapView component.
 * The .native.tsx variant uses react-native-maps; the .web.tsx variant
 * shows a stylized SVG fallback (no real map on web).
 */
import type { ComponentType } from "react";

export interface QiblaMapViewProps {
  /** User's current latitude (degrees, -90 to 90). */
  userLat: number;
  /** User's current longitude (degrees, -180 to 180). */
  userLng: number;
  /** Bearing from user to Kaaba (degrees from true north). */
  qiblaBearing: number;
  /** Great-circle distance to the Kaaba in km. */
  distanceKm: number;
  /** Theme tint colour (used for the great-circle line + accents). */
  tintColor: string;
  /** Theme gold accent. */
  goldColor: string;
  /** Theme surface background colour. */
  surfaceColor: string;
  /** Theme primary text colour. */
  textColor: string;
  /** Theme secondary/muted text colour. */
  textSecondaryColor: string;
}

declare const QiblaMapView: ComponentType<QiblaMapViewProps>;
export default QiblaMapView;
