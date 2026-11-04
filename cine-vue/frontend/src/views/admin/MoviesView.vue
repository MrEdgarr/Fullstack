<template>
    <div class="space-y-6">
        <div
            class="p-5 rounded-lg bg-base-100 border border-base-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
            <div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-black uppercase tracking-wider font-mono">
                        Quản Trị Danh Mục Phim Toàn Quốc
                    </span>
                    <span class="text-neutral-300">·</span>
                    <span class="text-xs text-neutral-600">Quy chuẩn Cục Điện Ảnh Việt Nam</span>
                </div>
                <h2 class="text-base font-black text-black mt-1">
                    Quản Lý Phim, Phân Loại Nhãn Tuổi & Điều Phối Trạng Thái Phát Hành
                </h2>
                <p class="text-xs text-neutral-500 mt-0.5">
                    Cập nhật trailer, poster, định dạng chiếu (IMAX/ScreenX/4DX), giấy phép phát hành
                    và tỷ trọng chuỗi rạp
                </p>
            </div>

            <div class="flex items-center gap-2.5 self-start md:self-auto">
                <button
                    @click="handleOpenAddModal"
                    class="btn btn-sm btn-neutral text-white font-bold"
                >
                    <BaseIcon name="plus" size="16" />
                    <span>Thêm Phim Mới</span>
                </button>
            </div>
        </div>

        <div class="p-4 rounded-lg bg-base-100 border border-base-300 shadow-xs space-y-3">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div class="relative flex-1 max-w-md">
                    <BaseIcon
                        name="search"
                        size="16"
                        class="text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Tìm theo tên phim, tên gốc, đạo diễn, diễn viên..."
                        class="input input-sm w-full bg-base-200 text-xs text-black pl-9 border-base-300 focus:outline-black font-medium"
                    />
                </div>

                <div
                    class="flex items-center p-1 bg-base-200 rounded-md border border-base-300 text-xs gap-1 overflow-x-auto max-w-full"
                >
                    <button
                        v-for="tab in [
                            { id: 'all', label: 'Tất cả trạng thái' },
                            { id: 'now_showing', label: 'Đang chiếu' },
                            { id: 'sneak_show', label: 'Suất chiếu sớm' },
                            { id: 'coming_soon', label: 'Sắp chiếu' },
                            { id: 'ended', label: 'Ngừng chiếu' },
                        ]"
                        :key="tab.id"
                        @click="statusFilter = tab.id"
                        class="px-2.5 sm:px-3 py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        :class="
                            statusFilter === tab.id
                                ? 'bg-black text-white shadow-xs'
                                : 'text-neutral-600 hover:text-black'
                        "
                    >
                        {{ tab.label }}
                    </button>
                </div>
            </div>

            <div
                class="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200 text-xs"
            >
                <select
                    v-model="ratingFilter"
                    class="select select-sm bg-base-200 text-black border-base-300 focus:outline-black font-medium"
                >
                    <option value="all">Tất cả nhãn độ tuổi</option>
                    <option value="P">P - Phổ biến mọi độ tuổi</option>
                    <option value="K">K - Dưới 13 có người giám hộ</option>
                    <option value="C13">C13 - Cấm khán giả dưới 13 tuổi</option>
                    <option value="C16">C16 - Cấm khán giả dưới 16 tuổi</option>
                    <option value="C18">C18 - Cấm khán giả dưới 18 tuổi</option>
                </select>

                <select
                    v-model="countryFilter"
                    class="select select-sm bg-base-200 text-black border-base-300 focus:outline-black font-medium"
                >
                    <option value="all">Tất cả quốc gia ({{ ALL_COUNTRIES.length }})</option>
                    <option v-for="c in ALL_COUNTRIES" :key="c" :value="c">{{ c }}</option>
                </select>

                <select
                    v-model="genreFilter"
                    class="select select-sm bg-base-200 text-black border-base-300 focus:outline-black font-medium"
                >
                    <option value="all">Tất cả thể loại</option>
                    <option v-for="g in ALL_GENRES" :key="g" :value="g">{{ g }}</option>
                </select>

                <button
                    v-if="
                        searchQuery ||
                        statusFilter !== 'all' ||
                        ratingFilter !== 'all' ||
                        countryFilter !== 'all' ||
                        genreFilter !== 'all'
                    "
                    @click="
                        searchQuery = '';
                        statusFilter = 'all';
                        ratingFilter = 'all';
                        countryFilter = 'all';
                        genreFilter = 'all';
                    "
                    class="text-xs text-black font-bold hover:underline px-2 py-1 cursor-pointer"
                >
                    Đặt lại bộ lọc
                </button>

                <span class="ml-auto text-[11px] text-neutral-500 font-mono">
                    {{ filteredMovies.length }} phim thỏa mãn
                </span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-7 space-y-3.5">
                <div
                    v-for="movie in filteredMovies"
                    :key="movie.id"
                    @click="selectedMovie = movie"
                    class="p-4 rounded-lg bg-base-100 border transition-all cursor-pointer flex gap-4 group shadow-xs"
                    :class="[
                        selectedMovie?.id === movie.id
                            ? 'border-black ring-1 ring-black shadow-md'
                            : 'border-base-300 hover:border-neutral-400',
                    ]"
                >
                    <div
                        class="relative w-24 h-36 rounded overflow-hidden shrink-0 shadow-xs border border-base-300"
                    >
                        <img
                            :src="movie.posterUrl"
                            :alt="movie.title"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                            class="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded border font-mono"
                            :class="(AGE_RATING_CONFIG[movie.ageRating] || AGE_RATING_CONFIG.P).color"
                        >
                            {{ (AGE_RATING_CONFIG[movie.ageRating] || AGE_RATING_CONFIG.P).label }}
                        </span>
                    </div>

                    <div class="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <span
                                        class="text-[10px] px-2 py-0.5 rounded border font-mono"
                                        :class="
                                            (
                                                RELEASE_STATUS_CONFIG[movie.status] ||
                                                RELEASE_STATUS_CONFIG.now_showing
                                            ).badgeColor
                                        "
                                    >
                                        {{
                                            (
                                                RELEASE_STATUS_CONFIG[movie.status] ||
                                                RELEASE_STATUS_CONFIG.now_showing
                                            ).label
                                        }}
                                    </span>
                                    <span class="text-[11px] text-neutral-500 font-mono"
                                        >· {{ movie.country }}</span
                                    >
                                </div>

                                <div
                                    class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                                >
                                    <button
                                        @click.stop="handleOpenEditModal(movie)"
                                        class="btn btn-ghost btn-xs text-neutral-600 hover:text-black"
                                        title="Chỉnh sửa thông tin phim"
                                    >
                                        <BaseIcon name="edit" size="14" />
                                    </button>
                                    <button
                                        @click.stop="cinemaStore.deleteMovie(movie.id)"
                                        class="btn btn-ghost btn-xs text-neutral-600 hover:text-black"
                                        title="Xóa phim"
                                    >
                                        <BaseIcon name="trash" size="14" />
                                    </button>
                                </div>
                            </div>

                            <h3
                                class="font-extrabold text-sm text-black mt-1 leading-snug group-hover:underline"
                            >
                                {{ movie.title }}
                            </h3>
                            <p class="text-[11px] text-neutral-500 font-mono">
                                {{ movie.originalTitle }}
                            </p>

                            <div
                                class="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600 mt-2"
                            >
                                <span>{{ movie.durationMinutes }} phút</span>
                                <span>·</span>
                                <span>{{ movie.genre.slice(0, 3).join(", ") }}</span>
                                <span>·</span>
                                <span>Đạo diễn: {{ movie.director }}</span>
                            </div>

                            <div class="flex flex-wrap gap-1 mt-2">
                                <span
                                    v-for="f in movie.formats.slice(0, 4)"
                                    :key="f"
                                    class="badge badge-sm badge-outline font-mono text-[10px]"
                                >
                                    {{ f }}
                                </span>
                            </div>
                        </div>

                        <div
                            class="pt-2.5 mt-2 border-t border-base-200 flex items-center justify-between text-xs"
                        >
                            <div class="flex items-center gap-2">
                                <span class="text-neutral-500 text-[11px]">Khởi chiếu:</span>
                                <span class="text-black font-mono font-bold text-[11px]">{{
                                    movie.releaseDate
                                }}</span>
                            </div>

                            <div class="flex items-center gap-2">
                                <button
                                    v-if="movie.status !== 'ended'"
                                    @click.stop="cinemaStore.quickStatusChange(movie, 'ended')"
                                    class="text-[10px] text-neutral-500 hover:text-black underline transition-colors"
                                >
                                    Ngừng chiếu
                                </button>
                                <button
                                    v-else
                                    @click.stop="cinemaStore.quickStatusChange(movie, 'now_showing')"
                                    class="text-[10px] text-black font-bold hover:underline transition-colors"
                                >
                                    Kích hoạt lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-5">
                <div
                    v-if="selectedMovie"
                    class="p-5 rounded-lg bg-base-100 border border-base-300 sticky top-20 space-y-4 shadow-xs"
                >
                    <div class="relative h-44 rounded overflow-hidden shadow-xs border border-base-300">
                        <img
                            :src="selectedMovie.backdropUrl || selectedMovie.posterUrl"
                            :alt="selectedMovie.title"
                            class="w-full h-full object-cover"
                        />
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                        />

                        <button
                            v-if="selectedMovie.trailerUrl"
                            @click="showTrailerModal = selectedMovie.trailerUrl"
                            class="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white hover:bg-neutral-100 text-black flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer"
                            title="Xem Trailer Phim"
                        >
                            <BaseIcon name="play" size="20" class="ml-0.5 text-black" />
                        </button>

                        <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                            <div>
                                <span
                                    class="text-[10px] font-bold uppercase tracking-wider text-black bg-white px-2 py-0.5 rounded font-mono shadow-xs"
                                >
                                    {{ selectedMovie.country }} · {{ selectedMovie.releaseDate }}
                                </span>
                                <h3
                                    class="text-base font-black text-white mt-1 leading-snug drop-shadow-md"
                                >
                                    {{ selectedMovie.title }}
                                </h3>
                            </div>

                            <span
                                class="text-xs px-2 py-1 rounded border font-mono"
                                :class="
                                    (
                                        AGE_RATING_CONFIG[selectedMovie.ageRating] ||
                                        AGE_RATING_CONFIG.P
                                    ).color
                                "
                            >
                                {{
                                    (
                                        AGE_RATING_CONFIG[selectedMovie.ageRating] ||
                                        AGE_RATING_CONFIG.P
                                    ).label
                                }}
                            </span>
                        </div>
                    </div>

                    <div class="p-3.5 rounded bg-base-200 border border-base-300 space-y-2 text-xs">
                        <div class="flex items-center gap-2 text-black font-bold">
                            <BaseIcon name="shield-check" size="16" class="text-black" />
                            <span>Phân Loại & Kiểm Duyệt Điện Ảnh</span>
                        </div>
                        <div class="space-y-1 text-[11px] text-neutral-600 pl-6">
                            <p>
                                · Nhãn tuổi:
                                <span class="font-bold text-black font-mono">
                                    {{
                                        (
                                            AGE_RATING_CONFIG[selectedMovie.ageRating] ||
                                            AGE_RATING_CONFIG.P
                                        ).name
                                    }}
                                </span>
                                -
                                {{
                                    (
                                        AGE_RATING_CONFIG[selectedMovie.ageRating] ||
                                        AGE_RATING_CONFIG.P
                                    ).desc
                                }}
                            </p>
                            <p>
                                · Giấy phép:
                                <span class="text-black font-mono font-medium">
                                    {{
                                        selectedMovie.censorshipLicense ||
                                        "GP số 248/QĐ-ĐA - Cục Điện Ảnh cấp"
                                    }}
                                </span>
                            </p>
                            <p>
                                · Ngôn ngữ & Bản chiếu:
                                <span class="text-black font-medium">
                                    {{ selectedMovie.language || "Tiếng Việt" }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div class="space-y-2.5 text-xs">
                        <div>
                            <span class="text-neutral-500 text-[11px] block">Tóm tắt nội dung:</span>
                            <p class="text-neutral-800 leading-relaxed text-xs mt-0.5">
                                {{
                                    selectedMovie.synopsis ||
                                    "Chưa có bản tóm tắt nội dung chính thức."
                                }}
                            </p>
                        </div>

                        <div
                            class="grid grid-cols-2 gap-2 pt-2 border-t border-base-200 text-[11px]"
                        >
                            <div>
                                <span class="text-neutral-500">Đạo diễn:</span>
                                <p class="text-black font-bold">{{ selectedMovie.director }}</p>
                            </div>
                            <div>
                                <span class="text-neutral-500">Thời lượng:</span>
                                <p class="text-black font-mono font-bold">
                                    {{ selectedMovie.durationMinutes }} phút
                                </p>
                            </div>
                        </div>

                        <div class="pt-1">
                            <span class="text-neutral-500 text-[11px]">Diễn viên chính:</span>
                            <p class="text-neutral-800 text-xs mt-0.5">
                                {{ selectedMovie.cast.join(", ") }}
                            </p>
                        </div>

                        <div class="pt-2 border-t border-base-200">
                            <span class="text-neutral-500 text-[11px] block mb-1.5 font-medium">
                                Định dạng phát hành tại các rạp:
                            </span>
                            <div class="flex flex-wrap gap-1.5">
                                <span
                                    v-for="fmt in selectedMovie.formats"
                                    :key="fmt"
                                    class="badge badge-sm badge-outline font-mono text-[11px]"
                                >
                                    {{ fmt }}
                                </span>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-base-200 space-y-2">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-bold text-black">Thị Phần Phân Phối Đa Rạp:</span>
                                <span class="font-black text-black font-mono">
                                    {{ (selectedMovie.totalGmv / 1000000000).toFixed(2) }} tỷ ₫ GMV
                                </span>
                            </div>

                            <div class="space-y-2">
                                <div
                                    v-for="ms in selectedMovie.marketShare"
                                    :key="ms.chainId"
                                    class="space-y-1"
                                >
                                    <div class="flex items-center justify-between text-[11px]">
                                        <span class="text-neutral-800 font-medium">{{
                                            ms.chainName
                                        }}</span>
                                        <div class="flex items-center gap-2">
                                            <span class="text-neutral-500 font-mono"
                                                >{{ ms.tickets.toLocaleString("vi-VN") }} vé</span
                                            >
                                            <span class="font-black text-black font-mono"
                                                >{{ ms.percentage }}%</span
                                            >
                                        </div>
                                    </div>
                                    <div
                                        class="w-full h-1.5 rounded-full bg-base-200 overflow-hidden border border-base-300"
                                    >
                                        <div
                                            class="h-full rounded-full bg-black"
                                            :style="{ width: `${ms.percentage}%` }"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pt-3 border-t border-base-300 flex items-center gap-2">
                        <button
                            @click="handleOpenEditModal(selectedMovie)"
                            class="btn btn-sm btn-outline text-black border-base-300 flex-1 font-bold"
                        >
                            <BaseIcon name="edit" size="14" />
                            <span>Chỉnh Sửa Thông Tin</span>
                        </button>

                        <button
                            @click="router.push('/admin/showtimes')"
                            class="btn btn-sm btn-neutral text-white font-bold"
                            title="Xem suất chiếu phim này"
                        >
                            Suất Chiếu →
                        </button>
                    </div>
                </div>

                <div
                    v-else
                    class="p-8 rounded-lg bg-base-100 border border-base-300 text-center text-xs text-neutral-500 shadow-xs"
                >
                    Chọn một phim từ danh sách để xem chi tiết kiểm duyệt, trailer và thị phần phòng
                    vé.
                </div>
            </div>
        </div>

        <div v-if="showAddEditModal" class="modal modal-open">
            <form
                @submit.prevent="handleSaveMovie"
                class="modal-box bg-base-100 border border-base-300 max-w-2xl p-6 text-black space-y-4 max-h-[90vh] overflow-y-auto"
            >
                <div class="flex items-center justify-between pb-3 border-b border-base-300">
                    <div class="flex items-center gap-2">
                        <BaseIcon name="movie" size="20" class="text-black" />
                        <h3 class="font-black text-black text-base">
                            {{
                                editingMovie
                                    ? "Chỉnh Sửa Thông Tin Phim"
                                    : "Thêm Phim Mới Vào Danh Mục"
                            }}
                        </h3>
                    </div>
                    <button
                        type="button"
                        @click="showAddEditModal = false"
                        class="btn btn-sm btn-ghost btn-circle"
                    >
                        <BaseIcon name="close" size="18" />
                    </button>
                </div>

                <div class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Tên Phim (Tiếng Việt) *</label
                            >
                            <input
                                type="text"
                                required
                                placeholder="Vd: Dune: Hành Tinh Cát - Phần Hai"
                                v-model="formData.title"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black font-medium focus:outline-black"
                            />
                        </div>
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Tên Gốc / Tiếng Anh</label
                            >
                            <input
                                type="text"
                                placeholder="Vd: Dune: Part Two"
                                v-model="formData.originalTitle"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black font-medium focus:outline-black"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-black font-bold mb-1">
                                Nhãn Dán Độ Tuổi (Cục Điện Ảnh) *
                            </label>
                            <select
                                v-model="formData.ageRating"
                                class="select select-sm w-full bg-base-200 border-base-300 text-black font-semibold focus:outline-black font-mono"
                            >
                                <option value="P">P - Phổ biến đến mọi đối tượng khán giả</option>
                                <option value="K">
                                    K - Dưới 13 tuổi có cha mẹ/người giám hộ đi kèm
                                </option>
                                <option value="C13">
                                    C13 - Cấm phổ biến đến khán giả dưới 13 tuổi
                                </option>
                                <option value="C16">
                                    C16 - Cấm phổ biến đến khán giả dưới 16 tuổi
                                </option>
                                <option value="C18">
                                    C18 - Cấm phổ biến đến khán giả dưới 18 tuổi
                                </option>
                                <option value="C">C - Cấm phổ biến</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Trạng Thái Phát Hành *</label
                            >
                            <select
                                v-model="formData.status"
                                class="select select-sm w-full bg-base-200 border-base-300 text-black font-semibold focus:outline-black"
                            >
                                <option value="now_showing">Đang chiếu (Now Showing)</option>
                                <option value="sneak_show">Suất chiếu sớm (Sneak show)</option>
                                <option value="coming_soon">Sắp chiếu (Coming Soon)</option>
                                <option value="ended">Ngừng chiếu (Ended)</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Thời Lượng (Phút) *</label
                            >
                            <input
                                type="number"
                                min="1"
                                required
                                v-model.number="formData.durationMinutes"
                                class="input input-sm w-full bg-base-200 border-base-300 font-mono font-bold text-black focus:outline-black"
                            />
                        </div>
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Quốc Gia Sản Xuất *</label
                            >
                            <select
                                v-model="formData.country"
                                class="select select-sm w-full bg-base-200 border-base-300 text-black font-medium focus:outline-black"
                            >
                                <option v-for="c in ALL_COUNTRIES" :key="c" :value="c">
                                    {{ c }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Ngày Khởi Chiếu *</label
                            >
                            <input
                                type="date"
                                required
                                v-model="formData.releaseDate"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black focus:outline-black font-mono font-bold"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-black font-bold mb-1">Đạo Diễn</label>
                            <input
                                type="text"
                                placeholder="Vd: Denis Villeneuve"
                                v-model="formData.director"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black font-medium focus:outline-black"
                            />
                        </div>
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Diễn Viên Chính (Dấu phẩy phân cách)</label
                            >
                            <input
                                type="text"
                                placeholder="Vd: Timothée Chalamet, Zendaya, Austin Butler"
                                v-model="formData.cast"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black font-medium focus:outline-black"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Link Ảnh Poster Dọc (2:3)</label
                            >
                            <input
                                type="url"
                                placeholder="https://..."
                                v-model="formData.posterUrl"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black text-[11px] focus:outline-black font-mono"
                            />
                        </div>
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Link Ảnh Backdrop Ngang (16:9)</label
                            >
                            <input
                                type="url"
                                placeholder="https://..."
                                v-model="formData.backdropUrl"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black text-[11px] focus:outline-black font-mono"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Link Video Trailer</label
                            >
                            <input
                                type="text"
                                placeholder="https://www.youtube.com/watch?v=..."
                                v-model="formData.trailerUrl"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black text-[11px] focus:outline-black font-mono"
                            />
                        </div>
                        <div>
                            <label class="block text-black font-bold mb-1"
                                >Số Giấy Phép Kiểm Duyệt</label
                            >
                            <input
                                type="text"
                                placeholder="Vd: GP số 248/QĐ-ĐA - Cục Điện Ảnh"
                                v-model="formData.censorshipLicense"
                                class="input input-sm w-full bg-base-200 border-base-300 text-black font-medium focus:outline-black"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-black font-bold mb-1.5">
                            Thể Loại Phim (Chọn nhiều):
                        </label>
                        <div class="flex flex-wrap gap-1.5">
                            <button
                                type="button"
                                v-for="genre in ALL_GENRES"
                                :key="genre"
                                @click="toggleGenre(genre)"
                                class="badge badge-sm cursor-pointer"
                                :class="
                                    formData.genres.includes(genre)
                                        ? 'badge-neutral font-bold'
                                        : 'badge-outline'
                                "
                            >
                                {{ formData.genres.includes(genre) ? `✓ ${genre}` : genre }}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-black font-bold mb-1.5">
                            Định Dạng Chiếu Hỗ Trợ:
                        </label>
                        <div class="flex flex-wrap gap-1.5">
                            <button
                                type="button"
                                v-for="fmt in ALL_FORMATS"
                                :key="fmt"
                                @click="toggleFormat(fmt)"
                                class="badge badge-sm font-mono cursor-pointer"
                                :class="
                                    formData.formats.includes(fmt)
                                        ? 'badge-neutral font-bold'
                                        : 'badge-outline'
                                "
                            >
                                {{ formData.formats.includes(fmt) ? `✓ ${fmt}` : fmt }}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-black font-bold mb-1"
                            >Tóm Tắt Nội Dung Phim</label
                        >
                        <textarea
                            rows="3"
                            placeholder="Mô tả cốt truyện chính của phim..."
                            v-model="formData.synopsis"
                            class="textarea textarea-sm w-full bg-base-200 border-base-300 text-black focus:outline-black leading-relaxed"
                        />
                    </div>
                </div>

                <div class="modal-action">
                    <button
                        type="button"
                        @click="showAddEditModal = false"
                        class="btn btn-sm btn-ghost"
                    >
                        Hủy Bỏ
                    </button>
                    <button type="submit" class="btn btn-sm btn-neutral text-white font-bold">
                        {{ editingMovie ? "Cập Nhật Phim" : "Thêm Phim Vào Hệ Thống" }}
                    </button>
                </div>
            </form>
        </div>

        <div v-if="showTrailerModal" class="modal modal-open">
            <div
                class="modal-box bg-base-100 border border-base-300 max-w-3xl p-5 text-black space-y-3"
            >
                <div class="flex items-center justify-between pb-2 border-b border-base-300">
                    <div class="flex items-center gap-2">
                        <BaseIcon name="video" size="20" class="text-black" />
                        <h3 class="font-extrabold text-black text-sm">Xem Trailer Phim</h3>
                    </div>
                    <button
                        @click="showTrailerModal = null"
                        class="btn btn-sm btn-ghost btn-circle"
                    >
                        <BaseIcon name="close" size="18" />
                    </button>
                </div>

                <div
                    class="aspect-video w-full rounded bg-black overflow-hidden flex items-center justify-center border border-base-300"
                >
                    <iframe
                        v-if="
                            showTrailerModal.includes('youtube.com') ||
                            showTrailerModal.includes('youtu.be')
                        "
                        :src="
                            showTrailerModal.includes('watch?v=')
                                ? showTrailerModal.replace('watch?v=', 'embed/')
                                : showTrailerModal
                        "
                        title="Movie Trailer"
                        class="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    />
                    <div v-else class="text-center p-6 space-y-2 text-white">
                        <p class="text-xs text-neutral-300">
                            Đường dẫn trailer: {{ showTrailerModal }}
                        </p>
                        <a
                            :href="showTrailerModal"
                            target="_blank"
                            rel="noreferrer"
                            class="btn btn-sm btn-outline text-white border-white font-bold"
                        >
                            <span>Mở Trên Tab Mới</span>
                            <BaseIcon name="external-link" size="14" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAdminCinemaStore } from "@/stores/admin/useAdminCinemaStore";
import BaseIcon from "@/components/common/BaseIcon.vue";

const router = useRouter();
const cinemaStore = useAdminCinemaStore();

const selectedMovie = ref(cinemaStore.movies[0] || null);
const searchQuery = ref("");
const statusFilter = ref("all");
const ratingFilter = ref("all");
const countryFilter = ref("all");
const genreFilter = ref("all");

const showAddEditModal = ref(false);
const editingMovie = ref(null);
const showTrailerModal = ref(null);

const ALL_GENRES = [
    "Hành động",
    "Khoa học viễn tưởng",
    "Phiêu lưu",
    "Tâm lý",
    "Tình cảm",
    "Gia đình",
    "Hài",
    "Hoạt hình",
    "Trinh thám",
    "Kinh dị",
    "Quái vật",
    "Chiến tranh",
];

const ALL_COUNTRIES = [
    "Việt Nam",
    "Mỹ",
    "Nhật Bản",
    "Hàn Quốc",
    "Anh",
    "Pháp",
    "Thái Lan",
    "Trung Quốc",
];

const ALL_FORMATS = [
    "2D Phụ đề",
    "2D Lồng tiếng",
    "3D Phụ đề",
    "IMAX Laser",
    "ScreenX",
    "4DX",
    "Dolby Atmos",
];

const AGE_RATING_CONFIG = {
    P: {
        label: "P",
        name: "Phổ biến",
        color: "bg-neutral-100 text-black border-neutral-400 font-bold",
        desc: "Phổ biến đến mọi độ tuổi khán giả",
    },
    K: {
        label: "K",
        name: "Dưới 13 có giám hộ",
        color: "bg-neutral-100 text-black border-neutral-400 font-bold",
        desc: "Khán giả dưới 13 tuổi có cha mẹ/người giám hộ đi kèm",
    },
    C13: {
        label: "C13",
        name: "Cấm dưới 13 tuổi",
        color: "bg-neutral-200 text-black border-neutral-500 font-black",
        desc: "Cấm phổ biến đến khán giả dưới 13 tuổi",
    },
    T13: {
        label: "C13",
        name: "Cấm dưới 13 tuổi",
        color: "bg-neutral-200 text-black border-neutral-500 font-black",
        desc: "Cấm phổ biến đến khán giả dưới 13 tuổi",
    },
    C16: {
        label: "C16",
        name: "Cấm dưới 16 tuổi",
        color: "bg-neutral-300 text-black border-neutral-600 font-black",
        desc: "Cấm phổ biến đến khán giả dưới 16 tuổi",
    },
    T16: {
        label: "C16",
        name: "Cấm dưới 16 tuổi",
        color: "bg-neutral-300 text-black border-neutral-600 font-black",
        desc: "Cấm phổ biến đến khán giả dưới 16 tuổi",
    },
    C18: {
        label: "C18",
        name: "Cấm dưới 18 tuổi",
        color: "bg-black text-white border-black font-black",
        desc: "Cấm phổ biến đến khán giả dưới 18 tuổi",
    },
    T18: {
        label: "C18",
        name: "Cấm dưới 18 tuổi",
        color: "bg-black text-white border-black font-black",
        desc: "Cấm phổ biến đến khán giả dưới 18 tuổi",
    },
    C: {
        label: "C",
        name: "Cấm phổ biến",
        color: "bg-neutral-800 text-white border-neutral-900",
        desc: "Không được phép phổ biến tại rạp",
    },
};

const RELEASE_STATUS_CONFIG = {
    now_showing: {
        label: "Đang chiếu",
        badgeColor: "text-black bg-neutral-100 border-neutral-400 font-bold",
    },
    sneak_show: {
        label: "Suất chiếu sớm (Sneak show)",
        badgeColor: "text-white bg-black border-black font-bold",
    },
    coming_soon: {
        label: "Sắp chiếu",
        badgeColor: "text-neutral-700 bg-neutral-100 border-neutral-300",
    },
    ended: {
        label: "Ngừng chiếu",
        badgeColor: "text-neutral-400 bg-neutral-50 border-neutral-200 line-through",
    },
};

const formData = ref({
    title: "",
    originalTitle: "",
    posterUrl: "",
    backdropUrl: "",
    durationMinutes: 120,
    director: "",
    cast: "",
    country: "Việt Nam",
    releaseDate: "2026-11-15",
    ageRating: "C13",
    status: "now_showing",
    trailerUrl: "",
    synopsis: "",
    censorshipLicense: "",
    language: "Tiếng Việt",
    genres: ["Hành động"],
    formats: ["2D Phụ đề", "2D Lồng tiếng"],
});

function handleOpenAddModal() {
    editingMovie.value = null;
    formData.value = {
        title: "",
        originalTitle: "",
        posterUrl:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
        backdropUrl:
            "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&auto=format&fit=crop&q=80",
        durationMinutes: 120,
        director: "",
        cast: "",
        country: "Việt Nam",
        releaseDate: new Date().toISOString().split("T")[0],
        ageRating: "C13",
        status: "now_showing",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        synopsis: "",
        censorshipLicense: "GP số .../QĐ-ĐA - Cục Điện Ảnh cấp phép",
        language: "Tiếng Việt",
        genres: ["Hành động"],
        formats: ["2D Phụ đề", "2D Lồng tiếng"],
    };
    showAddEditModal.value = true;
}

function handleOpenEditModal(movie) {
    editingMovie.value = movie;
    formData.value = {
        title: movie.title,
        originalTitle: movie.originalTitle,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        durationMinutes: movie.durationMinutes,
        director: movie.director,
        cast: movie.cast.join(", "),
        country: movie.country || "Việt Nam",
        releaseDate: movie.releaseDate,
        ageRating:
            movie.ageRating === "T13"
                ? "C13"
                : movie.ageRating === "T16"
                  ? "C16"
                  : movie.ageRating === "T18"
                    ? "C18"
                    : movie.ageRating,
        status: movie.status,
        trailerUrl: movie.trailerUrl || "",
        synopsis: movie.synopsis || "",
        censorshipLicense: movie.censorshipLicense || "",
        language: movie.language || "Tiếng Việt",
        genres: [...movie.genre],
        formats: [...movie.formats],
    };
    showAddEditModal.value = true;
}

function handleSaveMovie() {
    if (!formData.value.title.trim()) return;

    const movieObj = {
        id: editingMovie.value ? editingMovie.value.id : `mv-${Date.now()}`,
        title: formData.value.title,
        originalTitle: formData.value.originalTitle || formData.value.title,
        posterUrl:
            formData.value.posterUrl ||
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
        backdropUrl:
            formData.value.backdropUrl ||
            "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&auto=format&fit=crop&q=80",
        durationMinutes: Number(formData.value.durationMinutes),
        genre: formData.value.genres.length > 0 ? formData.value.genres : ["Tâm lý"],
        formats: formData.value.formats.length > 0 ? formData.value.formats : ["2D Phụ đề"],
        releaseDate: formData.value.releaseDate,
        ageRating: formData.value.ageRating,
        status: formData.value.status,
        director: formData.value.director || "Chưa cập nhật",
        cast: formData.value.cast ? formData.value.cast.split(",").map((s) => s.trim()) : [],
        country: formData.value.country,
        trailerUrl: formData.value.trailerUrl,
        synopsis: formData.value.synopsis,
        censorshipLicense: formData.value.censorshipLicense,
        language: formData.value.language,
        totalGmv: editingMovie.value ? editingMovie.value.totalGmv : 0,
        totalTickets: editingMovie.value ? editingMovie.value.totalTickets : 0,
        rating: editingMovie.value ? editingMovie.value.rating : 8.5,
        marketShare: editingMovie.value
            ? editingMovie.value.marketShare
            : [
                  { chainId: "cgv", chainName: "CJ CGV", percentage: 46, tickets: 0 },
                  { chainId: "lotte", chainName: "Lotte Cinema", percentage: 26, tickets: 0 },
                  { chainId: "galaxy", chainName: "Galaxy Cinema", percentage: 16, tickets: 0 },
                  { chainId: "beta", chainName: "Beta Cinemas", percentage: 12, tickets: 0 },
              ],
    };

    if (editingMovie.value) {
        cinemaStore.updateMovie(movieObj);
        if (selectedMovie.value?.id === movieObj.id) {
            selectedMovie.value = movieObj;
        }
    } else {
        cinemaStore.addMovie(movieObj);
        selectedMovie.value = movieObj;
    }

    showAddEditModal.value = false;
}

function toggleGenre(genre) {
    if (formData.value.genres.includes(genre)) {
        formData.value.genres = formData.value.genres.filter((g) => g !== genre);
    } else {
        formData.value.genres.push(genre);
    }
}

function toggleFormat(fmt) {
    if (formData.value.formats.includes(fmt)) {
        formData.value.formats = formData.value.formats.filter((f) => f !== fmt);
    } else {
        formData.value.formats.push(fmt);
    }
}

const filteredMovies = computed(() => {
    return cinemaStore.movies.filter((m) => {
        const matchesSearch =
            m.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            m.originalTitle.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            m.director.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            m.cast.some((c) => c.toLowerCase().includes(searchQuery.value.toLowerCase()));

        const matchesStatus = statusFilter.value === "all" || m.status === statusFilter.value;

        const normalizedRating =
            m.ageRating === "T13"
                ? "C13"
                : m.ageRating === "T16"
                  ? "C16"
                  : m.ageRating === "T18"
                    ? "C18"
                    : m.ageRating;
        const matchesRating =
            ratingFilter.value === "all" || normalizedRating === ratingFilter.value;

        const matchesCountry =
            countryFilter.value === "all" || m.country === countryFilter.value;
        const matchesGenre = genreFilter.value === "all" || m.genre.includes(genreFilter.value);

        return (
            matchesSearch && matchesStatus && matchesRating && matchesCountry && matchesGenre
        );
    });
});
</script>

