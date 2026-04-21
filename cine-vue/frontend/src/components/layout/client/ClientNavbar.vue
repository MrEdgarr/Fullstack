<template>
    <header
        class="bg-base-200/50 supports-backdrop-filter:bg-base-200/50 sticky top-0 z-50 w-full backdrop-blur"
    >
        <div class="container">
            <div class="navbar">
                <div class="navbar-start">
                    <RouterLink to="/">
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
                            <RouterLink :to="value.path">
                                {{ value.name }}
                            </RouterLink>
                        </div>
                    </nav>
                </div>
                <div class="navbar-end">
                    <div class="flex place-items-center gap-2">
                        <div>
                            <button class="btn btn-link">
                                <BaseIcon name="search" />
                            </button>
                        </div>
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
                        <div class="dropdown dropdown-bottom dropdown-end">
                            <div tabindex="0" role="button" class="lg:hidden">
                                <button class="btn btn-link">
                                    <BaseIcon name="bars" size="24" />
                                </button>
                            </div>
                            <ul
                                tabindex="-1"
                                class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                            >
                                <li>
                                    <button class="btn btn-outline btn-sm hover:btn-primary mb-5">
                                        Đăng nhập
                                    </button>
                                </li>
                                <li v-for="value in MAIN_NAVIGATION" :key="value.name">
                                    <template v-if="!value.childrenMenu">
                                        <a class="py-2">
                                            {{ value.name }}
                                        </a>
                                    </template>
                                    <template v-else>
                                        <details close>
                                            <summary class="py-2">
                                                {{ value.name }}
                                            </summary>
                                            <ul>
                                                <li
                                                    v-for="valueChildren in value.childrenMenu"
                                                    :key="valueChildren.name"
                                                >
                                                    <a class="py-2">
                                                        {{ valueChildren.name }}
                                                    </a>
                                                </li>
                                            </ul>
                                        </details>
                                    </template>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
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
