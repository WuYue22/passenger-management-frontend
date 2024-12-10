<template>
  <div class="auth-container">
    <h1>{{ title }}</h1>
    <form @submit.prevent="handleSubmit">
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
      <button type="submit" class="auth-btn">{{ buttonText }}</button>
    </form>
    <p v-if="message" :class="{'success-message': isSuccess, 'error-message': !isSuccess}">
      {{ message }}
    </p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AuthForm",
  props: {
    title: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    apiEndpoint: {
      type: String,
      required: true,
    },
    onSuccessRedirect: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      username: "",
      password: "",
      message: "",
      isSuccess: false,
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await axios.post(this.apiEndpoint, {
          username: this.username,
          password: this.password,
        });
        console.log("Response data:", response.data); // 打印成功响应
        this.message = response.data; // 显示成功消息
        this.isSuccess = true;

        // 如果配置了跳转路径，则跳转
        if (this.onSuccessRedirect) {
          setTimeout(() => {
            this.$router.push(this.onSuccessRedirect);
          }, 1500); // 延迟 1.5 秒后跳转
        }
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
  },
};
</script>

<style scoped>
.auth-container {
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
