import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import * as Cookies from 'js-cookie';
import { useIndexStore } from "../stores/index";
import axios from "axios";
import * as apiUrl from "../constant/index";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})


// var query = utils.getPageQuery();
var white_routes = ['/404','/about']
// console.log("query", query);
router.beforeEach(async (to, from, next) => {
  const { query } = to;
  console.log('to--->',to,'from',from,'import',location);
  const indexStore = useIndexStore();
  let { userInfo } = indexStore;
  let { title } = to.meta;
  document.title = title as string
  if (white_routes.indexOf(to.path) > -1) {
    return next();
  }
  if (!query.code){
    console.log('userInfo====>>',userInfo)
    if (userInfo) {
      if (white_routes.indexOf(to.path) > -1) {
        return next();
      }
     return next();
    }
    
    const result:{data:any} = await axios.post(apiUrl.GET_OAUTH_LINK, {
      redirect: encodeURIComponent(location.origin),
      hash:location.pathname,
    });
    const res:{error:number,data:any} = result.data;
    console.log('我执行到这里了1',res)
    // "http://admin2.eryicaier.com/commonapi/wechatHandler/wechatOAuth?redirect_uri=http%3A%2F%2Flocalhost%3A1033%2F&scope=snsapi_userinfo&hash=%23%2F"
    if(res.error==0){
      console.log('我执行到这里了2',res.data.url)
      if (res.data.code==302){
        console.log('我执行到这里了',res.data.url)
        location.href = res.data.url;
      }else{
        userInfo=res.data.userInfo
        if (white_routes.indexOf(to.path) > -1) {
          return next();
        }
        next();
      } 
    }else{
      // Toast.fail(res.message);
    }
  }else{
    if (userInfo){
      if (white_routes.indexOf(to.path) > -1) {
        return next();
      }
      next();
    }else{
      var res:{error:number,data:any} = await axios.post(apiUrl.LOGIN_BY_CODE, {
        code: query.code
      });
      if (res.error==405){
          setTimeout(()=>{
            return location.href = location.pathname + location.hash
          },1000)
          return;
      }
      if (res.error != 0) {
        // Toast.fail(res.message);
        next({path:"/403"});
      }else{
        if(res.data.token){
          Cookies.set("usertoken", res.data.token);
        }
        userInfo=res.data;
        if (white_routes.indexOf(to.path) > -1) {
          return next();
        }
        // if(!userInfo.user_info_id){
        //   return next({path:"/login"});
        // }
        next();
      }
      console.log('res',res);
    }
  }

});

export default router
