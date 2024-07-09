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
        options: props.options
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