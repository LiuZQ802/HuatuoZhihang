/**
 * ajax请求函数模块
 * 返回值：promise对象(异步返回的数据锁：response.data)
 */
import axios from 'axios'
//这两个值好像默认就是这样了，所以不重要，重点是最后一个设置
axios.defaults.xsrfCookieName = 'csrfmiddlewaretoken'
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'
//重点！！！设置请求获取cookie
axios.defaults.withCredentials = true
//设置请求头
// axios.defaults.headers.post['Content-Type'] = "application/json"

// http request 拦截器
axios.interceptors.request.use(
    config => {
      let token = localStorage.getItem('TOKEN')
      if (token) {
        config.headers.Authorization = token
      }

      return config;
    }
  );
const configs = {
    headers:{
        'Content-Type':'application/json'
    }
  };
export default function ajax(url: string,data={},type='GET',signal?: AbortSignal,config=configs){
    return new Promise(function(resolve,reject){
        let promise;
        const requestConfig: AxiosRequestConfig = { ...config, signal };
        //执行异步ajax请求
        if(type==='GET'){
            //准备url query参数数据
            let dataStr=''  //数据拼接字符串
            Object.keys(data).forEach(key=>{
                dataStr+=key+'='+(data as any)[key]+'&'
            })
            if(dataStr!==''){
                dataStr=dataStr.substring(0,dataStr.lastIndexOf('&'))
                url=url+'?'+dataStr
            }
            //发送get请求
            promise=axios.get(url,config=requestConfig)
        }else if(type==='DELETE'){
            //准备url query参数数据
            let dataStr=''  //数据拼接字符串
            Object.keys(data).forEach(key=>{
                dataStr+=key+'='+(data as any)[key]+'&'
            })
            if(dataStr!==''){
                dataStr=dataStr.substring(0,dataStr.lastIndexOf('&'))
                url=url+'?'+dataStr
            }
            promise=axios.delete(url,config=requestConfig)
        }else if(type==='PATCH'){
            promise=axios.patch(url,data,config=requestConfig)
        }else if(type==='PUT'){
            promise=axios.put(url,data,config=requestConfig)
        }else{
            //发生post请求
            promise=axios.post(url,data,config=requestConfig)
        }
        //成功了调用resolve()
        promise.then(function(response){
            resolve(response)
        }).catch(function(error){
            //失败了调用reject()
            reject(error)
        })

    })
}