<template>
  <ul>
    <li v-for="passenger in passengers" :key="passenger.id">
      {{ passenger.name }} ({{ passenger.email }})
    </li>
  </ul>
</template>

<script>
export default {
  props: ['passengers'],
};
</script>
