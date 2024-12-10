<template>
  <div class="register-container">
    <h1>用户注册</h1>
    <form @submit.prevent="registerUser">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            required
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
        />
      </div>
      <button type="submit" class="register-btn">注册</button>
    </form>
    <p v-if="message" :class="{'success-message': isSuccess, 'error-message': !isSuccess}">
      {{ message }}
    </p>
    <button @click="goToLogin" class="login-btn">登录</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Register",
  data() {
    return {
      username: "",
      password: "",
      message: "",
      isSuccess: false,
    };
  },
  methods: {
    async registerUser() {
      try {
        const response = await axios.post("/api/passenger/register", {
          username: this.username,
          password: this.password,
        });
        console.log("Response data:", response.data); // 打印成功响应
        this.message = response.data; // 显示成功消息
        this.isSuccess = true;
        // 注册成功后跳转到登录界面
        setTimeout(() => {
          this.$router.push("/login");
        }, 1500); // 延迟 1.5 秒后跳转，让用户看到消息
      } catch (error) {
        if (error.response) {
          // 服务器有响应但状态码非 2xx
          console.error("Error response:", error.response);
          this.message = error.response.data; // 显示错误消息
        } else if (error.request) {
          // 请求已发送但未收到服务器响应
          console.error("No response received:", error.request);
          this.message = "无法连接到服务器，请稍后再试";
        } else {
          // 其他错误
          console.error("Error message:", error.message);
          this.message = "发生未知错误，请稍后再试";
        }
        this.isSuccess = false;
      }
    },
    // 跳转到登录页面
    goToLogin() {
      this.$router.push("/login");
    },

  },
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.success-message {
  color: green;
  text-align: center;
}

.error-message {
  color: red;
  text-align: center;
}
</style>
