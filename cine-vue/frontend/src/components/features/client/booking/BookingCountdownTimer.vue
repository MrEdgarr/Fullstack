<template>
    <div class="card bg-base-100 border border-base-300 card-sm">
        <div class="card-body">
            <div class="flex items-center justify-center gap-2">
                <span class="text-sm text-base-content"> Thời gian giữ ghế: </span>
                <span class="countdown font-medium text-lg text-primary">
                    <span :style="{ '--value': minutes, '--digits': 2 }" aria-live="polite">
                        {{ minutes }}
                    </span>
                    :
                    <span :style="{ '--value': seconds, '--digits': 2 }" aria-live="polite">
                        {{ seconds }}
                    </span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    initialMinutes: { type: Number, default: 5 }, // Mặc định là 5 phút
    autoRestart: { type: Boolean, default: true },
    storageKey: { type: String, default: "countdown_expiry" },
});

const emit = defineEmits(["time-up"]);

const timeLeft = ref(0);
let timer = null;
let isPaused = ref(false);

const minutes = ref(props.initialMinutes);
const seconds = ref(0);

const updateDisplay = () => {
    minutes.value = Math.floor(timeLeft.value / 60);
    seconds.value = timeLeft.value % 60;
};

const startTimer = () => {
    if (isPaused.value) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        if (timeLeft.value > 0) {
            timeLeft.value--;
            updateDisplay();
        } else {
            // Hết giờ → Reset và chạy lại ngay
            timeLeft.value = props.initialMinutes * 60;
            updateDisplay();
            emit("time-up"); // Vẫn thông báo mỗi khi hết 5 phút
        }
    }, 1000);
};

// Load thời gian từ localStorage hoặc khởi tạo mới
const initCountdown = () => {
    const savedExpiry = localStorage.getItem(props.storageKey);

    if (savedExpiry) {
        const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000);
        if (remaining > 0) {
            timeLeft.value = remaining;
        } else {
            localStorage.removeItem(props.storageKey);
            timeLeft.value = props.initialMinutes * 60;
        }
    } else {
        // Lần đầu khởi tạo
        timeLeft.value = props.initialMinutes * 60;
        const expiryTime = Date.now() + props.initialMinutes * 60 * 1000;
        localStorage.setItem(props.storageKey, expiryTime.toString());
    }

    updateDisplay();
    startTimer();
};

// Hàm pause / resume
const pause = () => {
    isPaused.value = true;
};
const resume = () => {
    isPaused.value = false;
};
const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
    isPaused.value = true;
};

defineExpose({ pause, resume, stop });

onMounted(() => {
    initCountdown();
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});
</script>
