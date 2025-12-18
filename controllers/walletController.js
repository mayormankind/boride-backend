import Wallet from "../models/wallet.js";

// ========================= GET WALLET BALANCE =========================
export async function getWalletBalance(req, res) {
  try {
    const userId = req.user._id;
    const userType = req.userType === "student" ? "Student" : "Driver";

    const wallet = await Wallet.findOne({ user: userId, userType });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    return res.status(200).json({
      success: true,
      balance: wallet.balance,
      wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= GET TRANSACTION HISTORY =========================
export async function getTransactionHistory(req, res) {
  try {
    const userId = req.user._id;
    const userType = req.userType === "student" ? "Student" : "Driver";
    const { limit = 20, page = 1 } = req.query;

    const wallet = await Wallet.findOne({ user: userId, userType }).populate({
      path: "transactions.relatedRide",
      select: "pickupLocation dropoffLocation fare status",
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    // Paginate transactions
    const skip = (page - 1) * limit;
    const transactions = wallet.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + parseInt(limit));

    return res.status(200).json({
      success: true,
      balance: wallet.balance,
      transactions,
      total: wallet.transactions.length,
      page: parseInt(page),
      totalPages: Math.ceil(wallet.transactions.length / limit),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= FUND WALLET (Student Only) =========================
export async function fundWallet(req, res) {
  try {
    const userId = req.user._id;
    const { amount, paymentReference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const wallet = await Wallet.findOne({ user: userId, userType: "Student" });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const balanceBefore = wallet.balance;
    wallet.balance += amount;

    wallet.transactions.push({
      type: "credit",
      amount,
      description: `Wallet top-up${paymentReference ? ` - Ref: ${paymentReference}` : ""}`,
      balanceBefore,
      balanceAfter: wallet.balance,
    });

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: "Wallet funded successfully",
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// ========================= WITHDRAW FROM WALLET (Driver Only) =========================
export async function withdrawFromWallet(req, res) {
  try {
    const userId = req.user._id;
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const wallet = await Wallet.findOne({ user: userId, userType: "Driver" });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        currentBalance: wallet.balance,
      });
    }

    const balanceBefore = wallet.balance;
    wallet.balance -= amount;

    wallet.transactions.push({
      type: "debit",
      amount,
      description: `Withdrawal to ${bankDetails?.accountName || "bank account"}`,
      balanceBefore,
      balanceAfter: wallet.balance,
    });

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
