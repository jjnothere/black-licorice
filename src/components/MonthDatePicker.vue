<template>
    <div class="month-date-picker">
        <input type="month" v-model="selectedMonth" @change="updateDateRange" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['update-date-range']);

const selectedMonth = ref('');

const getCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const updateDateRange = () => {
    const [year, month] = selectedMonth.value.split('-');
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    emit('update-date-range', { start, end });
};

onMounted(() => {
    selectedMonth.value = getCurrentMonth();
    updateDateRange();
});
</script>

<style scoped>
.month-date-picker {
    margin-bottom: 5px;
}
</style>