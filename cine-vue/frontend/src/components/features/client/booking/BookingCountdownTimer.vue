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
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
    initialMinutes: { type: Number, default: 5 }, // Mặc định là 5 phút
    autoRestart: { type: Boolean, default: true },
});

const emit = defineEmits(["time-up"]);

const totalSeconds = ref(props.initialMinutes * 60);
let timer = null;

const minutes = ref(props.initialMinutes);
const seconds = ref(0);

const updateDisplay = () => {
    minutes.value = Math.floor(totalSeconds.value / 60);
    seconds.value = totalSeconds.value % 60;
};

const startTimer = () => {
    timer = setInterval(() => {
        if (totalSeconds.value > 0) {
            totalSeconds.value--;
            updateDisplay();
        } else {
            clearInterval(timer);
            emit("time-up");
            if (props.autoRestart) {
                totalSeconds.value = props.initialMinutes * 60;
                updateDisplay();
                startTimer(); // Restart đồng hồ
            }
        }
    }, 1000);
};

onMounted(() => {
    updateDisplay();
    startTimer();
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});
</script>
