<template>
  <div class="form-floating">
    <slot></slot>
    <label for="{{ id }}">{{ label }}</label>
  </div>
</template>
<script>

export default {
  name: 'FloatingLabel',
  props: {
    id: String,
    label: String,
    col: String,
  }
}

</script>