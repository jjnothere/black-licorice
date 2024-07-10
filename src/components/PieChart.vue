<template>
    <canvas ref="pieChart"></canvas>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  import { Chart, registerables } from 'chart.js';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
  Chart.register(...registerables, ChartDataLabels);
  
  const props = defineProps({
    chartData: Object,
    options: Object
  });
  
  const pieChart = ref(null);
  let chartInstance = null;
  
  const renderChart = () => {
    if (chartInstance) {
      chartInstance.destroy();
    }
    if (pieChart.value) {
      chartInstance = new Chart(pieChart.value, {
        type: 'pie',
        data: props.chartData,
        options: props.options
      });
    }
  };
  
  onMounted(renderChart);
  watch(() => props.chartData, renderChart);
  watch(() => props.options, renderChart);
  </script>