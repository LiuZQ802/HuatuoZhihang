import store from '@/store'

export async function getCurrentLocation(): Promise<{ lng: number; lat: number }> {
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('浏览器不支持定位'))
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true, // 尽量用 GPS/Wi-Fi
          timeout: 10000,
          maximumAge: 1000
        }
      )
    })
    let lng = pos.coords.longitude
    let lat = pos.coords.latitude

    return { lng, lat }

  } catch (e) {
 console.warn('W3C geolocation failed:', e)
  }

  const AMap = store.state.MapConfigStore.AMap
  if (!AMap) throw new Error('AMap SDK 尚未初始化，请先 commit("setAMap", AMap)')

  const result = await new Promise<{ lng: number; lat: number; accuracy?: number }>((resolve, reject) => {
    AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        convert: true,
        showButton: false,
        zoomToAccuracy: false
      })
      geolocation.getCurrentPosition((status: string, res: any) => {
        if (status === 'complete' && res?.position) {
          const out = { lng: res.position.lng, lat: res.position.lat, accuracy: res.accuracy }
          resolve(out)
        } else {
          reject(new Error(res?.message || '高德定位失败'))
        }
      })
    })
  })

  if (result.accuracy != null && result.accuracy > 2000) {
    throw new Error('只获得了低精度定位（疑似 IP），已拒绝返回以避免使用代理位置')
  }

  return { lng: result.lng, lat: result.lat }
}

function isInChina(lng: number, lat: number): boolean {
  return lng >= 73 && lng <= 135 && lat >= 18 && lat <= 54
}