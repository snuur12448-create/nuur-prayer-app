/**
 * Solar position utility — used by the Qibla screen's "Sun-shadow method" card.
 *
 * Implements the NOAA / standard astronomical algorithm to compute the Sun's
 * azimuth (compass bearing from North, clockwise 0–360°) and altitude
 * (degrees above horizon, negative = below) for any latitude/longitude/time.
 *
 * Accurate to ~1° — good enough for orienting toward the Qibla using the
 * Sun's position when a magnetic compass isn't trustworthy (steel buildings,
 * planes, basements, etc.).
 *
 * References: NOAA Solar Calculator equations
 *   https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export type SolarPosition = {
  /** Compass bearing of the Sun from North, clockwise. 0=N, 90=E, 180=S, 270=W. */
  azimuth: number;
  /** Sun's altitude in degrees above horizon. Negative = below horizon. */
  altitude: number;
};

export function solarPosition(lat: number, lon: number, date: Date = new Date()): SolarPosition {
  // Julian Day from Unix time
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0; // days since J2000.0

  // Mean longitude of the Sun (degrees), corrected to 0–360
  const L = (((280.46 + 0.9856474 * n) % 360) + 360) % 360;
  // Mean anomaly (radians)
  const g = ((((357.528 + 0.9856003 * n) % 360) + 360) % 360) * RAD;
  // Ecliptic longitude (radians)
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  // Obliquity of the ecliptic (radians)
  const epsilon = 23.439 * RAD;

  // Right ascension and declination
  const alpha = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  const delta = Math.asin(Math.sin(epsilon) * Math.sin(lambda));

  // Greenwich Mean Sidereal Time (hours), then local sidereal time (radians)
  const gmst = ((((18.697374558 + 24.06570982441908 * n) % 24) + 24) % 24);
  const lst = ((((gmst * 15 + lon) % 360) + 360) % 360) * RAD;

  // Hour angle
  const ha = lst - alpha;

  const latR = lat * RAD;

  // Altitude
  const altitude = Math.asin(
    Math.sin(latR) * Math.sin(delta) + Math.cos(latR) * Math.cos(delta) * Math.cos(ha)
  );

  // Azimuth measured from North, clockwise
  const azRad = Math.atan2(
    -Math.sin(ha) * Math.cos(delta),
    Math.cos(latR) * Math.sin(delta) - Math.sin(latR) * Math.cos(delta) * Math.cos(ha)
  );
  let azimuth = ((azRad * DEG) % 360 + 360) % 360;

  return { azimuth, altitude: altitude * DEG };
}

/**
 * Signed shortest-arc difference between two compass bearings, in degrees.
 * Positive result means `target` is clockwise (right) of `from`.
 * Range: (-180, 180].
 */
export function bearingDelta(from: number, target: number): number {
  let d = ((target - from + 540) % 360) - 180;
  if (d === -180) d = 180;
  return d;
}
