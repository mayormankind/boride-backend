// utils/rideSerializer.js
export function serializeRide(ride) {
  // Sort timeline by timestamp ascending (oldest first)
  const sortedTimeline = (ride.timeline || [])
    .map((event) => ({
      type: event.type,
      message: event.message,
      timestamp: event.timestamp,
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return {
    id: ride._id,
    student: ride.student
      ? {
          id: ride.student._id,
          fullName: ride.student.fullName,
          phoneNo: ride.student.phoneNo,
        }
      : undefined,

    driver: ride.driver
      ? {
          id: ride.driver._id,
          fullName: ride.driver.fullName,
          phoneNo: ride.driver.phoneNo,
          vehicleInfo: ride.driver.vehicleInfo,
        }
      : undefined,

    pickupLocation: ride.pickupLocation,
    dropoffLocation: ride.dropoffLocation,

    fare: ride.fare,
    paymentMethod: ride.paymentMethod,
    status: ride.status,

    estimatedDistance: ride.estimatedDistance,
    estimatedDuration: ride.estimatedDuration,
    actualDistance: ride.actualDistance,
    actualDuration: ride.actualDuration,

    createdAt: ride.createdAt,
    startTime: ride.startTime,
    endTime: ride.endTime,

    // Ride lifecycle timeline
    timeline: sortedTimeline,

    // Completion confirmation state
    walletLocked: ride.walletLocked,
    lockedAmount: ride.lockedAmount,
    completionRequestedAt: ride.completionRequestedAt,
    disputeReason: ride.disputeReason,

    // Rating info
    rating: ride.rating,
    review: ride.review,
  };
}
