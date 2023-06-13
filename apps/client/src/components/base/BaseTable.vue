<template>
  <table class="table">
    <thead class="table-thead">
      <slot name="thead" />
    </thead>

    <tbody class="table-tbody">
      <slot name="tbody" />
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
.table {
  width: 100%;

  text-align: left;

  border-collapse: collapse;

  :deep(th),
  :deep(td) {
    padding: 0.5rem;
  }
}

.table-thead {
  border-bottom-width: 2px;
  border-bottom-style: solid;
  border-bottom-color: #{$gray-300};

  @media (prefers-color-scheme: "dark") {
    border-bottom-color: #{$gray-700};
  }
}

.table-tbody {
  :deep(tr:nth-of-type(2n + 1)) {
    background-color: #{rgba($black, 0.08)};
  }
}
</style>
