<!-- TooltipComponent.vue -->
<template>
  <div class="tooltip-container" ref="tooltipContainer">
    <slot></slot>
    <span class="tooltip-text" ref="tooltipText">{{ text }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

const tooltipContainer = ref(null);
const tooltipText = ref(null);

// Adjust the position of the tooltip based on its position on the screen
const adjustTooltipPosition = () => {
  const tooltipRect = tooltipText.value?.getBoundingClientRect();
  const containerRect = tooltipContainer.value?.getBoundingClientRect();

  if (tooltipRect && containerRect) {
    if (tooltipRect.left < 0) {
      tooltipContainer.value.setAttribute('data-position', 'right');
    } else if (tooltipRect.right > window.innerWidth) {
      tooltipContainer.value.setAttribute('data-position', 'left');
    } else {
      tooltipContainer.value.setAttribute('data-position', 'center');
    }
  }
};

onMounted(() => {
  adjustTooltipPosition();
});

// Watch for changes in the text to adjust the position accordingly
watch(() => props.text, adjustTooltipPosition);
</script>

<style>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  position: fixed;
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 5px 10px;
  border-radius: 4px;
  bottom: auto;
  /* Reset bottom property */
  left: 0;
  /* Reset left property */
  transform: none;
  /* Reset transform */
  z-index: 1000;
  /* Ensure it appears above other elements */
  font-size: 0.8em;
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
}

/* Show tooltip */
.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
  cursor: default;
}

/* Example of dynamic adjustment */
.tooltip-container[data-position="left"] .tooltip-text {
  left: 0;
  transform: none;
}

.tooltip-container[data-position="right"] .tooltip-text {
  left: auto;
  right: 0;
  transform: none;
}
</style>