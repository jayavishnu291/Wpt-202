
import Foundation
import CallKit

final class CallStateObserver: NSObject, CXCallObserverDelegate {

    private let observer = CXCallObserver()

    var isCallActive: Bool {
        observer.calls.contains { call in
            !call.hasEnded
        }
    }

    override init() {
        super.init()
        observer.setDelegate(self, queue: .main)
    }

    func callObserver(
        _ callObserver: CXCallObserver,
        callChanged call: CXCall
    ) {
        // Current call state is read from observer.calls.
    }

    deinit {
        observer.setDelegate(nil, queue: nil)
    }
}
