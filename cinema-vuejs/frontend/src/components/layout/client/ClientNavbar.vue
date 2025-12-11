<template>
    <header>
        <div class="fixed top-0 left-0 right-0 z-90 bg-base-100 shadow-sm">
            <div class="container-fluid">
                <div class="navbar">
                    <div class="navbar-start">
                        <a class="btn btn-ghost text-xl">daisyUI</a>
                    </div>
                    <div class="navbar-center hidden lg:flex">
                        <ul class="menu menu-horizontal px-1">
                            <li v-for="value in MAIN_NAVIGATION">
                                <a>{{ value.name }}</a>
                            </li>
                        </ul>
                    </div>
                    <div class="navbar-end">
                        <a class="text-base-content font-normal cursor-pointer hidden lg:flex">
                            Đang nhập
                        </a>
                        <div class="dropdown dropdown-bottom dropdown-end">
                            <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M4 6h16M4 12h8m-8 6h16"
                                    />
                                </svg>
                            </div>
                            <ul
                                tabindex="-1"
                                class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                            >
                                <li><button class="btn rounded-4xl mb-5">Đăng nhập</button></li>
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
const MAIN_NAVIGATION = ref([
    {
        name: 'Trang chủ',
        path: '',
    },
    {
        name: 'Phim',
        path: '',
        childrenMenu: [
            {
                name: 'Đang chiếu',
                path: '',
            },
            {
                name: 'Sắp chiếu',
                path: '',
            },
        ],
    },
    {
        name: 'Lịch Chiếu',
        path: '',
    },
    {
        name: 'Khuyến mãi',
        path: '',
    },
    {
        name: 'Tin tức',
        path: '',
    },
])
</script>
<style lang=""></style>
