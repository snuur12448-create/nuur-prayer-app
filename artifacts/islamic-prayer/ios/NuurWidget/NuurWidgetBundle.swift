import SwiftUI
import WidgetKit

@main
struct NuurWidgetBundle: WidgetBundle {
    var body: some Widget {
        NuurWidget()
        NuurSquareWidget()
        NuurQiblaWidget()
        NuurAdhkarWidget()
        NuurTimetableWidget()
        NuurLockInlineWidget()
        NuurLockRectWidget()
        NuurLockCircularCountdownWidget()
        NuurLockCircularTimeWidget()
        NuurLockCircularProgressWidget()
        NuurWidgetLiveActivity()
    }
}
