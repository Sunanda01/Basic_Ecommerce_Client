import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AnalyticsTab = () => {
	const [analyticsData, setAnalyticsData] = useState(null);
	const [dailySalesData, setDailySalesData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAnalyticsData = async () => {
			try {
				const response = await axios.get("/analysis-data");
				console.log("API Response:", response.data); // 🔍 Debugging log
	
				if (!response.data || !response.data.analyticsData || !response.data.dailySalesData) {
					throw new Error("Invalid data received from API");
				}
	
				// Ensure dailySalesData contains valid date values
				const formattedSalesData = response.data.dailySalesData.map((item) => ({
					...item,
					date: item.date ? new Date(item.date).toISOString().split("T")[0] : "Unknown",
				}));
	
				setAnalyticsData(response.data.analyticsData);
				setDailySalesData(formattedSalesData);
			} catch (error) {
				console.error("Error fetching analytics data:", error);
				setError(error.message || "Failed to load analytics data. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		};
	
		fetchAnalyticsData();
	}, []);
	

	if (isLoading)
		return (
			<div className='flex justify-center items-center h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-400'></div>
			</div>
		);

	if (error) return <div className='text-red-500 text-center'>{error}</div>;

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
			<AnalyticsCard
    title='Total Users'
    value={analyticsData?.users?.toLocaleString() || "0"}
    icon={Users}
/>
<AnalyticsCard
    title='Total Products'
    value={analyticsData?.products?.toLocaleString() || "0"}
    icon={Package}
/>
<AnalyticsCard
    title='Total Sales'
    value={analyticsData?.totalSales?.toLocaleString() || "0"}
    icon={ShoppingCart}
/>
<AnalyticsCard
    title='Total Revenue'
    value={`$${analyticsData?.totalRevenue?.toLocaleString() || "0"}`}
    icon={DollarSign}
/>

			</div>
			<motion.div
				className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.25 }}
			>
				<ResponsiveContainer width='100%' height={400}>
				<LineChart data={dailySalesData.length ? dailySalesData : [{ date: "No Data", sales: 0, revenue: 0 }]}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis dataKey='date' tickFormatter={(date) => new Date(date).toLocaleDateString()} stroke='#D1D5DB' />
						<YAxis yAxisId='left' stroke='#D1D5DB' />
						<YAxis yAxisId='right' orientation='right' stroke='#D1D5DB' />
						<Tooltip />
						<Legend />
						<Line yAxisId='left' type='monotone' dataKey='sales' stroke='#10B981' activeDot={{ r: 8 }} name='Sales' />
						<Line yAxisId='right' type='monotone' dataKey='revenue' stroke='#3B82F6' activeDot={{ r: 8 }} name='Revenue' />
					</LineChart>
				</ResponsiveContainer>
			</motion.div>
		</div>
	);
};

const AnalyticsCard = ({ title, value, icon: Icon }) => (
	<motion.div
		className='bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative'
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<div className='flex justify-between items-center'>
			<div className='z-10'>
				<p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
				<h3 className='text-white text-3xl font-bold'>{value}</h3>
			</div>
		</div>
		<div className='absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-800 opacity-20' />
		<div className='absolute -bottom-4 -right-4 text-emerald-800 opacity-50'>
			<Icon className='h-32 w-32' />
		</div>
	</motion.div>
);

export default AnalyticsTab;