<template lang="">
    <div class="flex flex-col justify-between gap-5 bg-transparent p-0">
        <div class="flex w-full shrink-0 grow flex-row items-center justify-between gap-5 p-0">
            <div class="text-sm font-bold md:text-2xl">Tin Khuyến Mãi</div>
            <div class="cursor-pointer text-sm">
                <router-link
                    to="/news"
                    class="btn btn-link md:btn-md btn-xs text-base-content flex items-center font-medium"
                >
                    Xem toàn bộ
                </router-link>
            </div>
        </div>
        <div>
            <div
                class="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
                <div
                    class="md:bg-background h-full cursor-pointer transition-shadow md:overflow-hidden md:rounded-lg md:shadow-md md:hover:shadow-lg"
                    v-for="n in 8"
                    :key="n"
                >
                    <div class="h-full">
                        <div class="flex h-full flex-col">
                            <div class="sm:w-full">
                                <div class="overflow-hidden rounded-lg md:rounded-none">
                                    <div class="relative block">
                                        <img
                                            alt="Mua vé Lotte Cinema săn bắp nước miễn phí trên MoMo!"
                                            src="https://homepage.momocdn.net/blogscontents/momo-amazone-s3-api-240809141324-638588096046049571.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div
                                class="relative flex flex-1 flex-col sm:w-full sm:flex-auto sm:pb-7 md:px-4"
                            >
                                <div
                                    class="line-clamp-2 pt-2 pr-2 text-sm font-semibold sm:pt-2 sm:pr-0 sm:pb-1"
                                >
                                    Mua vé Lotte Cinema săn bắp nước miễn phí trên MoMo!
                                </div>
                                <div
                                    class="hidden items-center sm:absolute sm:bottom-2 sm:flex md:left-4"
                                >
                                    <span class="text-base-content inline-block text-xs">
                                        09/08/2024</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {};
</script>
<style lang=""></style>
