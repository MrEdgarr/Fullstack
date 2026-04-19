export const useAuthStore = defineStore("auth", () => {
    const isLoading = ref(false);
    const isModalOpen = ref(false);
    const currentTab = ref("");

    const openModal = (tab = "") => {
        currentTab.value = tab;
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
    };

    return {
        isLoading,
        isModalOpen,
        currentTab,
        openModal,
        closeModal,
    };
});
