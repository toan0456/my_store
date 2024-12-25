import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";

export const analyticstRoutes = async (req, res) => {
  try {
    const analyticstData = getAnalyticstData();

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    const dailySalesData = await getDailySalesData(startDate, endDate)

    res.status(200).json({ analyticstData, dailySalesData });
  } catch (error) {
    console.log("Lỗi server analyticstRoutes", error.message);
    res.status(500).json({ message:"Lỗi server", error: error.message });
  }
};

async function getAnalyticstData() {
  const totalUsers = await userModel.countDocuments();
  const totalProducts = await productModel.countDocuments();

  const salesData = await orderModel.aggregate([
    {
      $group: {
        _id: null, // it groups all documents together
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
}

async function getDailySalesData(startDate, endDate) {
    const dailySalesData = await orderModel.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
        },
        {
            $sort: { _id: 1}
        }
    ]);

    const dateArray =getDateInRange(startDate, endDate)

    return dateArray.map((date)=> {
        const foundData = dailySalesData.find(item => item._id === date)

        return {
            date,
            sales: foundData?.sales || 0,
            revenue: foundData?.revenue || 0,
        }
    })
}

function getDateInRange(startDate,endDate) {
    const dates = [];
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate()+ 1)
    }
    return dates
}
