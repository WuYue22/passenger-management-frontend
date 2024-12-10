<template>
  <div class="login-container">
    <h1>用户登录</h1>
    <form @submit.prevent="handleLogin">
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
      <button type="submit">登录</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      username: "",
      password: "",
      error: null,
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post("/api/passenger/login", {
          username: this.username,
          password: this.password,
        });
        const { userId, message } = response.data;
        // 将 userId 存储在 Local Storage 中
        localStorage.setItem("userId", userId);
        // 假设后端返回一个 token 和跳转信息
        //const {token, redirectUrl} = response.data;
        //localStorage.setItem("authToken", token);
        this.$router.push("/dashboard");
      } catch (err) {
        this.error = "登录失败，请检查用户名或密码！";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
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

