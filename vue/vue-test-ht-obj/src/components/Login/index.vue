<template>
  <div class="login-container">
    <!-- 当前头像框 -->
    <div class="login_box">
      <div class="avater_box">
        <img src="../../assets/logo.png" />
      </div>
      <el-form
        class="login-form"
        :rules="loginFormRules"
        ref="loginFormRef"
        :model="loginForm"
      >
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user-solid"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-key"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="bts">
          <el-button type="primary" @click="login">登入</el-button>
          <el-button type="info" @click="loginFormReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 登入页面  -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456",
      },
      loginFormRules: {
        username: [
          { required: true, message: "请输入账号", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    loginFormReset() {
      this.$refs.loginFormRef.resetFields();
      console.log(this);
    },
    login() {
      // this.$refs.loginFormRef.validate(bool=>{
      //     // console.log('------:',arguments)
      //     if(!bool){
      //         return;
      //     }
      //     console.log('------')
      //     this.$http.post('login',this.loginForm).then((res)=>{
      //         console.log('res:',res)
      //     })
      //     // console.log(res)
      // })
      this.$refs.loginFormRef.validate(async (bool) => {
     
        if (!bool) {
          return;
        }
        console.log("------");
        const {data:res} = await this.$http.post("login", this.loginForm)
        if(res.meta.status != 200) this.$message.error(res.meta.msg) 
        console.log('res:',res)
        this.$message.success(res.meta.msg);
        window.sessionStorage.setItem('token',res.data.token)
        // this.$message.success()
        this.$router.push({
            path:"/home"
        })
      });
    },
  },
};
</script>
<style lang="less" scoped>
.login-container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: white;
  border-radius: 3px;
  // margin: 50% auto;
  position: absolute;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;

  .avater_box {
    height: 130px;
    width: 130px;
    border-radius: 50%;
    padding: 10px;
    border: 1px solid #eeeeee;
    box-shadow: 0 0 10px #dddddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eeeeee;
    }
  }
  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .bts {
    display: flex;
    justify-content: flex-end;
  }
}
</style>