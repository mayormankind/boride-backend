import Ride from "../models/ride.js";
import Wallet from "../models/wallet.js";
import Student from "../models/student.js";
import Driver from "../models/driver.js";
import {
  sendRideBookedEmail,
  sendRideAcceptedEmail,
  sendRideCompletedEmail,
} from "../utils/mailer.js";

// ========================= STUDENT BOOKS A RIDE =========================
export async function bookRide(req, res) {
  try {
    const studentId = req.user._id;
    const {
      pickupLocation,
      dropoffLocation,
      fare,
      paymentMethod,
      estimatedDistance,
      estimatedDuration,
    } = req.body;

    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !fare || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate payment method
    if (!["Cash", "Wallet"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Choose Cash or Wallet",
      });
    }

    // If wallet payment, check balance
    if (paymentMethod === "Wallet") {
      const wallet = await Wallet.findOne({
        user: studentId,
        userType: "Student",
      });

      if (!wallet || wallet.balance < fare) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance",
          walletBalance: wallet?.balance || 0,
          requiredAmount: fare,
        });
      }
    }

    // Create ride
    const ride = await Ride.create({
      student: studentId,
      pickupLocation,
      dropoffLocation,
      fare,
      paymentMethod,
      estimatedDistance,
      estimatedDuration,
      status: "pending",
    });

    // Get student info for email
    const student = await Student.findById(studentId);

    // Send booking confirmation email
    // await sendRideBookedEmail(student.email, {
    //   studentName: student.fullName,
    //   rideId: ride._id.toString().slice(-8).toUpperCase(),
    //   pickupLocation: pickupLocation.address,
    //   dropoffLocation: dropoffLocation.address,
    //   fare: fare.toFixed(2),
    //   paymentMethod,
    // });

    return res.status(201).json({
      success: true,
      message: "Ride booked successfully",
      ride: {
        id: ride._id,
        status: ride.status,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        fare: ride.fare,
        paymentMethod: ride.paymentMethod,
      },
    });
  } catch (error) {
    console.error("Book Ride Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= GET STUDENT'S RIDES =========================
export async function getStudentRides(req, res) {
  try {
    const studentId = req.user._id;
    const { status } = req.query;

    const query = { student: studentId };
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate("driver", "fullName phoneNo vehicleInfo rating")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= GET AVAILABLE RIDES FOR DRIVER =========================
export async function getAvailableRides(req, res) {
  try {
    // Get pending rides
    const rides = await Ride.find({ status: "pending" })
      .populate("student", "fullName", "phoneNo")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= DRIVER ACCEPTS A RIDE =========================
export async function acceptRide(req, res) {
  try {
    const driverId = req.user._id;
    const { rideId } = req.params;
    const { estimatedArrival } = req.body;

    // Check if driver is available
    const driver = await Driver.findById(driverId);
    if (!driver.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "You must be available to accept rides",
      });
    }

    // Find the ride
    const ride = await Ride.findById(rideId).populate("student");
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Check if ride is still pending
    if (ride.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Ride already ${ride.status}`,
      });
    }

    // Update ride
    ride.driver = driverId;
    ride.status = "accepted";
    await ride.save();

    // Send email notification to student
    // await sendRideAcceptedEmail(ride.student.email, {
    //   studentName: ride.student.fullName,
    //   rideId: ride._id.toString().slice(-8).toUpperCase(),
    //   pickupLocation: ride.pickupLocation.address,
    //   driverName: driver.fullName,
    //   driverPhone: driver.phoneNo,
    //   vehicleInfo: `${driver.vehicleInfo?.color || ""} ${driver.vehicleInfo?.make || ""} ${driver.vehicleInfo?.model || ""}`.trim() || "Not specified",
    //   estimatedArrival: estimatedArrival || 5,
    // });

    return res.status(200).json({
      success: true,
      message: "Ride accepted successfully",
      ride,
    });
  } catch (error) {
    console.error("Accept Ride Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= GET DRIVER'S RIDES =========================
export async function getDriverRides(req, res) {
  try {
    const driverId = req.user._id;
    const { status } = req.query;

    const query = { driver: driverId };
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate("student", "fullName phoneNo matricNo")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= START RIDE =========================
export async function startRide(req, res) {
  try {
    const driverId = req.user._id;
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Verify driver owns this ride
    if (ride.driver.toString() !== driverId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (ride.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Ride must be in accepted status to start",
      });
    }

    ride.status = "ongoing";
    ride.startTime = new Date();
    await ride.save();

    return res.status(200).json({
      success: true,
      message: "Ride started successfully",
      ride,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= COMPLETE RIDE =========================
export async function completeRide(req, res) {
  try {
    const driverId = req.user._id;
    const { rideId } = req.params;
    const { actualDistance, actualDuration } = req.body;

    const ride = await Ride.findById(rideId).populate("student");
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Verify driver owns this ride
    if (ride.driver.toString() !== driverId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (ride.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Ride must be ongoing to complete",
      });
    }

    // Process payment if wallet
    if (ride.paymentMethod === "Wallet") {
      const studentWallet = await Wallet.findOne({
        user: ride.student._id,
        userType: "Student",
      });

      const driverWallet = await Wallet.findOne({
        user: driverId,
        userType: "Driver",
      });

      // Double-check balance
      if (studentWallet.balance < ride.fare) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance",
        });
      }

      // Deduct from student
      const studentBalanceBefore = studentWallet.balance;
      studentWallet.balance -= ride.fare;
      studentWallet.transactions.push({
        type: "debit",
        amount: ride.fare,
        description: `Ride payment - #${ride._id.toString().slice(-8).toUpperCase()}`,
        relatedRide: ride._id,
        balanceBefore: studentBalanceBefore,
        balanceAfter: studentWallet.balance,
      });
      await studentWallet.save();

      // Add to driver
      const driverBalanceBefore = driverWallet.balance;
      driverWallet.balance += ride.fare;
      driverWallet.transactions.push({
        type: "credit",
        amount: ride.fare,
        description: `Ride earnings - #${ride._id.toString().slice(-8).toUpperCase()}`,
        relatedRide: ride._id,
        balanceBefore: driverBalanceBefore,
        balanceAfter: driverWallet.balance,
      });
      await driverWallet.save();
    }

    // Update ride
    ride.status = "completed";
    ride.endTime = new Date();
    ride.actualDistance = actualDistance;
    ride.actualDuration = actualDuration;
    await ride.save();

    // Update driver stats
    const driver = await Driver.findById(driverId);
    driver.totalRides += 1;
    await driver.save();

    // Get updated wallet balance for email
    const updatedWallet = await Wallet.findOne({
      user: ride.student._id,
      userType: "Student",
    });

    // Send completion email to student
    // await sendRideCompletedEmail(ride.student.email, {
    //   studentName: ride.student.fullName,
    //   rideId: ride._id.toString().slice(-8).toUpperCase(),
    //   driverName: driver.fullName,
    //   duration: actualDuration || ride.estimatedDuration || 0,
    //   totalFare: ride.fare.toFixed(2),
    //   paymentMethod: ride.paymentMethod,
    //   walletBalance: updatedWallet?.balance.toFixed(2) || "0.00",
    // });

    return res.status(200).json({
      success: true,
      message: "Ride completed successfully",
      ride,
    });
  } catch (error) {
    console.error("Complete Ride Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= CANCEL RIDE =========================
export async function cancelRide(req, res) {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Verify user can cancel this ride
    if (userType === "student" && ride.student.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (userType === "driver" && ride.driver?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Can't cancel completed rides
    if (ride.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed ride",
      });
    }

    ride.status = "cancelled";
    ride.cancelledBy = userType;
    ride.cancellationReason = reason || "No reason provided";
    await ride.save();

    return res.status(200).json({
      success: true,
      message: "Ride cancelled successfully",
      ride,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= RATE RIDE (Student) =========================
export async function rateRide(req, res) {
  try {
    const studentId = req.user._id;
    const { rideId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Verify student owns this ride
    if (ride.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (ride.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only rate completed rides",
      });
    }

    ride.rating = rating;
    ride.review = review || null;
    await ride.save();

    // Update driver's average rating
    const driverRides = await Ride.find({
      driver: ride.driver,
      rating: { $ne: null },
    });

    const totalRating = driverRides.reduce(
      (sum, r) => sum + (r.rating || 0),
      0
    );
    const avgRating = totalRating / driverRides.length;

    await Driver.findByIdAndUpdate(ride.driver, {
      rating: avgRating.toFixed(2),
    });

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      ride,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= GET SINGLE RIDE DETAILS =========================
export async function getRideDetails(req, res) {
  try {
    const userId = req.user._id;
    const userType = req.userType;
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId)
      .populate("student", "fullName email phoneNo matricNo")
      .populate("driver", "fullName email phoneNo vehicleInfo rating");

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Verify user has access to this ride
    const isStudent = userType === "student" && ride.student._id.toString() === userId.toString();
    const isDriver = userType === "driver" && ride.driver?._id.toString() === userId.toString();

    if (!isStudent && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      ride,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
