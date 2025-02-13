import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { useCartStore } from "./useCartStore";
export const useProductStore = create((set) => ({
	products: [],
	loading: false,

	setProducts: (products) => set({ products }),
	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/create-Product", productData);
			if (res.data.success) {
				set((prevState) => ({
					products: [...prevState.products, res.data.product], // Use `product`, not `products`
					loading: false,
				}));
				toast.success(res.data.msg);
			} else {
				throw new Error(res.data.msg);
			}
		} catch (error) {
			toast.error(error.response?.data?.msg || "Failed to create product");
			set({ loading: false });
		}
	},
	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/get-all-Product");
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`get-product-category/${category}`);
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			let id=productId;
			let res=await axios.delete(`/delete-product/${id}`);
			if(res.data.success){
				set((prevProducts) => ({
					products: prevProducts.products.filter((product) => product._id !== id),
					loading: false,
				}));

				const cartStore = useCartStore.getState();
				cartStore.removeFromCart(id);
				cartStore.calculateTotals();
	
				toast.success("Product deleted successfully");
			}
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to delete product");
		}
	},
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			let id=productId;
			const response = await axios.patch(`/toggle-featured-product/${id}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.updateProduct.isFeatured } : product
				),
				loading: false,
			}));
			toast.success("Featured Product");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},
	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/get-featured-product");
			set({ products: response.data, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},
}));
