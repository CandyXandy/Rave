<script setup>
// #region

const props = defineProps({
  size: {
    type: Number,
    default: 24,
  },
  color: {
    type: String,
    default: "currentColor",
  },
});

// #endregion
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    :width="props.size"
    :height="props.size"
    fill="none"
    :stroke="props.color"
    stroke-width="16"
    viewBox="-0.5 -0.5 208 208"
  >
    <defs />
    <g>
      <path
        d="M 71.36 71.36 L 136.64 71.36 L 8 200 L 8 71.36 L 136.64 200 L 200 200 L 8 8 L 136.64 8"
      />
      <path
        d="M 136 8 C 171.35 8 200 36.65 200 72 C 200 88.97 193.26 105.25 181.25 117.25 C 169.25 129.26 152.97 136 136 136"
      />
    </g>
  </svg>
</template>
