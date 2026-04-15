import api from '@/utils/axios';

// Enquiry service
export const enquiryService = {
	// Create enquiry
	createEnquiry: async (data) => {
		try {
			const response = await api.post('/enquiries/', data);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get all enquiries
	getAllEnquiries: async (params = {}) => {
		try {
			const response = await api.get('/enquiries/', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get all interest types (used for enquiry creation payload)
	getInterestTypes: async (params = {}) => {
		try {
			const response = await api.get('/interest-types/', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get enquiry by ID
	getEnquiryById: async (id) => {
		try {
			const response = await api.get(`/enquiries/${id}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get enquiries by property ID
	getEnquiriesByPropertyId: async (propertyId, params = {}) => {
		try {
			const response = await api.get(`/enquiries/property/${propertyId}`, { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get enquiries by user ID
	getEnquiriesByUserId: async (userId, params = {}) => {
		try {
			const response = await api.get(`/enquiries/user/${userId}`, { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Update enquiry
	updateEnquiry: async (id, data) => {
		try {
			const response = await api.patch(`/enquiries/${id}`, data);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Update enquiry status
	updateEnquiryStatus: async (id, data) => {
		try {
			const response = await api.patch(`/enquiries/${id}/status`, data);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Delete enquiry
	deleteEnquiry: async (id) => {
		try {
			const response = await api.delete(`/enquiries/${id}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	}
};
