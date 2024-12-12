<template>
  <div class="dashboard">
    <h1>User Dashboard</h1>

    <div class="tabs">
      <button
          v-for="tab in tabs"
          :key="tab"
          :class="{ active: activeTab === tab }"
          @click="handleTabClick(tab)">
        {{ tab }}
      </button>
    </div>

    <div class="tab-content">
      <!-- Ride Request Tab -->
      <section v-if="activeTab === 'Request Ride'">
        <h2>Request a Ride</h2>
        <form v-if="rideStatus === 'idle'" @submit.prevent="submitRideRequest">
          <div>
            <label for="departure">Departure Address:</label>
            <input type="text" id="departure" v-model="rideRequest.departure" required />
          </div>
          <div>
            <label for="destination">Destination Address:</label>
            <input type="text" id="destination" v-model="rideRequest.destination" required />
          </div>
          <div>
            <label for="distance">Distance (km):</label>
            <input type="number" id="distance" step="0.01"  v-model="rideRequest.distance" required />
          </div>
          <div>
            <label for="rideType">Ride Type:</label>
            <select id="rideType" v-model="rideRequest.rideType" required>
              <option value="standard">STANDARD</option>
              <option value="premium">PREMIUM</option>
              <option value="shared">SHARED</option>
            </select>
          </div>
          <button type="submit">Submit Request</button>
        </form>
        <!-- 显示请求的基本信息 -->
        <div v-if="rideStatus === 'pending'||rideStatus==='confirmed'">
          <h3>Ride Request Information</h3>
          <p>Departure: {{ rideRequest.departure }}</p>
          <p>Destination: {{ rideRequest.destination }}</p>
          <p>Distance: {{ rideRequest.distance }} km</p>
          <p>Ride Type: {{ rideRequest.rideType }}</p>
          <button @click="waitOrConfirm">{{this.buttonText}}</button> <!-- 等待按钮 -->
        </div>
      </section>

      <!-- Bill History Tab -->
      <section v-if="activeTab === 'Bill History'">
        <div v-if="bills.length > 0">
          <table class="bill-table">
            <thead>
            <tr>
              <th>Driver ID</th>
              <th>Price</th>
              <th>Time</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="bill in bills" :key="bill.id">
              <td>{{ bill.driverId }}</td>
              <td>{{ bill.price.toFixed(2) }}</td>
              <td>{{ formatTimestamp(bill.timestamp) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>No bills available.</p>
        </div>
      </section>

      <!-- Driver Tracking Tab -->
      <section v-if="activeTab === 'Track Driver' && rideStatus === 'pending'">
        <h2>Track Your Driver</h2>
        <p>Driver is on the way to your location.</p>
        <table class="bill-table">
          <thead>
          <tr>
            <th>Driver ID</th>
            <th>Latitude</th>
            <th>Longtitude</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{{ position.driverId }}</td>
            <td>{{ position.driverLatitude.toFixed(2) }}</td>
            <td>{{ position.driverLongitude.toFixed(2) }}</td>
          </tr>
          </tbody>
        </table>
      </section>

      <!-- Checkout Tab -->
      <section v-if="activeTab === 'Checkout' && rideStatus === 'confirmed'">
        <h2>Checkout</h2>
        <div v-if="bill">
          <p>Your ride is complete. Please proceed to checkout.</p>
          <table class="bill-table">
            <thead>
            <tr>
              <th>Driver ID</th>
              <th>Price</th>
              <th>Time</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{{ bill.driverId }}</td>
              <td>{{ bill.price.toFixed(2) }}</td>
              <td>{{ formatTimestamp(bill.timestamp) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>You don't have any bill to pay.</p>
        </div>
        <button @click="checkout">Checkout</button>
      </section>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {Stomp} from "@stomp/stompjs";

export default {
  name: "UserDashboard",
  data() {
    return {
      tabs: ['Request Ride', 'Bill History', 'Track Driver', 'Checkout'],
      activeTab: 'Request Ride',
      rideRequest: {
        departure: "",
        destination: "",
        distance: null,
        rideType: "standard",
      },
      bills: [],
      bill:{
      },
      position:{},
      rideStatus: "idle", // idle, pending, confirmed, completed
      buttonText:"Waiting for ride...",
      requestId:0,
    };
  },
  methods: {
    // 处理 Tab 切换
    handleTabClick(tab) {
      this.activeTab = tab;
      if (tab === 'Bill History') {
        this.fetchBillHistory();
      }
      if (tab === 'Checkout' && this.rideStatus === 'confirmed') {
        this.fetchBill();
      }
      if (tab === 'Track Driver' && this.rideStatus === 'pending') {
        this.trackDriver();
      }
    },
    async submitRideRequest() {
      try {
        const payload = {
          passengerId: localStorage.getItem("userId"),
          rideType: this.rideRequest.rideType.toUpperCase(),
          pickupLocation: this.rideRequest.departure,
          dropoffLocation: this.rideRequest.destination,
          distance: this.rideRequest.distance
        };

        const response = await axios.post('/api/passenger/submit-request', payload);

        console.log('Ride request submitted successfully', response.data);
        this.requestId = response.data.rideRequestId;
        this.rideStatus = 'pending';
        // 启动等待后台更新的函数
        //this.waitForRide();
      } catch (error) {
        console.error('Error submitting ride request:', error);
        alert('Failed to submit ride request. UserId:' + localStorage.getItem("userId"));
      }
    },
    waitOrConfirm(){
      if (this.rideStatus==='confirmed') {
        this.confirmRide(); // 如果已接单，执行确认上车逻辑
      } else {
        this.waitForRide(); // 如果未接单，提示等待接单
      }
    },
    //从后端获取请求的状态变化，并根据状态更新按钮
    async waitForRide() {
      try {
        //const passengerId = localStorage.getItem("userId");
        const response = await axios.get('/api/passenger/notifyPassenger/'+this.requestId);
        const rideData = response.data;
        //alert(rideData.status);
        // 创建 WebSocket 连接
       /* const socket = new WebSocket("/ws");
        const stompClient = Stomp.over(socket);
        stompClient.connect({}, () => {
          console.log("WebSocket connected");
          // 订阅服务器推送的消息
          stompClient.subscribe(`/topic/rideStatus/${passengerId}`, (message) => {
            const data = JSON.parse(message.body);
            console.log("Received WebSocket message:", data);

            if (data.status === "ACCEPTED") {
              this.rideStatus = 'confirmed'; // 更新状态
              this.buttonText = "确认上车"; // 更新按钮文字
            }
          },(error) => {
            console.error("WebSocket connection error:", error); // 错误日志
          });
        });
        // 根据状态调整按钮文本和可点击状态
      } catch (error) {
        console.error('Error fetching ride status:', error);
      }*/
        if (rideData.status === "ACCEPTED") {
          this.rideStatus = 'confirmed'; // 更新状态
          this.buttonText = "确认上车"; // 更新按钮文字
        }
        else alert(rideData.status);
      }catch (error) {
        console.error('Error fetching ride status:', error);
        alert("Waiting for ride...");
      }
    },
    confirmRide() {
      console.log("Ride Confirmed");
      alert("已确认上车！");
      //this.rideStatus = "confirmed";
      //this.activeTab = 'Track Driver';
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },
    checkout() {
      console.log("Checked Out");
      this.rideStatus = "idle";
      this.buttonText = "Waiting for ride...";
      this.activeTab = 'Request Ride';
    },
    // 获取历史账单
    async fetchBillHistory() {
      try {
        const passengerId = localStorage.getItem("userId");
        const response = await axios.get(`/api/passenger/bill/${passengerId}`);
        this.bills = response.data;
      } catch (error) {
        console.error('Error fetching bill history:', error);
        alert('Failed to fetch bill history.');
      }
    },
    async fetchBill(){
      try {
        const passengerId = localStorage.getItem("userId");
        const response = await axios.get(`/api/passenger/price/${passengerId}`);
        this.bill = response.data;
        //alert('Your id:'+localStorage.getItem("userId"));
      } catch (error) {
        console.error('Error fetching bill:', error);
        alert('Failed to fetch bill.'+localStorage.getItem("userId"));
      }
    },
    async trackDriver() {
      try {
        const passengerId = localStorage.getItem("userId");
        const response = await axios.post(`/api/passenger/track-ride/${passengerId}`);
        this.position = response.data;
        //alert('Your id:'+localStorage.getItem("userId"));
      } catch (error) {
        console.error('Error checking driver:', error);
        alert('Failed to check driver.'+localStorage.getItem("userId"));
      }
    }
  },
};
</script>

<style scoped>
.dashboard {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.tabs button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.tabs button.active {
  background-color: #0056b3;
}
.tabs button:hover {
  background-color: #0056b3;
}
.tab-content section {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input, select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 14px;
}

.bill-table th, .bill-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

.bill-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.bill-table td {
  background-color: #fff;
}

.bill-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.bill-table tr:hover {
  background-color: #f1f1f1;
}
</style>
