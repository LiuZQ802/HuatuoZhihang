// @ts-ignore
import type {Module} from 'vuex';
import AMapLoader from '@amap/amap-jsapi-loader';
import {useMessage} from "naive-ui";
const message = useMessage()
export default {
    namespaced: true,
    state: {
        Map:null,//map对象
        AMap:null,
        key:'123124bb12321dsfs213123123',
        AMapSecurityJsCode :'124233efsdsfgr3124sz',
        highlightCircle: null,
        duration:null,
        distance:null,
        restriction:null,
        routeSummary:false,
        style:null,
    },
    getters: {
    },
    mutations: {
        setMap(state:any, map:any) {
            state.Map = map
        },
        setAMap(state:any,AMap:any){
            state.AMap=AMap
        },
        setDuration(state:any,duration:any){
            state.duration=duration
        },
        setDistance(state:any,distance:any){
            state.distance=distance
        },
        setRestriction(state:any,restriction:any){
            state.restriction=restriction
        },
        setRouteSummary(state:any,routeSummary:any){
            state.routeSummary=routeSummary
        },
        setStyle(state:any,style:any){
            state.style=style
        },
    },

    actions: {
        async initializeMap({ commit ,state,dispatch,rootState}) {
            try{
                // @ts-ignore
                window._AMapSecurityConfig = {
                    securityJsCode: state.AMapSecurityJsCode
                };
                const AMap = await AMapLoader.load({
                  key: state.key,
                  version: '2.0',
                  plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar','AMap.Geolocation','AMap.Riding'] // 需要加载的插件
                });
                const map = new AMap.Map('map', {
                  center: [114.411034,30.499081],
                  zoom: 11,
                  viewMode: '2D',
                  resizeEnable: true,
                  mapStyle: 'amap://styles/normal'
                });
                map.addControl(new AMap.Scale({
                    position: 'RT'
                }));
                map.addControl(new AMap.ControlBar({ position: 'RB', showZoomBar: true, showControlButton: true }))

                map.addControl(new AMap.ToolBar({
                  position: 'LT'
                }));

                map.addControl(new AMap.Geolocation({
                    position: 'LB'
                }))

                map.on('zoomstart', () => {
                  if (state.Map?.infoWindow) {
                    state.Map.infoWindow.close();
                  }
                });
                commit('setMap', map)
                commit('setAMap',AMap)
                dispatch('addData',rootState.MapQAStore.mapData)
            }catch (e) {
                    console.error('初始化失败：', e);
            }
        },
        // @ts-ignore，设置经纬度
        setLatLon({commit,state},{latitude, longitude}){
            const [gcjLng, gcjLat] = [longitude, latitude]

            state.Map.setZoomAndCenter(
                7 ,
                [gcjLng, gcjLat],
                true
            )
        },
        pathPlan({commit,state,dispatch},{startLat,startLon,endLat,endLon,mode = 'drive' }){
            console.log(startLat,startLon,endLat,endLon)

            if (state.lastDriving) {
              state.lastDriving.clear();
              state.lastDriving = null;
            }
            if (state.routeDurationLabel) {
              state.Map.remove(state.routeDurationLabel);
              state.routeDurationLabel = null;
            }
            commit('setStyle',mode)
              let plannerPlugin = '';
              switch (mode) {
                case 'drive':
                  plannerPlugin = 'AMap.Driving';
                  break;
                case 'walk':
                  plannerPlugin = 'AMap.Walking';
                  break;
                case 'ride':
                  plannerPlugin = 'AMap.Riding';
                  break;
                case 'bus':
                  plannerPlugin = 'AMap.Transfer';
                  break;
                default:
                  console.warn('不支持的路径规划模式：' + mode);
                  return;
              }

             state.AMap.plugin(plannerPlugin, () => {
                let planner:any;

                if (mode === 'drive') {
                  planner = new state.AMap.Driving({
                    map: state.Map,
                    policy: 0
                  });
                } else if (mode === 'walk') {
                  planner = new state.AMap.Walking({ map: state.Map });
                } else if (mode === 'ride') {
                  planner = new state.AMap.Riding({ map: state.Map });
                } else if (mode === 'bus') {
                  planner = new state.AMap.Transfer({
                    map: state.Map,
                    city: '武汉',
                    nightflag: true
                  });
                }

                const start = new state.AMap.LngLat(startLat,startLon);
                const end = new state.AMap.LngLat(endLat,endLon);

                planner.search(start, end, (status: string, result: any) => {
                  if (status !== 'complete' || !result) {
                      console.warn(`[${mode}] 路径规划失败:`, result?.info || '未知错误');
                      state.AMap?.InfoWindow?.close?.(); // 可选：关闭 infoWindow
                      alert('路径规划失败，请尝试其他出行方式');
                      dispatch('clearRouteSummary')
                      return;
                  }
                  console.log(`[${mode}] 路径规划状态：`, status);
                  console.log(result);
                  const info=result.info

                     if(info==="NO_DATA"){
                         console.warn(`[${mode}] 路径规划失败:`, result?.info || '未知错误');
                          state.AMap?.InfoWindow?.close?.(); // 可选：关闭 infoWindow
                          alert('当前没有合适的方式，请尝试其他出行方式');
                          dispatch('clearRouteSummary')
                          return;
                     }
                      const route = result.routes?.[0];
                        if (route) {
                          const distance = Math.round(route.distance / 1000);
                          const duration = Math.round(route.time / 60);
                          const restriction = route.restriction === 1 ? '⚠️ 存在限行路段' : '✅ 无限行';

                          console.log(`🛣️ 路线信息：
                          - 距离：${distance} 公里
                          - 预计耗时：${duration} 分钟
                          - 限行情况：${restriction}
                          `);
                          commit('setDuration',duration)
                          commit('setRestriction',route.restriction)
                          commit('setDistance',distance)
                          commit('setRouteSummary',true)

                        }

                      state.lastDriving = planner;

                });
             });
        },
        addData({commit,state},data:any){
            if(data){
                if (state.Map._poiGroup) {
                    state.Map.remove(state.Map._poiGroup);
                    state.Map._poiGroup = null;
                }
                if (state.Map.infoWindow) {
                    state.Map.infoWindow.close();
                    state.Map.infoWindow = null;
                }

                const icon = new state.AMap.Icon({
                    image: '/icons/marker-icon-2x-green.png',
                    size: new state.AMap.Size(25, 41),
                    imageSize: new state.AMap.Size(25, 41)
                });
                const markers: state.AMap.Marker[] = [];

                data.forEach((h: any) => {
                    const lat = Number(h.latitude)
                    const lng = Number(h.longitude)
                    if (isNaN(lat) || isNaN(lng) ||
                          lat < -90 || lat > 90 ||
                          lng < -180 || lng > 180
                    ){
                        console.warn('无效经纬度，跳过：', h)
                        return
                    }
                    const position: [number, number] =  [lng,lat];
                    const marker = new state.AMap.Marker({
                      position,
                      icon,
                      title: h.name,
                      offset: new state.AMap.Pixel(-12, -41)
                    });
                    marker.on('click', () => {
                      state.Map.setZoomAndCenter(15, position, true);

                      if (state.Map.infoWindow) {
                        state.Map.infoWindow.close();
                        state.Map.infoWindow = null;
                      }

                      const popupContent = `
                      <div style="line-height:1.6">
                        <b>${h.name ?? ''}</b><br/>
                        地址：${h.address ?? ''}<br/>
                        营业时间：${h.time}<br/>
                        行政区：${h.district ?? ''}
                        ${h.legal_entity_name ? `<br/>法定代表人：${h.legal_entity_name}` : ''}
                        <br/><br/>
                        <div>
                          <span>📍 请选择出行方式：</span><br/>
                          <button onclick="handleRoute('walk', ${lng}, ${lat})">🚶 步行</button>
                          <button onclick="handleRoute('ride', ${lng}, ${lat})">🚴 骑车</button>
                          <button onclick="handleRoute('drive', ${lng}, ${lat})">🚗 驾车</button>
                          <button onclick="handleRoute('bus', ${lng}, ${lat})">🚌 公交</button>
                        </div>
                      </div>
                    `;
                      setTimeout(() => {
                        const info = new state.AMap.InfoWindow({
                          content: popupContent,
                          offset: new state.AMap.Pixel(0, -30)
                        });
                        info.open(state.Map, position);
                        state.Map.infoWindow = info;
                      }, 100);
                    });

                    markers.push(marker);

                })

                const group = new state.AMap.OverlayGroup(markers);
                state.Map.add(group);
                state.Map._poiGroup = group;

                if (markers.length > 0) {
                    state.Map.setFitView(markers, true, [40, 40, 40, 40]);
                }

            }
        },

         // @ts-ignore
        clearRouteSummary({commit}){
            commit('setDuration',null)
            commit('setRestriction',null)
            commit('setDistance',null)
            commit('setRouteSummary',false)
        },

    },
}as Module<any, any>