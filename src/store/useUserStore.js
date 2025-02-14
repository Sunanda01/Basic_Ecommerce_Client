import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const storedAuth=localStorage.getItem('user_details');
const isExist=storedAuth?JSON.parse(storedAuth):null;
export const useUserStore = create((set, get) => ({
	user: isExist,
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
				localStorage.setItem('user_details',JSON.stringify(res.data.user));
				set({ user: res.data.user, loading: false });
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
				localStorage.setItem('user_details',JSON.stringify(res.data.user));
				set({ user: res.data.user, loading: false });
				toast.success(res.data.msg);
			}
			else throw new Error(res.data.msg)
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.msg || error.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			const res=await axios.post("/logout");
			set({ user: null });
			if(res.data.success) {
				localStorage.removeItem('user_details');
				toast.success(res.data.msg);
			}
			else throw new Error(res.data.msg);
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/get-user");
			set({ user: response.data.user, checkingAuth: false });
		} catch (error) {
			console.error(error.message);
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

let refreshPromise = null;
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);