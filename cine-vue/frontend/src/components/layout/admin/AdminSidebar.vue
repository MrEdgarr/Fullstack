<template>
    <div
        v-if="isOpen"
        @click="$emit('close')"
        class="fixed inset-0 bg-black/10 z-40 lg:hidden backdrop-blur-xs transition-opacity"
    ></div>

    <aside
        class="fixed lg:sticky lg:top-0 lg:self-start inset-y-0 left-0 z-50 w-60 h-screen bg-base-100 text-base-content flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 select-none shadow-xl lg:shadow-none"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
        <div class="flex flex-col flex-1 min-h-0">
            <div class="h-20 px-6 flex items-center gap-3 border-b border-base-300 shrink-0">
                <span class="text-2xl font-bold text-base-content tracking-widest"> CineVue </span>
                <button
                    @click="$emit('close')"
                    class="ml-auto lg:hidden text-base-content hover:text-base-content p-1 cursor-pointer"
                >
                    <BaseIcon name="close" size="20" />
                </button>
            </div>

            <nav class="p-4 space-y-1.5 overflow-y-auto flex-1 min-h-0">
                <router-link
                    to="/admin/dashboard"
                    @click="$emit('close')"
                    class="flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                    :class="
                        $route.path.startsWith('/admin/dashboard')
                            ? 'bg-base-300 text-base-content'
                            : 'text-base-content/50 hover:text-base-content hover:bg-base-200'
                    "
                >
                    <BaseIcon name="home" size="18" />
                    <span>Tổng quan</span>
                </router-link>

                <a
                    href="#analytics"
                    class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                    <BaseIcon name="statistical" size="18" />
                    <span>Thống kê</span>
                </a>

                <a
                    href="#products"
                    class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                    <BaseIcon name="box" size="18" />
                    <span>Phim & Vé</span>
                </a>

                <a
                    href="#orders"
                    class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                    <BaseIcon name="cart" size="18" />
                    <span>Đơn đặt vé</span>
                </a>

                <a
                    href="#customers"
                    class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                    <BaseIcon name="users" size="18" />
                    <span>Khách hàng</span>
                </a>

                <a
                    href="#revenue"
                    class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                    <BaseIcon name="revenue" size="18" />
                    <span>Doanh thu</span>
                </a>

                <a
                    href="#messages"
                    class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                    <BaseIcon name="message" size="18" />
                    <span>Tin nhắn</span>
                </a>

                <a
                    href="#settings"
                    class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                    <BaseIcon name="settings" size="18" />
                    <span>Cài đặt</span>
                </a>
            </nav>
        </div>

        <div class="p-4 border-t border-base-300 shrink-0">
            <router-link to="/" class="flex items-center justify-center">
                <button class="btn btn-block">
                    <BaseIcon name="arrow-left" size="14" />
                    <span>Về Trang Người Dùng</span>
                </button>
            </router-link>
        </div>
    </aside>
</template>

<script setup>
import BaseIcon from "@/components/common/BaseIcon.vue";

defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["close"]);
</script>
