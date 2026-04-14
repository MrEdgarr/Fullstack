<template>
    <component
        :is="iconComponent"
        v-if="iconComponent"
        class="icon-base"
        :class="{ 'icon-outline': outline }"
        :style="style"
        v-bind="$attrs"
    />
    <span v-else class="icon-base bg-base-100 opacity-50"></span>
</template>

<script setup>
const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    // Nếu true: Dùng mode outline (stroke), False: Dùng mode solid (fill)
    outline: {
        type: Boolean,
        default: false,
    },
    // Cho phép override size trực tiếp (VD: size="24")
    size: {
        type: [String, Number],
        default: null,
    },
});

// 1. Quét file: Chỉ load code khi cần thiết
const modules = import.meta.glob("@/assets/icons/*.svg", {
    query: "?component",
    import: "default",
});

const iconComponent = shallowRef(null);

// 2. Logic load icon (Có cache component)
const loadIcon = () => {
    const path = `/src/assets/icons/${props.name}.svg`;
    const loader = modules[path];

    if (loader) {
        iconComponent.value = defineAsyncComponent(loader);
    } else {
        console.warn(`[BaseIcon] Icon not found: ${props.name}`);
        iconComponent.value = null; // Hoặc gán icon mặc định
    }
};

// 3. Theo dõi khi tên icon thay đổi
watch(() => props.name, loadIcon, { immediate: true });

// 4. Xử lý size dynamic (nếu user truyền prop size)
const style = computed(() => {
    if (!props.size) return {};
    const s = isNaN(props.size) ? props.size : `${props.size}px`;
    return { width: s, height: s };
});
</script>
