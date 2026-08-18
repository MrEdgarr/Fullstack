<template>
    <footer class="bg-base-200 border-base-300 border-t py-10">
        <div class="container">
            <div class="flex flex-col items-center text-center">
                <a href="#">
                    <div class="flex items-center space-x-2">
                        <div class="bg-primary logo h-8 w-8 rounded-lg"></div>
                        <span class="font-semibold">CineMax</span>
                    </div>
                </a>

                <div class="mt-5 flex flex-wrap items-center justify-center gap-5">
                    <a
                        href="#"
                        class="text-base-content/50 hover:text-base-content text-sm transition-colors duration-300 hover:font-medium"
                    >
                        Home
                    </a>

                    <a
                        href="#"
                        class="text-base-content/50 hover:text-base-content text-sm transition-colors duration-300 hover:font-medium"
                    >
                        About
                    </a>

                    <a
                        href="#"
                        class="text-base-content/50 hover:text-base-content text-sm transition-colors duration-300 hover:font-medium"
                    >
                        Teams
                    </a>

                    <a
                        href="#"
                        class="text-base-content/50 hover:text-base-content text-sm transition-colors duration-300 hover:font-medium"
                    >
                        Privacy
                    </a>

                    <a
                        href="#"
                        class="text-base-content/50 hover:text-base-content text-sm transition-colors duration-300 hover:font-medium"
                    >
                        Cookies
                    </a>
                </div>
            </div>

            <hr class="border-neutral/25 my-5 md:my-10" />

            <div class="flex flex-col items-center sm:flex-row sm:justify-between">
                <p class="text-base-content text-sm">
                    © Copyright {{ new Date().getFullYear() }}. All Rights Reserved.
                </p>

                <div class="flex items-center gap-2">
                    <a
                        href="#"
                        class="text-base-content/50 hover:text-base-content transition-colors duration-300 hover:font-medium"
                    >
                        <BaseIcon name="telegram" :size="20" />
                    </a>

                    <a
                        href="#"
                        class="text-base-content/50 hover:text-base-content transition-colors duration-300 hover:font-medium"
                        aria-label="Facebook"
                    >
                        <BaseIcon name="facebook" :size="20" />
                    </a>

                    <a
                        href="#"
                        class="text-base-content/50 hover:text-base-content transition-colors duration-300 hover:font-medium"
                        aria-label="Github"
                    >
                        <BaseIcon name="github" :size="20" />
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>
