import type { RouteRecordRaw } from "vue-router";
import Main from '@/pages/Main.vue';
const routes:Array<RouteRecordRaw>=[
    {
        path:'/home',
        name:'home',
        component:Main,
        meta:{
            title:'主页',
        }
    },
    {
    path: '/',
    redirect: '/home'
  }
]
export default routes