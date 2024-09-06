<!-- LineChart.vue -->
<template>
  <canvas ref="lineChart"></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  chartData: Object,
  options: Object
});

const emit = defineEmits(['point-clicked']); // Emit the point-clicked event
const lineChart = ref(null);
let chartInstance = null;

const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (lineChart.value) {
    chartInstance = new Chart(lineChart.value, {
      type: 'line',
      data: props.chartData,
      options: {
        ...props.options,
        onClick: (event, elements) => {
          if (elements.length) {
            const index = elements[0].index; // Get the index of the clicked point
            const label = chartInstance.data.labels[index]; // Get the label (date) of the clicked point
            console.log("Point clicked, label:", label); // Log the clicked point's date
            emit('point-clicked', label); // Emit the point-clicked event with the label
          }
        }
      }
    });
  }
};

watch(() => props.chartData, renderChart);

onMounted(renderChart);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>