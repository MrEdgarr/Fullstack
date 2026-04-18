import { ref, reactive, onMounted, onUnmounted } from "vue";

export function useSeatMap(viewportRef, contentRef) {
    const ZOOM_CONFIG = { MIN: 0.75, MAX: 2, STEP: 0.5 };
    const transform = reactive({ x: 0, y: 0, scale: 1 });
    const isDragging = ref(false);
    const startPos = { x: 0, y: 0 };

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    // Tính toán giới hạn chuẩn
    const getBounds = () => {
        if (!viewportRef.value || !contentRef.value) return { maxX: 0, maxY: 0 };
        const vWidth = viewportRef.value.clientWidth;
        const vHeight = viewportRef.value.clientHeight;
        const cWidth = contentRef.value.clientWidth * transform.scale;
        const cHeight = contentRef.value.clientHeight * transform.scale;

        return {
            maxX: Math.max(0, (cWidth - vWidth) / 2 + 20),
            maxY: Math.max(0, (cHeight - vHeight) / 2 + 20),
        };
    };

    // Đưa về biên (Elastic Return)
    const snapToBounds = () => {
        const { maxX, maxY } = getBounds();
        transform.x = clamp(transform.x, -maxX, maxX);
        transform.y = clamp(transform.y, -maxY, maxY);
    };

    const startDrag = (e) => {
        isDragging.value = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startPos.x = clientX - transform.x;
        startPos.y = clientY - transform.y;
    };

    const onDrag = (e) => {
        if (!isDragging.value) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let nextX = clientX - startPos.x;
        let nextY = clientY - startPos.y;

        const { maxX, maxY } = getBounds();

        // Hiệu ứng "Lực cản" khi vượt biên
        if (nextX > maxX) nextX = maxX + (nextX - maxX) * 0.3;
        if (nextX < -maxX) nextX = -maxX + (nextX + maxX) * 0.3;
        if (nextY > maxY) nextY = maxY + (nextY - maxY) * 0.3;
        if (nextY < -maxY) nextY = -maxY + (nextY + maxY) * 0.3;

        transform.x = nextX;
        transform.y = nextY;
    };

    const fitToViewport = () => {
        if (!viewportRef.value || !contentRef.value) return;

        // Padding để sơ đồ không dính sát mép viền (ví dụ: 40px mỗi bên)
        const padding = 80;

        const vWidth = viewportRef.value.clientWidth - padding;
        const vHeight = viewportRef.value.clientHeight - padding;

        // Lấy kích thước gốc của content (trước khi scale)
        const cWidth = contentRef.value.clientWidth;
        const cHeight = contentRef.value.clientHeight;

        // Tính toán tỷ lệ scale để vừa cả chiều rộng lẫn chiều cao
        const scaleX = vWidth / cWidth;
        const scaleY = vHeight / cHeight;

        // Chọn giá trị nhỏ hơn để đảm bảo không bị tràn chiều nào
        let optimalScale = Math.min(scaleX, scaleY);

        // Khống chế trong giới hạn MIN/MAX đã định nghĩa
        transform.scale = clamp(optimalScale, ZOOM_CONFIG.MIN, ZOOM_CONFIG.MAX);

        // Reset vị trí về trung tâm
        transform.x = 0;
        transform.y = 0;
    };

    const endDrag = () => {
        isDragging.value = false;
        snapToBounds(); // Khi buông tay, tự động quay về biên
    };

    const updateZoom = (newScale) => {
        transform.scale = clamp(newScale, ZOOM_CONFIG.MIN, ZOOM_CONFIG.MAX);
        snapToBounds();
    };

    // Các event wheel giữ nguyên...
    const onWheel = (e) => {
        e.preventDefault();
        updateZoom(transform.scale + e.deltaY * -0.001);
    };

    onMounted(() => viewportRef.value?.addEventListener("wheel", onWheel, { passive: false }));
    onUnmounted(() => viewportRef.value?.removeEventListener("wheel", onWheel));

    return {
        transform,
        isDragging,
        ZOOM_CONFIG,
        updateZoom,
        startDrag,
        onDrag,
        endDrag,
        fitToViewport,
    };
}
