<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../../assets/logo.png" alt="" />
        <span>后台测试系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu 
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 以及菜单的模板区域 -->
            <template slot="title" >
              <!-- 图标 -->
              <i class="el-icon-location"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item  :index="children.id + ''" v-for="children in item.children" :key="children.id">
              <!-- 以及菜单的模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-location"></i>
                <!-- 文本 -->
                <span>{{children.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
    data(){
        return{
            menuList:[]
        }
    },
   created(){
       this.getMenuList();
   },
  methods: {
    loginOut() {
      this.$router.push({ path: "/login" });
      window.sessionStorage.removeItem("token");
    },
    async getMenuList(){
        const {data:res} = await this.$http.get("menus");
        if(res.meta.status != 200) this.$message.error(res.meta.msg) 
        this.menuList = res.data;
        console.log(res)
    }
  },
};
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  img {
    width: 50px;
    height: 50px;
  }
  span {
    margin-left: 15px;
    // line-height: 100%;
  }
  color: white;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
 
</style>