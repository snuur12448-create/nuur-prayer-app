import Foundation

/// Swift traps when a `ClosedRange` is built with a lower bound after its
/// upper bound. WidgetKit can render a timeline entry at or after its target,
/// so expired countdowns clamp to a zero-length interval instead.
public func nuurCountdownInterval(to target: Date, now: Date = Date()) -> ClosedRange<Date> {
    now...max(now, target)
}

/// A snapshot remains valid at its exact final boundary so the final T-0 state
/// can render. It becomes stale immediately after that boundary.
public func nuurSnapshotHasExpired(validThrough: Date?, at now: Date = Date()) -> Bool {
    guard let validThrough else { return false }
    return now > validThrough
}
