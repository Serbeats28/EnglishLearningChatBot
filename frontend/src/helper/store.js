import { defineStore } from "pinia";
import ApiRequest from "../helper/ApiConfig";

export const useChatStore = defineStore("chat", {
	state: () => ({
		chatList: [],
		loading: false,
	}),
	actions: {
		async fetchConversations() {
			try {
				const userCreds = JSON.parse(localStorage.getItem('userCreds')) || undefined
				const uuid = userCreds ? userCreds.unique_uid : ''
				const response = await ApiRequest.get(`/get_chat_list?uuid=${uuid}`)
				this.chatList = response.data.chat_history || []
			} 
			catch (error) {
				console.error("Error fetching conversations:", error)
			}
			finally{
					this.loading = false
			}
		}
	}
})