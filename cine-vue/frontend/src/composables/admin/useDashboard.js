import { ref, computed } from "vue";
import api from "@/_services/api";

export function useDashboard() {
  const isLoading = ref(false);
  const error = ref(null);
  const selectedPeriod = ref("all"); // 'today' | '7d' | '30d' | '6m' | '1y' | 'all'
  const selectedBrandId = ref(""); // '' (Tất cả đối tác) hoặc brand_id

  const overview = ref({
    summary: {
      period: "all",
      brand_id: null,
      revenue: {
        total: 8380000,
        platform_commission: 680200,
        partner_payout: 7699800,
        commission_rate: 8,
        growth_percentage: 12.5,
      },
      tickets: { total: 40, growth_percentage: 8.4, ticket_revenue: 5150000 },
      fnb: { total: 3310000, total_items: 27, revenue_ratio: 39.5 },
      orders: {
        total: 10,
        successful: 10,
        confirmed: 10,
        completed: 0,
        cancelled: 0,
        pending: 0,
        success_rate: 100,
      },
      occupancy: {
        rate: 15.4,
        tickets_sold: 40,
        total_capacity: 120,
      },
      partners: {
        total_brands: 5,
        active_brands: 5,
        total_cinemas: 8,
      },
    },
    revenueTrend: [],
    topMovies: [],
    distribution: {
      seat_types: [],
      cinemas: [],
    },
    recentBookings: [],
    partnerBrands: [],
  });

  const fetchOverview = async (
    period = selectedPeriod.value,
    brandId = selectedBrandId.value,
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      selectedPeriod.value = period;
      selectedBrandId.value = brandId ? String(brandId) : "";

      const params = { period };
      if (selectedBrandId.value) {
        params.brand_id = selectedBrandId.value;
      }

      const res = await api.get("/dashboard/overview", {
        params,
        skipServerLoading: true,
      });

      if (res.data?.success && res.data?.data) {
        overview.value = res.data.data;
      }
    } catch (err) {
      console.warn("[useDashboard] Backend overview fallback/warning:", err.message);
      error.value =
        err.response?.data?.message || err.message || "Không thể tải dữ liệu từ máy chủ";
    } finally {
      isLoading.value = false;
    }
  };

  const summary = computed(() => overview.value.summary || {});
  const revenueTrend = computed(() => overview.value.revenueTrend || []);
  const topMovies = computed(() => overview.value.topMovies || []);
  const distribution = computed(() => overview.value.distribution || {});
  const recentBookings = computed(() => overview.value.recentBookings || []);
  const partnerBrands = computed(() => overview.value.partnerBrands || []);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return new Intl.NumberFormat("vi-VN").format(Number(num));
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return {
    isLoading,
    error,
    selectedPeriod,
    selectedBrandId,
    overview,
    summary,
    revenueTrend,
    topMovies,
    distribution,
    recentBookings,
    partnerBrands,
    fetchOverview,
    formatCurrency,
    formatNumber,
    formatDateTime,
  };
}
