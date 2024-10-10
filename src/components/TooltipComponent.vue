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
      // If tooltip goes off the left edge of the screen, align it to the left of the container
      tooltipText.value.style.left = '0';
      tooltipText.value.style.transform = 'translateX(0)';
    } else if (tooltipRect.right > window.innerWidth) {
      // If tooltip goes off the right edge, align it to the right of the container
      tooltipText.value.style.left = 'auto';
      tooltipText.value.style.right = '0';
      tooltipText.value.style.transform = 'translateX(0)';
    } else {
      // Default positioning
      tooltipText.value.style.left = '50%';
      tooltipText.value.style.transform = 'translateX(-50%)';
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
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 5px 10px;
  border-radius: 4px;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 1;
  font-size: 0.8em;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.campaign-name {
  cursor: default;
  /* Ensure the cursor is set to default */
}
</style>