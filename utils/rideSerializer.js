// utils/rideSerializer.js
export function serializeRide(ride) {
    return {
      id: ride._id,
      student: ride.student
        ? {id: ride.student._id, fullName: ride.student.fullName, phoneNo: ride.student.phoneNo,}
        : undefined,
  
      driver: ride.driver
        ? {id: ride.driver._id, fullName: ride.driver.fullName, phoneNo: ride.driver.phoneNo, vehicleInfo: ride.driver.vehicleInfo,}
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
    };
  } 
