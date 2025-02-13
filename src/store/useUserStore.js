import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";


export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	signup: async ({ name, email, password, confirmPassword, role }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			const res = await axios.post("/register", { name, email, password,role });
			if(res.data.success){
				set({ user: res.data, loading: false });
				console.log(res.data);
				toast.success(res.data.msg);
			}
			else throw new Error(res.data.msg)
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.msg || error.message || "An error occurred");
		}
	},

	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/login", { email, password });
			if(res.data.success){
				set({ user: res.data, loading: false });
				
				toast.success(res.data.msg);
			}
			else throw new Error(res.data.msg)
			console.log(res.data);
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.msg || error.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			const res=await axios.post("/logout");
			set({ user: null });
			if(res.data.success) 
				toast.success(res.data.msg);
			else throw new Error(res.data.msg);
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/get-user");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));
