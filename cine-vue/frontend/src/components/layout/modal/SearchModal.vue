<template>
    <dialog id="search_modal" class="modal">
        <div class="modal-box max-h-2/3 p-0">
            <div class="input input-ghost border-b-base-300 bg-base-100 sticky top-0 z-50 w-full">
                <BaseIcon name="search" class="text-base-content/50" />
                <input
                    class="grow"
                    placeholder="Search..."
                    aria-label="Search"
                    type="search"
                    autofocus
                />
            </div>
            <ul class="list">
                <li class="p-4 pb-2 text-xs tracking-wide opacity-50">
                    Most played songs this week
                </li>
                <li class="list-row" v-for="value in 10">
                    <div>
                        <img
                            class="rounded-box w-12"
                            src="https://cdn.galaxycine.vn/media/2026/1/20/le-doat-hon-500_1768897261108.jpg"
                        />
                    </div>
                    <div class="flex-1 pl-4">
                        <p class="text-base-content text-sm leading-tight font-bold">
                            Tiểu Yêu Quái Núi Lãng Lãng
                        </p>
                        <p class="text-tiny text-base-content/50 mt-1 leading-tight">
                            Hài, Hoạt Hình
                        </p>
                        <div class="flex items-center">
                            <div class="text-tiny text-base-content/50 mt-1 flex items-center">
                                <BaseIcon name="star" class="mr-1 text-yellow-500" />
                                <p class="text-sm">9.3</p>
                            </div>
                            <button class="btn btn-primary btn-xs mt-1 ml-2">Đang chiếu</button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
</template>
<script>
export default {};
</script>
<style lang=""></style>
