<template>
    <header
        class="bg-base-200/50 supports-backdrop-filter:bg-base-200/50 sticky top-0 z-50 w-full backdrop-blur"
    >
        <div class="container">
            <nav class="navbar">
                <div class="navbar-start">
                    <RouterLink to="/" tabindex="-1">
                        <div class="flex items-center space-x-2">
                            <div class="logo bg-primary h-8 w-8 rounded-lg"></div>
                            <div class="font-semibold">CineMax</div>
                        </div>
                    </RouterLink>
                </div>
                <div class="navbar-center hidden lg:flex">
                    <nav class="hidden items-center space-x-6 md:flex">
                        <div
                            class="text-base-content text-sm transition-colors"
                            v-for="value in MAIN_NAVIGATION"
                        >
                            <RouterLink :to="value.path" tabindex="-1">
                                {{ value.name }}
                            </RouterLink>
                        </div>
                    </nav>
                </div>
                <div class="navbar-end">
                    <div class="flex place-items-center gap-2">
                        <div>
                            <button
                                class="btn btn-link"
                                tabindex="-1"
                                onclick="search_modal.showModal()"
                            >
                                <BaseIcon name="search" />
                            </button>
                        </div>
                        <div v-if="!authStore.user" class="flex place-items-center gap-2">
                            <button
                                class="btn btn-sm btn-ghost hidden lg:flex"
                                @click="authStore.openModal('login')"
                            >
                                <span>Dang nhap</span>
                            </button>
                            <button
                                class="btn btn-sm btn-primary hidden lg:flex"
                                @click="authStore.openModal('register')"
                            >
                                <span>Dang ky</span>
                            </button>
                        </div>
                        <div v-else class="dropdown dropdown-bottom dropdown-end">
                            <div role="button" tabindex="-1" class="btn btn-circle btn-sm">
                                <img
                                    src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                                    class="rounded-full"
                                />
                            </div>
                            <ul
                                tabindex="-1"
                                class="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                            >
                                <li class="border-b border-base-content/25 pb-2 mb-2">
                                    <div class="block">
                                        <div class="font-medium text-sm">
                                            {{ authStore.user.full_name }}
                                        </div>
                                        <div class="text-xs">{{ authStore.user.email }}</div>
                                    </div>
                                </li>
                                <li>
                                    <a href="">Thông tn cá nhân</a>
                                </li>
                                <li>
                                    <a href="">Lịch sử</a>
                                </li>
                                <li>
                                    <a href="" @click="authStore.logout">Đăng xuất</a>
                                </li>
                            </ul>
                        </div>
                        <div class="dropdown dropdown-bottom dropdown-end">
                            <div tabindex="-1" role="button" class="lg:hidden btn btn-link-sm">
                                <BaseIcon name="bars" size="20" />
                            </div>
                            <ul
                                tabindex="-1"
                                class="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                            >
                                <li v-if="!authStore.user">
                                    <button
                                        class="btn btn-outline btn-sm hover:btn-primary mb-5"
                                        @click="authStore.openModal('login')"
                                    >
                                        Đăng nhập
                                    </button>
                                </li>
                                <li v-for="value in MAIN_NAVIGATION" :key="value.name">
                                    <RouterLink :to="value.path" tabindex="-1">
                                        {{ value.name }}
                                    </RouterLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>
</template>
<script setup>
import { useAuthStore } from "@/stores/auth/useAuthStore";
const authStore = useAuthStore();
const MAIN_NAVIGATION = ref([
    {
        name: "Trang chủ",
        path: "/",
    },
    {
        name: "Lịch Chiếu",
        path: "/",
    },
    {
        name: "Khuyến mãi",
        path: "/news",
    },
    {
        name: "Tin tức",
        path: "/blog",
    },
]);
</script>
<style lang=""></style>
