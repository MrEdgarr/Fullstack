<template>
    <div class="grid grid-cols-12 gap-2.5">
        <div class="card bg-base-100 border border-base-300 card-sm col-span-6 md:col-span-4">
            <div class="card-body">
                <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                    <span>1. Vi tri</span>
                    <BaseIcon name="calendar" />
                </div>
                <div>
                    <select class="select md:select-md select-sm w-full" required>
                        <option disabled selected hidden value="">Pick a color</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </div>
            </div>
        </div>
        <div
            class="card bg-base-100 border border-base-300 card-sm order-2 col-span-12 md:order-0 md:col-span-4"
        >
            <div class="card-body">
                <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                    <span>2. Ngay</span>
                    <BaseIcon name="calendar" />
                </div>
                <div>
                    <select class="select md:select-md select-sm w-full" required>
                        <option disabled selected hidden value="">Chon Phim</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="card bg-base-100 border border-base-300 card-sm col-span-6 md:col-span-4">
            <div class="card-body">
                <div class="flex items-center justify-between pb-2 text-sm md:text-base">
                    <span>3. Rap</span>
                    <BaseIcon name="calendar" />
                </div>
                <div>
                    <select class="select md:select-md select-sm w-full" required>
                        <option disabled selected hidden value="">Chon rap</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                        <option disabled>Pick a color</option>
                        <option>Crimson</option>
                        <option>Amber</option>
                        <option>Velvet</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    <div class="card bg-base-100 card-sm mt-5">
        <details
            class="collapse-arrow border-base-300 collapse rounded-none border"
            name="my-accordion-det-1"
        >
            <summary class="collapse-title">
                <div class="flex gap-5">
                    <img
                        src="https://cdn.moveek.com/storage/media/cache/square/5fffb2fcaf3c1018282624.png"
                        alt=""
                        class="w-10"
                    />
                    <div>
                        <div class="text-sm font-semibold md:text-base">Beta Cinema</div>
                        <div class="text-base-content/50 text-xs md:text-sm">6 rap</div>
                    </div>
                </div>
            </summary>
            <div class="collapse-content pb-0 text-sm">
                <details
                    class="collapse-arrow border-b-base-300 collapse rounded-none border-b"
                    name="my-accordion-det-2"
                >
                    <summary class="collapse-title">
                        <div class="text-sm md:text-base">Beta Đan Phượng</div>
                    </summary>
                    <div class="collapse-content text-sm">
                        <div class="text-base-content/50">
                            Tầng 2 Tòa nhà HHA, Khu Đô Thị XPHomes (Tân Tây Đô), Xã Tân Lập, Huyện
                            Đan Phượng, TP Hà Nội
                        </div>
                        <div class="mt-2.5 flex flex-wrap items-center justify-start gap-1">
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                        </div>
                    </div>
                </details>
                <details class="collapse-arrow collapse rounded-none" name="my-accordion-det-2">
                    <summary class="collapse-title">
                        <div class="text-sm md:text-base">Beta Đan Phượng</div>
                    </summary>
                    <div class="collapse-content text-sm">
                        <div class="text-base-content/50">
                            Tầng 2 Tòa nhà HHA, Khu Đô Thị XPHomes (Tân Tây Đô), Xã Tân Lập, Huyện
                            Đan Phượng, TP Hà Nội
                        </div>
                        <div class="mt-2.5 flex flex-wrap items-center justify-start gap-1">
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                            <div class="btn btn-outline md:btn-sm btn-xs btn-primary">19:00</div>
                        </div>
                    </div>
                </details>
            </div>
        </details>
        <details
            class="border-base-300 collapse-arrow collapse rounded-none border"
            name="my-accordion-det-1"
        >
            <summary class="collapse-title">
                <div class="flex gap-5">
                    <img
                        src="https://cdn.moveek.com/storage/media/cache/square/524ba157cd271c9c24d15f367a57c13abc26af06.jpg"
                        alt=""
                        class="w-10"
                    />
                    <div>
                        <div class="text-sm font-semibold md:text-base">CGV Cinemas</div>
                        <div class="text-base-content/50 text-xs md:text-sm">6 rap</div>
                    </div>
                </div>
            </summary>
            <div class="collapse-content text-sm">
                Click on "Forgot Password" on the login page and follow the instructions sent to
                your email.
            </div>
        </details>
        <details
            class="border-base-300 collapse-arrow collapse rounded-none border"
            name="my-accordion-det-1"
        >
            <summary class="collapse-title">
                <div class="flex gap-5">
                    <img
                        src="https://cdn.moveek.com/storage/media/cache/square/dcc08eb55eca8002f729ae0dff98a2ae6c031db0.png"
                        alt=""
                        class="w-10"
                    />
                    <div>
                        <div class="text-sm font-semibold md:text-base">BHD Star Cineplex</div>
                        <div class="text-base-content/50 text-xs md:text-sm">6 rap</div>
                    </div>
                </div>
            </summary>
            <div class="collapse-content text-sm">
                Go to "My Account" settings and select "Edit Profile" to make changes.
            </div>
        </details>
    </div>
</template>
<script>
export default {};
</script>
<style></style>
