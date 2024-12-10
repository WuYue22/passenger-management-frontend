<template>
  <div>
    <h1>Passenger Management</h1>
    <PassengerList :passengers="passengers" @refresh="fetchPassengers" />
    <PassengerForm @add="addPassenger" />
  </div>
</template>

<script>
import PassengerList from '@/components/PassengerList.vue';
import PassengerForm from '@/components/AuthForm.vue';
import axios from 'axios';

export default {
  components: { PassengerList, PassengerForm },
  data() {
    return {
      passengers: [],
    };
  },
  methods: {
    async fetchPassengers() {
      const response = await axios.get('/api/passenger-management/passengers');
      this.passengers = response.data;
    },
    async addPassenger(passenger) {
      await axios.post('/api/passenger-management/passengers', passenger);
      this.fetchPassengers();
    },
  },
  created() {
    this.fetchPassengers();
  },
};
</script>
