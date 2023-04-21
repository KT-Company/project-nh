
import * as Bol3D from './Bol3d.js'
import * as Cesium from 'cesium'
import "cesium/Source/Widgets/widgets.css";
import CesiumThree from './cesiumThree';
import Move from './move';
import request from '../2d/api/request';
import ws from './websocket.js';
import {updateUserInfo} from '../2d/api'

import './asset/main.less'
import axios from 'axios';
import { fa } from 'element-plus/es/locale/index.js';

const PRO_ENV = './3dmodules';
const canvas = document.createElement('canvas');
document.body.style.width = '100vw';
document.body.style.height = '100vh';
document.body.style.overflow = 'hidden';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.position = 'absolute';
canvas.style.top = '0px';
canvas.style.left = '0px';
canvas.style.zIndex = '3';
canvas.style.pointerEvents = 'none';
document.body.append(canvas);
const cesiumDom = document.createElement('div');
cesiumDom.style.width = '100%';
cesiumDom.style.height = '100%';
cesiumDom.style.position = 'absolute';
cesiumDom.style.top = '0px';
cesiumDom.style.left = '0px';
cesiumDom.style.zIndex = '2';
document.body.append(cesiumDom);

const creditDom = document.createElement('div');
document.body.append(cesiumDom);
const sceneModel: any = {},
  searchModel: any = {},
  // 机位点
  placement: any = [
    [118.84537924595591, 31.729415476482384],
    [118.84571866651139, 31.72895847309768],
    [118.84605620948598, 31.72850069891331],
    [118.8464083907358, 31.728023561672895],
    [118.84667901569593, 31.727656804748282],
    [118.8469492872874, 31.727290041091265],
    [118.84722054293411, 31.726923198803103],
    [118.84749111820882, 31.726555996031934]
  ],
  xzList: any[] = [];
let focusModel: any,
  PopupClickCallback: Function|null = null,
  wranBtnClick: Function|null = null;
const container: any = new CesiumThree({
  container: cesiumDom,
  minWGS84: [118.345544, 31.227505],
  maxWGS84: [119.345544, 32.227505],
  camera: {
    destination: [118.84241372564283, 31.73113275521421, 1006],
    heading: 147.5345894894121,
    pitch: -65.33366237306274,
    roll: 0.001012108706811133
  }
}, {
  renderer: {
    alpha: true
  },
  publicPath: PRO_ENV, // 基础路径
  container: canvas, // 控制元素
  viewState: 'orbit', // 视角（第三人称），'firstPerson'(第一人称)
  cameras: {
    orbitCamera: {
      position: [369, 193, 404],
      near: 0.1, // 视锥体近截面
      far: 10 * 1000 * 1000, // 视锥体远截面
      fov: 45 // 垂直视野角度
    }
  },
  controls: {
    orbitControls: {
      enabled: false
    }
  },
  lights: {
    directionLights: [{
      color: 0xffdcb2, // 颜色
      intensity: 1.8,  // 强度
      position: [-2619122, 4761192, 3334710], // 位置
      mapSize: [2048, 2048], // 阴影贴图宽高
      near: 100,  // 生成阴影深度图的相机参数
      far: 10000, // 生成阴影深度图的相机参数
      bias: -0.0004, // 生产阴影贴图的偏移(解决马赫带效应)
      distance: 500, // 生成阴影深度图的相机参数
      target: [-2619708, 4756272, 3334769] // target
    }],
    // 环境光
    ambientLight: {
      color: 0xffffff,
      intensity: 0.8,
    },
  },
  gammaEnabled: true, // 默认为开启，关闭后factor不生效
  gamma: {
    factor: 2.2 // gamma校正，默认开启参数为2.2
  },
  // msaa: {
  //     supersampling: true // 开启后可减缓bloom造成的锯齿，相应会带来更多性能消耗
  // },
  enableShadow: true, //开启/关闭阴影
  dofEnabled: false, // 需要开启
  dof: {
    focus: 100.0, // 模拟相机焦距
    aperture: 0.025, // 模糊系数1
    maxblur: 0.01 // 模糊系数2
  },
  nodePassEnabled: false, // 默认为关闭，关闭后nodePass 不生效
  nodePass: {
    hue: 6.3, // 色调
    sataturation: 1.2, // 饱和度
    vibrance: 0, //
    brightness: -0.01, // 亮度
    contrast: 0.9, //  对比度
  },
  bloomEnabled: false, // 需要开启，默认为false
  bloom: {
    bloomStrength: 1.5, // 强度
    threshold: 0.5, // 阈值
    bloomRadius: 1, // 半径
  },
  toneMapping: {// 色调映射
    toneMappingExposure: 1,
    toneMappingType: 'LinearToneMapping' // 'NoToneMapping' | 'ReinhardToneMapping' | 'CineonToneMapping' | 'ACESFilmicToneMapping'
  },
  // ssaaEnabled: false, // 需要开启参数
  // ssaa: {
  //     level: 1, // 抗锯齿等级
  //     unbiased: true
  // },
  outlineEnabled: false, // 需要开启该参数
  outline: {
    edgeStrength: 2,
    edgeGlow: 0,
    edgeThickness: 1,
    pulsePeriod: 0,
    visibleEdgeColor: '#98e10f',
    hiddenEdgeColor: '#190a05'
  },
  bounds: {
    radius: 5000,
    center: [0, 0, 0]
  },
  hdrUrls: ["/textures/6.hdr"],
  stats: false,
  loadingBar: {
    type: '10',
    show: false
  },
  modelUrls: [
    '/glb/wj.glb', // 机坪
    '/glb/757.glb',
    '/glb/400.glb',
    '/glb/757wk.glb',
    '/glb/400k.glb',
    '/glb/qyc.glb', // 飞机牵引车
    '/glb/jyc.glb',
    '/glb/wsc.glb', // 污水车
    '/glb/sjptc_ct.glb', // 升降平台车
    '/glb/sjptc_cw.glb', // 升降平台车
    '/glb/gbc.glb', // 货架车
    '/glb/hwqyc.glb', // 货物牵引车
    '/glb/cbc.glb', // 除冰车
    '/glb/csdc.glb', // 传送带车
    '/glb/gzt.glb', // 工作台
    '/glb/757gzt.glb', // 757工作台
    '/glb/lundang.glb', // 轮挡
    '/glb/x1.glb', // 箱子
    '/glb/x2.glb', // 箱子
    '/glb/x3.glb', // 箱子
    '/glb/x4.glb', // 箱子
    '/glb/x5.glb', // 箱子
    '/glb/x6.glb', // 箱子
    '/glb/sh1.glb', // 散货
    '/glb/sh2.glb', // 散货
    '/glb/sh3.glb', // 散货
    '/glb/jzx1.glb', // 集装箱
    '/glb/jzx2.glb', // 集装箱
    '/glb/jzx3.glb', // 集装箱
  ],
  onProgress(scene: any) {
    const object3d: any = {
      threeGroud: scene,
      wgs84: null,
      rotation: 0
    }
    if (scene.name == 'wj') {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material.roughness = 50
        }
      })
      const popup: any = new Bol3D.POI.Popup3D({
        value: `<div style="margin:0;color: #ffffff;margin-left: 20px;">编号：A22336</div>`,
        position: [0, 0, 0],
        className: 'popup2',
        scale: [1, 1, 1],
        closeVisible: 'visible'
      })
      popup.position.set(0, 0, 0);
      scene.add(popup)
    } else if (scene.name == '757') {
      scene.children.forEach((child: any) => {
        if (child.name == 'jccm') {
          child.rotation.z = 0
        }
        if (child.name == '对象350' || child.name == "jc") {
          child.visible = false
        }
        if (child.name == 'qcm') {
          child.rotation.y = Math.PI
        }
        if (child.name == 'cm08') {
          child.rotation.z = 0
        }
        if (child.name == '对象358' || child.name == '对象357') {
          // child.rotation.y = Math.PI
          child.visible = false
        }
      })
    } else if (scene.name == '400') {
      scene.children.forEach((child: any) => {
        if (child.name == "400jczu") {
          child.visible = false
        }
      })
    } else if (scene.name == '757wk') {
      const positionList = [
        {
          wgs84: [118.841414, 31.722966],
        }, {
          wgs84: [118.842231, 31.723406],
        }, {
          wgs84: [118.843049, 31.723847],
        }, {
          wgs84: [118.844000, 31.724359],
        }, {
          wgs84: [118.844857, 31.724821],
        }, {
          wgs84: [118.845841, 31.725351],
        }]
      for (let i = 0; i < positionList.length; i++) {
        const sceneI = scene.clone();
        const object3d: any = {
          threeGroud: sceneI,
          wgs84: positionList[i].wgs84
        }
        container.object3d.push(object3d);
        container.three.attach(sceneI)
      }
      object3d.wgs84 = [118.846699, 31.725814];
    } else if (scene.name == '400k') {
      const positionList = [{
        wgs84: [118.839934, 31.726869],
      }, {
        wgs84: [118.840647, 31.727254],
      }, {
        wgs84: [118.841361, 31.727638],
      }, {
        wgs84: [118.842120, 31.728047],
      }, {
        wgs84: [118.842834, 31.728432],
      }, {
        wgs84: [118.843593, 31.728841],
      }]
      for (let i = 0; i < positionList.length; i++) {
        const sceneI = scene.clone();
        const object3d: any = {
          threeGroud: sceneI,
          wgs84: positionList[i].wgs84
        }
        container.object3d.push(object3d);
        container.three.attach(sceneI)
      }
      object3d.wgs84 = [118.844306, 31.729226]
    } else if (scene.name == 'qyc') {
      object3d.rotation = 180
      object3d.wgs84 = [118.839511, 31.725687]
    } else if (scene.name == 'jyc') {
      object3d.rotation = 180
      object3d.wgs84 = [118.839584, 31.725590]
    } else if (scene.name == 'wsc') {
      object3d.rotation = -90
      object3d.wgs84 = [118.839651, 31.725495]
    } else if (scene.name == 'gbc') {
      object3d.rotation = 180
      object3d.wgs84 = [118.839722, 31.725397]
    } else if (scene.name == 'hwqyc') {
      object3d.rotation = 180
      object3d.wgs84 = [118.839791, 31.725304]
    } else if (scene.name == 'cbc') {
      object3d.rotation = 180
      object3d.wgs84 = [118.839865, 31.725208]
    } else if (scene.name == 'csdc') {
      object3d.rotation = 180
      object3d.wgs84 = [118.839931, 31.725114]
    } else if (scene.name == 'gzt' || scene.name == '757gzt') {
      // const arr: number[][] = [
      //   [118.845249,31.729033],
      //   [69, -0, -37],
      //   [69, -0, 80],
      //   [69, -0, 127],
      //   [69, -0, 175],
      //   [69, -0, 223]
      // ]
      // for (let i = 0; i < 5; i++) {
      //   const gzt = scene.clone();
      //   container.object3d.push(gzt);
      //   const [x, y, z] = arr[i]
      //   gzt.userData.name = gzt.name + i;
      //   sceneModel[gzt.userData.name] = gzt;
      //   if (gzt.name == 'gzt') gzt.userData.position = new Bol3D.Vector3(x, y, z + 5);
      //   else gzt.userData.position = new Bol3D.Vector3(x, y, z)
      //   container.three.attach(gzt)
      // }
      // const [x, y, z] = arr[5];
      // scene.userData.name = scene.name + 5;
      // sceneModel[scene.userData.name] = scene;
      // if (scene.name == 'gzt') scene.userData.position = new Bol3D.Vector3(x, y, z + 5);
      // else scene.userData.position = new Bol3D.Vector3(x, y, z)
    } else if (scene.name == 'sjptc_ct') {
      object3d.rotation = 180
      object3d.wgs84 = [118.84002115551257, 31.725000940395066]
    } else if (/^x\d/.test(scene.name)) {
      xzList.push(scene)
    }

    const showModel = ['wj', '757wk', '400k', 'qyc', 'jyc', 'wsc', 'sjptc_ct', 'sjptc_cw', 'gbc', 'hwqyc', 'cbc', 'csdc'];
    if (!showModel.includes(scene.name)) {
      scene.visible = false;
    } else if (scene.name != 'sjptc_cw') container.object3d.push(object3d);
    const noOp = ['wj', '757wk', '400k', 'gzt', '757gzt']
    if (!noOp.includes(scene.name)) {
      sceneModel[scene.name] = object3d;
    }
  },
  onLoad() {
    sceneModel['sjptc_ct'] && sceneModel['sjptc_ct'].threeGroud.add(sceneModel['sjptc_cw'].threeGroud)
    container.three.renderer.logarithmicDepthBuffer = false;
    container.three.clickObjects = []
    // sceneModel['400'].wgs84 = placement[0]
    // sceneModel['400'].threeGroud.visible = true;
    // sceneModel['400'].rotation = -90;
    // container.object3d.push(sceneModel['400'])
    // sceneModel['757'].wgs84 = placement[1]
    // sceneModel['757'].threeGroud.visible = true;
    // sceneModel['757'].rotation = 90;
    // container.object3d.push(sceneModel['757'])
    // sceneModel['clone'] = {
    //   wgs84: placement[1],
    //   threeGroud: sceneModel['400'].threeGroud.clone(),
    //   rotation: 90
    // }
    // sceneModel['clone'].threeGroud.visible = true;
    // container.three.attach(sceneModel['clone'].threeGroud)
    // container.object3d.push(sceneModel['clone'])
    
  }
});
(window as any).container = container;

// 输出相机参数
(window as any).outPoint = function () {
  const { heading, pitch, roll, positionCartographic } = container.viewer.camera;
  console.log({
    heading: Cesium.Math.toDegrees(heading),
    pitch: Cesium.Math.toDegrees(pitch),
    roll: Cesium.Math.toDegrees(roll),
    cartographic: [Cesium.Math.toDegrees(positionCartographic.longitude), Cesium.Math.toDegrees(positionCartographic.latitude), positionCartographic.height],
  });
}
// let open = true
// 绑定点击事件
container.addEventListener('click', function (res: any) {
  console.log(res);
  
  const {object} = res?.threeObj ?? {}
  console.log(object); 
  const { longitude, latitude } = res.cartographic;
  console.log(longitude + ', ' + latitude);

  if(res?.threeObj?.object?.isSprite) {
    const parent = res?.threeObj?.object.parent
    if(parent.name == '757' || parent.name == '400') {
      if(PopupClickCallback) PopupClickCallback(parent?.userData?.flightNumber)
    }
    if(object.userData.workNumber) {
      if(res.threeObj.uv.x > 0.06 && res.threeObj.uv.y > .12 && res.threeObj.uv.x < .36 && res.threeObj.uv.y < .3) {
        console.log(object.userData.workNumber);
        
        updateUserInfo(object.userData.workNumber,(data:any) => {
          object.userData.popup.initFillText({
            '姓名': data.name,
            '工号': data.worknumber,
            "工种": data.typework,
            '任务类型': object.userData.type,
          },data.isNotAlarm)
          object.userData.popup.completa = () => {
            ;(object.userData.popup.sprite as any).position.set(0, 0, 2)
            parent.add(object.userData.popup.sprite)
          }
        })
      }
    }
  }

  // openHCCM(sceneModel['clone'].threeGroud,open)
  // open = !open
})

class Popup {
  canvasContext: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  width: number = 200;
  height: number = 0;
  texture: Bol3D.CanvasTexture | null = null;
  sprite: Bol3D.Sprite | null = null;
  spriteMat: Bol3D.SpriteMaterial | null = null;
  completa: Function | null = null;
  prop: any;
  constructor(prop: any,isNotAlarm:String | number = 0) {
    this.prop = prop;
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width;
    this.height = this.canvas.height = Object.keys(prop).length * 24 + 20;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvasContext = this.canvas.getContext('2d');
    this.initFillText(prop,isNotAlarm)
  }
  async initFillText(prop: any,isNotAlarm:String | number = 0) {
    if (this.sprite) {
      this.sprite.removeFromParent();
      container.three.clickObjects = container.three.clickObjects.filter((item:any) => item !== this.sprite)
    }
    if (this.spriteMat) this.spriteMat.dispose();
    if (this.texture) this.texture.dispose();
    ; (this.canvas as HTMLCanvasElement).width = this.width;
    this.height = (this.canvas as HTMLCanvasElement).height = Object.keys(prop).length * 24 + 20 + (isNotAlarm == '1' ? 40 : 0);
    ; (this.canvas as HTMLCanvasElement).style.width = this.width + 'px';
    ; (this.canvas as HTMLCanvasElement).style.height = this.height + 'px';
    let index = 0;
    ; (this.canvasContext as CanvasRenderingContext2D).clearRect(0, 0, this.width, this.height)
    // ;(this.canvasContext as CanvasRenderingContext2D).fillStyle = 'rgba(51, 51, 51, .9)';
    // ;(this.canvasContext as CanvasRenderingContext2D).fillRect(0,0,this.width,this.height)
    // ;(this.canvasContext as CanvasRenderingContext2D).strokeStyle = 'rgba(51, 51, 51, 1)';
    // ;(this.canvasContext as CanvasRenderingContext2D).strokeRect(0,0,this.width,this.height)
    // ;(this.canvasContext as CanvasRenderingContext2D).stroke();
    const img: any = await this.loadImg(isNotAlarm == '1' ? './imgs/popup-red.png' : './imgs/popup.png');
    ; (this.canvasContext as CanvasRenderingContext2D).drawImage(img, 0, 0, this.width, this.height)
    for (const key in prop) {
      ; (this.canvasContext as CanvasRenderingContext2D).font = '16px sans-serif';
      ; (this.canvasContext as CanvasRenderingContext2D).fillStyle = '#ffffff'
        ; (this.canvasContext as CanvasRenderingContext2D).fillText(`${key}：${prop[key]}`, 10, index * 24 + 30)
      index++
    }
    if(isNotAlarm == '1'){
      const img2:any = await this.loadImg('./imgs/popup-btn.png')
      ; (this.canvasContext as CanvasRenderingContext2D).drawImage(img2, 10, (index - 1) * 24 + 40, 67, 31)
    }

    // document.body.appendChild(this.canvas as HTMLCanvasElement)
    this.texture = new Bol3D.CanvasTexture(this.canvas);
    this.texture.encoding = Bol3D.sRGBEncoding;
    this.spriteMat = new Bol3D.SpriteMaterial({
      map: this.texture,
      color: 0xffffff,
      transparent: true,
      sizeAttenuation: true,
      fog: false
    });
    this.sprite = new Bol3D.Sprite(this.spriteMat);
    (this.sprite as any).scale.set(3, this.height / this.width * 3, 3)
    if(isNotAlarm == '1' && prop['工号']) {
      ;(this.sprite as any).userData.workNumber = prop['工号']
      ;(this.sprite as any).userData.type = prop['任务类型']
      ;(this.sprite as any).userData.popup = this
    }
    container.three.clickObjects.push(this.sprite);
    if (this.completa) this.completa()
  }
  async loadImg(url: string) {
    const img = document.createElement('img');
    img.src = url;
    return new Promise((resolve, reject) => {
      img.onload = function () {
        resolve(img)
      }
    })
  }
}

// 设置模型位置
function mToP(model: any, wgs84: number[]) {
  const minRotation: any = {
    '400': -142.5,//-135
    '757': 37.5,//45
    'csdc': -53, // -45
    'jyc': -53,
    'qyc': -53,
    'sjptc_ct': -53,
    'hwqyc': -53,
    'wsc': 37.5 // 45
  }
  const minRotation2: any = {
    '400': -132.5,//-135
    '757': 47,//45
    'csdc': -43, // -45
    'jyc': -43,
    'qyc': -43,
    'sjptc_ct': -43,
    'hwqyc': -43,
    'wsc': 47 // 45
  }
  const point = Cesium.Cartesian3.fromDegrees(wgs84[0], wgs84[1]);
  const { position } = model.threeGroud;
  const resPoint = new Bol3D.Vector3(point.x, point.y, point.z).sub(position)
  const rotation = new Bol3D.Vector3(1, 0, 0).angleTo(resPoint) * 180 / Math.PI
  model.rotation = resPoint.z < 0 ? rotation + minRotation[model.threeGroud.name] : - rotation + minRotation2[model.threeGroud.name];
  model.wgs84 = wgs84
}
// websocket 接收指令
ws.addEventListener('message', function (res: any) {
  console.log('ws==>',res);
  let data = res.data
  if (typeof data == 'string') data = JSON.parse(data);
  data = data.data;
  if (data) {
    switch (data.type) {
      case '货物牵引车':
        hwqycAnimation(data)
        break;
      case '传送带车':
        csdcAnimation(data)
        break;
      case '升降平台车':
        sjptcAnimation(data)
        break;
      case '污水车':
        wscAnimation(data)
        break;
      case '加油车':
        jycAnimation(data)
        break;
      case '航空器牵引车':
        qycAnimation(data)
        break;
      case '飞机':
        fjAnimation(data)
        break;
    }
  }
})


// 拷贝模型
function modelClone(model: any): any {
  const model1 = Bol3D.SkeletonUtils.clone(model);
  model1.traverse((child: any) => {
    if (child.isMesh) container.three.clickObjects.push(child)
  })
  model1.visible = true;
  container.three.attach(model1);
  return model1
}

// 添加设备车
const addEquipment = function (data: any, type: string) {
  let gltf: any;
  if (type == 'hwqyc') {
    let hjc = hjToQyc(data.gbCars.length);
    gltf = hwToHj(hjc, data.task.includes('散货') ? 'sh' : 'jzx1');
    if (data.task.includes('卸货')) {
      gltf.traverse((child: any) => {
        if (child.userData.name == 'xz') {
          child.visible = false
        }
      })
    }
    if(!data.task.includes('散货')) {
      const box:any = new Bol3D.Object3D();
      box.position.set(-3.9,0,0)
      gltf.add(box)
      gltf.userData.box = box;
    }
    gltf.userData.goodsnumber = []
    data.gbCars.forEach((item: any) => {
      if (item.goodsnumber) gltf.userData.goodsnumber.push(item.goodsnumber)
    })
  } else gltf = modelClone(sceneModel[type].threeGroud);
  let xjArr = ['前往指定位置', '撤离',]
  const popup = new Popup({
    '车牌号': data.cargo.licensePlate,
    '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
    '类型': data.cargo.type,
  })
  if (type != 'hwqyc') {
    const icon: any = new Bol3D.POI.Icon({
      publicPath: './imgs',
      url: '/ren.png',
      position: [4, 4, 3]
    })
    icon.visible = false;
    gltf.userData.icon = icon;
    gltf.add(icon)
  }
  popup.completa = function () {
    ; (popup.sprite as any).position.set(0, 0, 4)
    gltf.add(popup.sprite)
  }
  gltf.userData.popup = popup
  gltf.userData.type = data.type;
  gltf.userData.licensePlate = data.licensePlate;
  gltf.userData.task = data.task;
  const model = {
    ip: data.licensePlate,
    threeGroud: gltf,
    wgs84: [data.longitude, data.latitude],
    rotation: 0
  }
  searchModel[data.licensePlate] = gltf;
  container.object3d.push(model)
  container.three.attach(gltf)
  return model
}
// 添加飞机
const addFj = function (data: any) {
  const gltf = sceneModel[Math.random() > .1 ? '757' : '400'].threeGroud.clone();
  gltf.userData.flightNumber = data.actualflightreservation || data.flightNumber;
  gltf.userData.goodsnumber = data.goodsNumber;
  gltf.visible = true;
  const model = {
    ip: data.flightNumber,
    threeGroud: gltf,
    wgs84: [data.longitude, data.latitude],
    rotation: gltf.name == '757' ? 90 : -90
  }
  searchModel[data.flightNumber] = gltf;
  let info: any = {
    '航班号': data.suspensionFJ.flightNo,
    '机型': data.suspensionFJ.models
  }
  if (data.instruction == '滑行') {
    info['机位号'] = data.suspensionFJ.targetReservation
  } else if (data.instruction == '入位') {
    info['机位号'] = data.suspensionFJ?.reservationNo || data.suspensionFJ.targetReservation

  } else {
    info['保障节点'] = data.suspensionFJ.bzjd.security
  }
  const popup = new Popup(info)
  popup.completa = function () {
    ; (popup.sprite as any).position.set(0, 0, 7)
    model.threeGroud.add(popup.sprite)
  }
  model.threeGroud.userData.popup = popup
  container.object3d.push(model)
  container.three.attach(gltf)
  return model
}
function getPoints(point: number[][]) {
  let points: any[] = [];
  for (let i = 0; i < point.length - 1; i++) {
    const arr = getList([Cesium.Cartesian3.fromDegrees(point[i][0], point[i][1]), Cesium.Cartesian3.fromDegrees(point[i + 1][0], point[i + 1][1])])
    if (i > 0) {
      arr.shift()
    }
    points = points.concat(arr)
  }
  function getList(controls: any) {
    var spline = Cesium.HermiteSpline.createNaturalCubic({
      times: [0.0, 1],
      points: controls,
    });
    let distance = Cesium.Cartesian3.distance(controls[0], controls[1]);
    distance = Math.floor(distance)
    if(distance < 30) distance = 30
    distance *= 1.5
    const positions = [];
    if (distance > 0) for (var i = 0; i <= distance; i++) {
      var cartesian3 = spline.evaluate(i / distance);
      const { longitude, latitude } = container.getCartographic(cartesian3)
      positions.push([longitude, latitude]);
    }
    return positions
  }
  return points
}


function modelMove(model: any, points: any[]) {
  let index = 0;
  function loop() {
    if (index < points.length) {
      requestAnimationFrame(loop)
      mToP(model, points[index])
      index++
    }
  }
  loop()
}
function fjAnimation(data: any) {
  let index = container.object3d.findIndex((item: any) => item.ip == data.flightNumber);

  if (index == -1) {
    index = container.object3d.length;
    addFj(data)
  }
  let fj = container.object3d[index]
  switch (data.instruction) {
    case '滑行':
      modelMove(fj, getPoints(JSON.parse(data.endPoints)))
      break;
    case '进港':
      modelMove(fj, getPoints(JSON.parse(data.startPoints)))
      break;
    case '入位':
      fj.wgs84 = placement[Number(data.suspensionFJ.reservationNo || data.suspensionFJ.targetReservation) - 1]
      if (fj.threeGroud.name == '400') fj.rotation = -90;
      else fj.rotation = 90;
      break;
    case '开启货舱门':
      openJCCM(fj.threeGroud, true)
      openHCCM(fj.threeGroud, true)
      break;
    case '关闭货舱门':
      openJCCM(fj.threeGroud, false)
      openHCCM(fj.threeGroud, false)
      break;
    case '起飞':
      modeDelete(fj.threeGroud);
      if (searchModel[fj.ip]) delete searchModel[fj.ip]
      container.object3d = container.object3d.filter((item:any) => item !== fj)
      break;
  }
}
function hwqycAnimation(data: any) {
  let index = container.object3d.findIndex((item: any) => item.ip == data.licensePlate);
  let fj = container.object3d.find((item: any) => item.ip == data.flightNumber);
  if (!fj) return;
  // if (!fj) fj = await addFj(data);
  if (index == -1) {
    index = container.object3d.length;
    addEquipment(data, 'hwqyc');
    // if (data.instruction == '前往指定位置' || data.instruction == '撤离') return;
  }
  let model = container.object3d[index];
  let xjArr = ['前往指定位置', '撤离']

  if (!model.threeGroud.userData.popup) {
    const popup = new Popup({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    popup.completa = function () {
      ; (popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(popup.sprite)
    }
    model.threeGroud.userData.popup = popup
  } else {
    model.threeGroud.userData.popup.initFillText({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    model.threeGroud.userData.popup.completa = function () {
      ; (model.threeGroud.userData.popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(model.threeGroud.userData.popup.sprite)
    }
  }
  switch (data.instruction) {
    case '撤离':
      modelMove(model, getPoints(JSON.parse(data.endPoints)))
      break;
    case '前往指定位置':
      modelMove(model, getPoints(JSON.parse(data.startPoints)))

      // mToP(model, [data.longitude, data.latitude])
      break;
    case '到达指定位置':
      if (true) {
        let point = [-16.2, 18.5, 0];
        let rotate = 0;
        if (data.task.includes('散货')) {
          point = [12, 0, 0];
        }
        if (fj.threeGroud.name == '400') {
          point = [16, -19.5, 0];
          if (data.task.includes('散货')) {
            point = [-13, -5, 0];
          }
        }
        const position = new Bol3D.Vector3();
        const mesh: any = new Bol3D.Object3D();
        mesh.position.set(...point)
        fj.threeGroud.add(mesh)
        mesh.getWorldPosition(position)
        let graphic = container.getCartographic(position);
        model.rotation = rotate
        model.wgs84 = [graphic.longitude, graphic.latitude];
        fj.threeGroud.userData[data.task.includes('散货') ? 'shhwc' : 'jzxhwc'] = model
        mesh.removeFromParent()
      }
      break;
    case '对接':
      break;
    case '撤离至制定位置':
      modeDelete(model.threeGroud)
      if (searchModel[model.ip]) delete searchModel[model.ip]
      container.object3d = container.object3d.filter((item:any) => item !== model)
      break;
  }
}
function csdcAnimation(data: any) {
  let index = container.object3d.findIndex((item: any) => item.ip == data.licensePlate);
  let fj = container.object3d.find((item: any) => item.ip == data.flightNumber);
  if (!fj) return;
  // if (!fj) fj = addFj(data);
  if (index == -1) {
    index = container.object3d.length;
    addEquipment(data, 'csdc');
    // if (data.instruction == '前往指定位置' || data.instruction == '撤离') return;
  }
  let model = container.object3d[index];
  let xjArr = ['前往指定位置', '升降车平台撤离指令']
  if (!model.threeGroud.userData.popup) {
    const popup = new Popup({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    popup.completa = function () {
      ; (popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(popup.sprite)
    }
    model.threeGroud.userData.popup = popup
  } else {
    model.threeGroud.userData.popup.initFillText({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    model.threeGroud.userData.popup.completa = function () {
      ; (model.threeGroud.userData.popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(model.threeGroud.userData.popup.sprite)
    }
  }
  switch (data.instruction) {
    case '前往指定位置':
      modelMove(model, getPoints(JSON.parse(data.startPoints)))
      break;
    case '升降车平台撤离指令':
      modelMove(model, getPoints(JSON.parse(data.endPoints)))
      break;
    case '到达指定位置':
      if (true) {
        let point = [5.2, -7.5, 0]
        let rotate = 90;
        if (fj.threeGroud.name == '400') {
          point = [-6, 2.3, 0]
        }
        if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.visible = true;
        request.get(`/getPersonnel?plateNumber=${data.cargo.licensePlate}`).then((info: any) => {
          const popup2 = new Popup({
            '姓名': info.data.name,
            '工号': info.data.workNumber,
            "工种": info.data.typeWork,
            '任务类型': data.task,
          },data.isNotAlarm)
          popup2.completa = function () {
            ;(popup2.sprite as any).position.set(0, 0, 2)
            model.threeGroud.userData.icon.add(popup2.sprite)
          }
        })
        const position = new Bol3D.Vector3()
        const mesh: any = new Bol3D.Object3D();
        mesh.position.set(...point)
        fj.threeGroud.add(mesh)
        mesh.getWorldPosition(position)
        let graphic = container.getCartographic(position);
        model.rotation = rotate
        model.wgs84 = [graphic.longitude, graphic.latitude];
        mesh.removeFromParent()
      }
      break;
    case '对接':
      break;
    case '传送带启动':
      csdMove(fj.threeGroud, model.threeGroud)
      break;
    case '传送带车传送货物至滚棒车（散货）指令':
      csdOutfj(model.threeGroud, fj.threeGroud?.userData?.shhwc?.threeGroud)
      break;
    case '传送货物至货舱':
      csdInfj(model.threeGroud, fj.threeGroud?.userData?.shhwc?.threeGroud)
      break;
    case '传送完成':
    case '传送完成 关闭传送带':
      model.threeGroud.userData.running = false;
      setTimeout(() => {
        equipmentReverseMove(model.threeGroud)
      }, 5000)
      if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.removeFromParent()
      break;
    case '撤离至指定位置':
      modeDelete(model.threeGroud)
      if (searchModel[model.ip]) delete searchModel[model.ip]
      container.object3d = container.object3d.filter((item:any) => item !== model)
      break;

  }
};
function sjptcAnimation(data: any) {
  let index = container.object3d.findIndex((item: any) => item.ip == data.licensePlate);
  let fj = container.object3d.find((item: any) => item.ip == data.flightNumber);
  if (!fj) return;
  // if (!fj) fj = addFj(data);
  if (index == -1) {
    index = container.object3d.length;
    addEquipment(data, 'sjptc_ct');
    // if (data.instruction == '前往指定位置' || data.instruction == '撤离') return;
  }
  let model = container.object3d[index];
  let xjArr = ['前往指定位置', '升降车平台撤离指令']
  if (!model.threeGroud.userData.popup) {
    const popup = new Popup({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    popup.completa = function () {
      ; (popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(popup.sprite)
    }
    model.threeGroud.userData.popup = popup
  } else {
    model.threeGroud.userData.popup.initFillText({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    model.threeGroud.userData.popup.completa = function () {
      ; (model.threeGroud.userData.popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(model.threeGroud.userData.popup.sprite)
    }
  }
  if (!model.threeGroud.userData.sjptcMove2) model.threeGroud.userData.sjptcMove2 = sjptcMove2(fj.threeGroud, model.threeGroud)
  const hwc = fj.threeGroud?.userData?.jzxhwc;
  model.threeGroud.userData.jzxhwc = hwc;

  if (fj.threeGroud.userData.goodsnumber.length == 0 && hwc) {
    fj.threeGroud.userData.goodsnumber = hwc.threeGroud.userData.goodsnumber
  }
  switch (data.instruction) {
    case '前往指定位置':
      modelMove(model, getPoints(JSON.parse(data.startPoints)))
      break;
    case '升降车平台撤离指令':
      
      modelMove(model, getPoints(JSON.parse(data.endPoints)))
      // mToP(model, [data.longitude, data.latitude])
      break;
    case '到达指定位置':
      if (true) {
        let point = [-8, 14.5, 0];
        let rotate = -90
        if (fj.threeGroud.name == '400') {
          point = [8, -15.5, 0];
        }

        if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.visible = true;
        request.get(`/getPersonnel?plateNumber=${data.cargo.licensePlate}`).then((info: any) => {
          const popup2 = new Popup({
            '姓名': info.data.name,
            '工号': info.data.workNumber,
            "工种": info.data.typeWork,
            '任务类型': data.task,
          })
          popup2.completa = function () {
            ; (popup2.sprite as any).position.set(0, 0, 2)
            model.threeGroud.userData.icon.add(popup2.sprite)
          }
        })
        const position = new Bol3D.Vector3()
        const mesh: any = new Bol3D.Object3D();
        mesh.position.set(...point)
        fj.threeGroud.add(mesh)
        mesh.getWorldPosition(position)
        let graphic = container.getCartographic(position);
        model.rotation = rotate
        model.wgs84 = [graphic.longitude, graphic.latitude];
        mesh.removeFromParent()
      }
      break;
    case '对接':
      sjptcMove(fj.threeGroud, model.threeGroud);
      break;
    case '从货舱传送集装器至升降平台车':
      sjptcCt(model.threeGroud, false);
      model.threeGroud.userData.isLoad = false;
      break;
    case '主平台升指令':
      model.threeGroud.userData.sjptcMove2(true, () => {
        sjptcCtToCw(model.threeGroud, model.threeGroud.userData.isLoad)
        if (model.threeGroud.userData.isLoad) {
          if (!fj.threeGroud.userData.completeNum) fj.threeGroud.userData.completeNum = 1;
          else fj.threeGroud.userData.completeNum++
          fj.threeGroud.userData.popup.initFillText({
            '货物数量': fj.threeGroud.userData.goodsnumber.length,
            '已完成': fj.threeGroud.userData.goodsnumber.reduce((total: string, item: any, index: number) => {
              if (index < fj.threeGroud.userData.completeNum) return total + item
              return total
            }, '')
          })
            ; (fj.threeGroud.userData.popup.sprite as any).position.set(0, 0, 7)
          fj.threeGroud.add(fj.threeGroud.userData.popup.sprite)
        }
      })
      break;
    case '主平台降指令':
      model.threeGroud.userData.sjptcMove2(false, () => {
        if (!model.threeGroud.userData.isLoad) {
          sjptcCw(model.threeGroud, false);
          if (!fj.threeGroud.userData.completeNum) fj.threeGroud.userData.completeNum = 1;
          else fj.threeGroud.userData.completeNum++
          fj.threeGroud.userData.popup.initFillText({
            '货物数量': fj.threeGroud.userData.goodsnumber.length,
            '已完成': fj.threeGroud.userData.goodsnumber.reduce((total: string, item: any, index: number) => {
              if (index < fj.threeGroud.userData.completeNum) return total + item
              return total
            }, '')
          })
          fj.threeGroud.userData.popup.completa = function () {
            ; (fj.threeGroud.userData.popup.sprite as any).position.set(0, 0, 4)
            fj.threeGroud.add(fj.threeGroud.userData.popup.sprite)
          }
        }
      })
      break;
    case '集装器传送至主平台':
      sjptcCw(model.threeGroud, true);
      model.threeGroud.userData.isLoad = true;
      break;
    case '传送完成':
    case '传输完成':
      equipmentReverseMove(model.threeGroud);
      model.threeGroud.userData.running = false
      if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.removeFromParent()
      break;
    case '撤离至指定位置':
      modeDelete(model.threeGroud)
      if (searchModel[model.ip]) delete searchModel[model.ip]
      container.object3d = container.object3d.filter((item:any) => item !== model)
      break;

  }
};
function wscAnimation(data: any) {
  let index = container.object3d.findIndex((item: any) => item.ip == data.licensePlate);
  let fj = container.object3d.find((item: any) => item.ip == data.flightNumber);
  if (!fj) return;
  // if (!fj) fj = addFj(data);
  if (index == -1) {
    index = container.object3d.length;
    addEquipment(data, 'wsc');
    // if (data.instruction == '前往指定位置' || data.instruction == '撤离') return;
  }
  let model = container.object3d[index];
  let xjArr = ['前往指定位置', '撤离']
  if (!model.threeGroud.userData.popup) {
    const popup = new Popup({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    popup.completa = function () {
      ; (popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(popup.sprite)
    }
    model.threeGroud.userData.popup = popup
  } else {
    model.threeGroud.userData.popup.initFillText({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    model.threeGroud.userData.popup.completa = function () {
      ; (model.threeGroud.userData.popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(model.threeGroud.userData.popup.sprite)
    }
  }
  switch (data.instruction) {
    case '前往指定位置':
      modelMove(model, getPoints(JSON.parse(data.startPoints)))
      break
    case '撤离':
      modelMove(model, getPoints(JSON.parse(data.endPoints)))
      // mToP(model, [data.longitude, data.latitude])
      break;
    case '到达指定位置':
      if (true) {
        let point = [3.4, 23.3, 0];
        let rotate = 90;
        if (fj.threeGroud.name == '400') {
          point = [-2.5, -22.5, 0]
        }
        if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.visible = true;
        request.get(`/getPersonnel?plateNumber=${data.cargo.licensePlate}`).then((info: any) => {
          const popup2 = new Popup({
            '姓名': info.data.name,
            '工号': info.data.workNumber,
            "工种": info.data.typeWork,
            '任务类型': data.task,
          },data.isNotAlarm)
          popup2.completa = function () {
            ; (popup2.sprite as any).position.set(0, 0, 2);
            model.threeGroud.userData.icon.add(popup2.sprite);
          }
          model.threeGroud.userData.popup2 = popup2;
        })
        const position = new Bol3D.Vector3()
        const mesh: any = new Bol3D.Object3D();
        mesh.position.set(...point)
        fj.threeGroud.add(mesh)
        mesh.getWorldPosition(position)
        let graphic = container.getCartographic(position);
        model.rotation = rotate
        model.wgs84 = [graphic.longitude, graphic.latitude];
        mesh.removeFromParent()
      }
      break;
    case '接管':
      wscMove(fj.threeGroud, model.threeGroud)
      break;
    case '拔管':
      equipmentReverseMove(model.threeGroud)
      if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.removeFromParent()
      break;
    case '撤离完成至指定位置':
      modeDelete(model.threeGroud)
      if (searchModel[model.ip]) delete searchModel[model.ip]
      container.object3d = container.object3d.filter((item:any) => item !== model)
      break;
  }
};
function jycAnimation(data: any) {
  let index = container.object3d.findIndex((item: any) => item.ip == data.licensePlate);
  let fj = container.object3d.find((item: any) => item.ip == data.flightNumber);
  if (!fj) return;
  // if (!fj) fj = addFj(data);
  if (index == -1) {
    index = container.object3d.length;
    addEquipment(data, 'jyc');
    // if (data.instruction == '前往指定位置' || data.instruction == '撤离') return;
  }
  let model = container.object3d[index];
  let xjArr = ['前往指定位置', '撤离']
  if (!model.threeGroud.userData.popup) {
    const popup = new Popup({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    popup.completa = function () {
      ; (popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(popup.sprite)
    }
    model.threeGroud.userData.popup = popup
  } else {
    model.threeGroud.userData.popup.initFillText({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    model.threeGroud.userData.popup.completa = function () {
      ; (model.threeGroud.userData.popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(model.threeGroud.userData.popup.sprite)
    }
  }
  switch (data.instruction) {
    case '前往指定位置':
      modelMove(model, getPoints(JSON.parse(data.startPoints)))
      break
    case '撤离':
      modelMove(model, getPoints(JSON.parse(data.endPoints)))
      // mToP(model, [data.longitude, data.latitude])
      break;
    case '到达指定位置':
      if (true) {
        let point = [12.5, .2, 0];
        let rotate = 0;
        if (fj.threeGroud.name == '400') {
          point = [-12.2, -2.3, 0]
        }
        if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.visible = true;
        request.get(`/getPersonnel?plateNumber=${data.cargo.licensePlate}`).then((info: any) => {
          const popup2 = new Popup({
            '姓名': info.data.name,
            '工号': info.data.workNumber,
            "工种": info.data.typeWork,
            '任务类型': data.task,
          })
          popup2.completa = function () {
            ; (popup2.sprite as any).position.set(0, 0, 2)
            model.threeGroud.userData.icon.add(popup2.sprite)
          }
        })
        const position = new Bol3D.Vector3()
        const mesh: any = new Bol3D.Object3D();
        mesh.position.set(...point)
        fj.threeGroud.add(mesh)
        mesh.getWorldPosition(position)
        let graphic = container.getCartographic(position);
        model.rotation = rotate
        model.wgs84 = [graphic.longitude, graphic.latitude];
        mesh.removeFromParent()
      }
      break;
    case '接管':
      jycMove(fj.threeGroud, model.threeGroud)
      break;
    case '拔管':
      equipmentReverseMove(model.threeGroud)
      if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.removeFromParent()
      break;
    case '撤离完成至指定位置':
      container.object3d = container.object3d.filter((item:any) => item !== model)
      if (searchModel[model.ip]) delete searchModel[model.ip]
      modeDelete(model.threeGroud);
      break;

  }
};
function qycAnimation(data: any) {
  let index = container.object3d.findIndex((item: any) => item.ip == data.licensePlate);
  let fj = container.object3d.find((item: any) => item.ip == data.flightNumber);
  if (index == -1) {
    index = container.object3d.length;
    addEquipment(data, 'qyc');
    // if (data.instruction == '前往指定位置' || data.instruction == '撤离') return;
  }
  let model = container.object3d[index];
  if (!fj) fj = model.threeGroud.userData.fj
  if (!fj) return;
  // if (!fj) fj = addFj(data);
  let xjArr = ['前往指定位置', '撤离']
  if (!model.threeGroud.userData.popup) {
    const popup = new Popup({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    popup.completa = function () {
      ; (popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(popup.sprite)
    }
    model.threeGroud.userData.popup = popup
  } else {
    model.threeGroud.userData.popup.initFillText({
      '车牌号': data.cargo.licensePlate,
      '状态': xjArr.includes(data.cargo.state) ? '行进中' : '保障中',
      '类型': data.cargo.type,
    })
    model.threeGroud.userData.popup.completa = function () {
      ; (model.threeGroud.userData.popup.sprite as any).position.set(0, 0, 4)
      model.threeGroud.add(model.threeGroud.userData.popup.sprite)
    }
  }
  switch (data.instruction) {
    case '前往指定位置':
      modelMove(model, getPoints(JSON.parse(data.startPoints)))
      break;
    case '撤离':
      modelMove(model, getPoints(JSON.parse(data.endPoints)))
      // mToP(model, [data.longitude, data.latitude])
      break;
    case '到达指定位置':
      if (true) {
        let point = [1, 30.6, 0];
        let rotate = 180;
        if (fj.threeGroud.name == '400') {
          point = [-1, -31, 0]
        }
        if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.visible = true;
        request.get(`/getPersonnel?plateNumber=${data.cargo.licensePlate}`).then((info: any) => {
          const popup2 = new Popup({
            '姓名': info.data.name,
            '工号': info.data.workNumber,
            "工种": info.data.typeWork,
            '任务类型': data.task,
          })
          popup2.completa = function () {
            ; (popup2.sprite as any).position.set(0, 0, 2)
            model.threeGroud.userData.icon.add(popup2.sprite)
          }
        })
        const position = new Bol3D.Vector3()
        const mesh: any = new Bol3D.Object3D();
        mesh.position.set(...point)
        fj.threeGroud.add(mesh)
        mesh.getWorldPosition(position)
        let graphic = container.getCartographic(position);
        model.rotation = rotate
        model.wgs84 = [graphic.longitude, graphic.latitude];
        mesh.removeFromParent()
      }
      break;
    case '牵引航空器':
        if (fj) {
          model.threeGroud.userData.fj = fj
          container.object3d = container.object3d.filter((item: any) => item != fj)
          modeDelete(fj.threeGroud)
          if (fj.threeGroud.name == '757') {
            fj.threeGroud.position.set(-30.5, 1, 0)
            fj.threeGroud.rotation.set(0, 0, -Math.PI / 2)
          } else {
            fj.threeGroud.position.set(-31.2, 1, 0)
            fj.threeGroud.rotation.set(0, 0, Math.PI / 2)
          }
          model.threeGroud.add(fj.threeGroud)
        }
        modelMove(model, getPoints(JSON.parse(data.qyPoints)))
      // mToP(model, [data.longitude, data.latitude])
      break;
    case '牵引完成':
      fj = model.threeGroud.userData.fj
      if (fj) {
        const position = new Bol3D.Vector3();
        fj.threeGroud.getWorldPosition(position);
        let graphic = container.getCartographic(position);
        fj.wgs84 = [graphic.longitude, graphic.latitude];
        fj.rotation = fj.threeGroud.name == '757' ? 0 : 180;
        modeDelete(fj.threeGroud)
        container.object3d.push(fj)
        container.three.attach(fj.threeGroud)
      }
      if (model.threeGroud.userData.icon) model.threeGroud.userData.icon.removeFromParent()
      break;
    case '撤离完成至指定位置':
      container.object3d = container.object3d.filter((item:any) => item !== model)
      modeDelete(model.threeGroud);
      if (searchModel[model.ip]) delete searchModel[model.ip]
      break;
  }
};



// 动画再规定时间停止
function moveOff(move: any, time: number, fn?: any, reserve?: boolean): void {
  if (reserve) {
    if (move.time <= time) {
      move.paused = true;
      move.time = time;
      if (fn) fn()
    } else requestAnimationFrame(() => {
      moveOff(move, time, fn, reserve)
    })
  } else {
    if (move.time >= time) {
      move.paused = true;
      move.time = time;
      if (fn) fn()
    } else requestAnimationFrame(() => {
      moveOff(move, time, fn)
    })
  }
}
// 删除模型
function modeDelete(model: any): void {
  if (model.parent.isSence) {
    container.three.remove(model);
  } else {
    model.removeFromParent()
    if (model.geometry) model.geometry.dispose()
    if (model.material) model.material.dispose()
  }
  const popup = model.children.find((item: any) => item.name == 'popup');
  if (popup) {
    popup.visible = false;
    popup.removeFromParent()
  }
}
// 聚焦模型位置
function locatorDevice(model: any): void {
  if (focusModel) (focusModel).removeFromParent()
  container.three.outlineObjects = [];
  const geometry = new Bol3D.BoxGeometry(1, 1, 1);
  const material = new Bol3D.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  focusModel = new Bol3D.Mesh(geometry, material);
  focusModel.name = 'box';
  if (typeof model == 'string') model = searchModel[model]
  if (typeof model !== 'object') return alert('没找到对应设备');
  let range = 40;
  if (model.name == '757' || model.name == '400') {
    range = 60
  }
  focusModel.position.set(range, -range, range);
  model.add(focusModel)
  model.traverse((child: any) => {
    if (child.isMesh && child.name !== 'box') container.three.outlineObjects.push(child)
  })
  const position = new Bol3D.Vector3();
  focusModel.getWorldPosition(position)
  const { longitude, latitude, height } = container.getCartographic(position.x, position.y, position.z);
  const loop = function () {
    if (focusModel) requestAnimationFrame(loop)
    else return
    focusModel.getWorldPosition(position);
    const { longitude, latitude, height } = container.getCartographic(position.x, position.y, position.z);
    container.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: {
        heading: container.getHeading(position, model.position),
        pitch: container.getPitch(position, model.position),
        roll: Cesium.Math.toRadians(0),
      }
    });
  }

  container.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    orientation: {
      heading: container.getHeading(position, model.position),
      pitch: container.getPitch(position, model.position),
      roll: Cesium.Math.toRadians(0),
    },
    maximumHeight: 1100,
    duration: 1,
    complete: function () {
      // 修改鼠标控制地图视图的默认行为：左键拖动，右键旋转
      container.viewer.scene.screenSpaceCameraController.zoomEventTypes = [
        Cesium.CameraEventType.WHEEL,
        Cesium.CameraEventType.MIDDLE_DRAG,
        // Cesium.CameraEventType.PINCH,
      ];
      loop()
    }
  })
}

// 取消聚焦
function cancelLocator(): void {
  focusModel.removeFromParent()
  focusModel = null;
  container.three.outlineObjects = [];
  container.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(118.84241372564283, 31.73113275521421, 1006),
    orientation: {
      heading: Cesium.Math.toRadians(147.5345894894121),
      pitch: Cesium.Math.toRadians(-65.33366237306274),
      roll: Cesium.Math.toRadians(0.001012108706811133),
    },
    maximumHeight: 1100,
    duration: 1,
    complete() {
      // 修改鼠标控制地图视图的默认行为：左键拖动，右键旋转
      container.viewer.scene.screenSpaceCameraController.zoomEventTypes = [
        Cesium.CameraEventType.WHEEL,
        Cesium.CameraEventType.MIDDLE_DRAG,
        // Cesium.CameraEventType.PINCH,
      ];
    }
  })
}


function openJCCM(scene: any, status: Boolean, callback?: any): void {
  if (scene.name == '757') {
    const obj: any = {};
    scene.traverse((child: any) => {
      if (child.name == "jccm" || child.name == "对象350") {
        obj[child.name] = child;
      }
    })
    if (status) {
      scene.children.forEach((child: any) => {
        if (child.name.includes('jzx') || child.name == "jc") {
          child.visible = true
        }
      })
      // 开
      new Bol3D.TWEEN.Tween(obj["jccm"].rotation).to({
        z: -1.832595890715934
      }, 2000).start().onComplete(() => {
        obj['对象350'].visible = true;
        if (callback) callback()
      })
    } else {
      obj['对象350'].visible = false;
      // 关
      new Bol3D.TWEEN.Tween(obj["jccm"].rotation).to({
        z: 0
      }, 2000).start().onComplete(() => {
        scene.children.forEach((child: any) => {
          if (child.name.includes('jzx') || child.name == "jc") {
            child.visible = false
          }
        })
        if (callback) callback()
      })
    }
  } else {
    const obj: any = {};
    scene.traverse((child: any) => {
      if (child.name == "400jcm" || child.name == "400jcmjx2") {
        obj[child.name] = child;
      }
    })
    if (status) {
      scene.children.forEach((child: any) => {
        if (child.name.includes('jzx') || child.name == "400jczu") {
          child.visible = true
        }
      })
      // 开
      new Bol3D.TWEEN.Tween(obj["400jcm"].rotation).to({
        y: 1.6,
        z: .04
      }, 2000).start().onComplete(() => {
        if (callback) callback()
      })
    } else {
      obj['400jcmjx2'].visible = false;
      // 关
      new Bol3D.TWEEN.Tween(obj["400jcm"].rotation).to({
        y: 0,
        z: 0
      }, 2000).start().onComplete(() => {
        scene.children.forEach((child: any) => {
          if (child.name.includes('jzx') || child.name == "400jczu") {
            child.visible = false
          }
        })
        if (callback) callback()
      })
    }
  }
}

function openHCCM(scene: any, isOpen?: boolean, callback?: any): void {
  let childList: any[] = [];
  let state1 = true;
  let state2 = true;
  let state3 = true;
  let state4 = true;
  const rotate = Math.PI / 180 * 2.5;
  if (scene.name == '757') {
    childList = scene.children.filter((child: any) => child.name == 'qcm' || child.name == 'cm08');
  } else {
    state3 = false;
    state4 = false;
    childList = scene.children.filter((child: any) => child.name == "400hcm" || child.name == "400qcm");
  }

  function rotateMove() {
    childList.forEach(child => {
      if (child.name == 'qcm' && state1) {
        let num = 0;
        const y = child.rotation.y;
        if (isOpen) {
          num = y + rotate;
          if (num >= Math.PI) {
            state1 = false
          }
        } else {
          num = y - rotate;
          if (num <= .012) {
            state1 = false
          }
        }
        child.rotation.y = num;
      }
      if (child.name == 'cm08' && state2) {
        let num = 0;
        const z = Math.abs(child.rotation.z);
        if (isOpen) {
          num = z + rotate;
          if (num >= Math.PI) {
            state2 = false
          }
        } else {
          num = z - rotate;
          if (num <= .012) {
            state2 = false
          }
        }
        child.rotation.z = num;
      }
      // if (child.name == '对象358' && state3) {
      //   let num = 0;
      //   const y = child.rotation.y;
      //   child.visible = true;
      //   if (isOpen) {
      //     num = y - rotate;
      //     if (num <= -Math.PI + .6) {
      //       state3 = false
      //       child.visible = false;
      //     }
      //   } else {
      //     num = y + rotate;
      //     if (num >= 0.6) {
      //       state3 = false
      //     }
      //   }
      //   child.rotation.y = num;
      // }
      // if (child.name == '对象357' && state4) {
      //   let num = 0;
      //   const y = child.rotation.y;
      //   child.visible = true;
      //   if (isOpen) {
      //     num = y + rotate;
      //     if (num >= -.4) {
      //       state4 = false
      //     }
      //   } else {
      //     num = y - rotate;
      //     if (num <= -Math.PI - .4) {
      //       state4 = false
      //       child.visible = false;
      //     }
      //   }
      //   child.rotation.y = num;
      // }
      if (child.name == '400qcm' && state1) {
        let num = 0;
        const z = child.rotation.z;
        if (isOpen) {
          num = z + rotate;
          if (num >= 1) {
            state1 = false
          }
        } else {
          num = z - rotate;
          if (num <= 0) {
            state1 = false
          }
        }
        child.rotation.z = num;
      }
      if (child.name == '400hcm' && state2) {
        let num = 0;
        const y = child.rotation.y;
        if (isOpen) {
          num = y + rotate;
          if (num >= 1) {
            state2 = false
          }
        } else {
          num = y - rotate;
          if (num <= 0.02) {
            state2 = false
          }
        }
        child.rotation.y = num;
      }
    })
    if (state1 || state2 || state3 || state4) {
      requestAnimationFrame(() => {
        rotateMove()
      })
    } else {
      if (callback) callback()
    }
  }
  rotateMove()
}

function openJCM(scene: any, callback?: any): void {
  if (scene.name == '757') {
    scene.children.forEach((child: any) => {
      if (child.name == "757351cm001") {
        let rotate = 3.1415925490809937;
        if (child.rotation.z >= rotate) {
          rotate = rotate / 2
        }
        new Bol3D.TWEEN.Tween(child.rotation).to({
          z: rotate
        }, 5000).start().onComplete(() => {
          if (callback) callback()
        })
      }
    })
  } else {
    scene.children.forEach((child: any) => {
      if (child.name == "400cm01v") {
        let rotate = -1.5707963518321546;
        if (child.rotation.z <= rotate) {
          rotate = 0
        }
        new Bol3D.TWEEN.Tween(child.rotation).to({
          z: rotate
        }, 5000).start().onComplete(() => {
          if (callback) callback()
        })
      }
    })
  }
}

function openCL(scene: any, callback?: any): void {
  switch (scene.name) {
    case 'wsc':
      openWSCL(scene)
      break;
    case 'qyc':
      openQYCL(scene)
      break;
    case 'jyc':
      openJYCL(scene)
      break;
    case 'csdc':
      openCSDCL(scene)
      break;
    case 'hwqyc':
      openHWQYCL(scene)
      break;
    case 'sjptc_ct':
      openSJPTCL(scene)
      break;
    case 'gbc':
      openGBCL(scene)
      break;
  }
}
// 污水车车轮
function openWSCL(scene: any): void {
  scene.traverse((child: any) => {
    if (child.name == 'wsclhz' || child.name == 'wsclhy' || child.name == 'wsclqz' || child.name == 'wsclqy') {
      child.rotation.x += 0.1
    }
  })
  if (scene.userData.animation) requestAnimationFrame(() => openWSCL(scene))
}
// 飞机牵引车车轮
function openQYCL(scene: any): void {
  scene.traverse((child: any) => {
    if (child.name == '对象001' || child.name == '对象002' || child.name == '对象003' || child.name == '对象004') {
      child.rotation.z -= 0.05
    }
  })
  if (scene.userData.animation) requestAnimationFrame(() => openQYCL(scene))
}

// 加油车车轮
function openJYCL(scene: any): void {
  scene.traverse((child: any) => {
    if (child.name == '对象001' || child.name == '对象002' || child.name == '对象003' || child.name == '对象004') {
      child.rotation.z -= 0.05
    }
  })
  if (scene.userData.animation) requestAnimationFrame(() => openJYCL(scene))
}
// 除冰车车轮
function openCBCL(scene: any): void {
  scene.traverse((child: any) => {
    if (child.name == '对象001' || child.name == '对象002' || child.name == '对象003' || child.name == '对象004') {
      child.rotation.x += 0.05
    }
  })
  if (scene.userData.animation) requestAnimationFrame(() => openCBCL(scene))
}
// 传输带车车轮
function openCSDCL(scene: any): void {
  scene.traverse((child: any) => {
    if (child.name == 'node3' || child.name == 'node5' || child.name == 'node7' || child.name == 'node9') {
      child.rotation.y -= 0.1
    }
  })
  if (scene.userData.animation) requestAnimationFrame(() => openCSDCL(scene))
}
// 货物牵引车车轮
function openHWQYCL(scene: any): void {
  scene.traverse((child: any) => {
    if (child.name == '对象001' || child.name == '对象002' || child.name == '对象003' || child.name == '对象004') {
      child.rotation.z += 0.1
    } else if (child.name == 'hj008' || child.name == 'hj005' || child.name == 'hj006' || child.name == 'hj007') {
      child.rotation.z += 0.2
    }
  })
  if (scene.userData.animation) requestAnimationFrame(() => openHWQYCL(scene))
}
// 升降平台车车轮
function openSJPTCL(scene: any): void {
  scene.traverse((child: any) => {
    if (child.name == '对象001' || child.name == '对象002') {
      child.rotation.z += 0.05
    }
  })
  if (scene.userData.animation) requestAnimationFrame(() => openSJPTCL(scene))
}
// 货架车车轮
function openGBCL(scene: any): void {
  scene.traverse((child: any) => {
    if (child.name == '对象008' || child.name == '对象005' || child.name == '对象006' || child.name == '对象007') {
      child.rotation.z += 0.1
    }
  })
  if (scene.userData.animation) requestAnimationFrame(() => openGBCL(scene))
}
// 组装货架到牵引车
function hjToQyc(num: number): any {
  const hj = modelClone(sceneModel['gbc'].threeGroud);
  const hwqyc = modelClone(sceneModel['hwqyc'].threeGroud);
  hj.rotation.set(0, 0, 0)
  hj.name = 'hj';
  hj.traverse((child: any) => {
    child.name = child.name.replace('对象', 'hj')
  })
  hj.rotation.y = 0
  for (let index = 0; index < num; index++) {
    const hj1 = hj.clone();
    hj1.position.set(3.5 + index * 3.9, -0.2, 0);
    hj1.name = 'hj' + index;
    hwqyc.add(hj1)
  }
  return hwqyc
}
// 货物装载到货架车 可能参数 jzx1,jzx2,jzx3,sh
function hwToHj(hjc: any, name: string): any {
  let hwIndex = 0;
  let hwName = name;
  hjc.userData.index = 0;
  hjc.traverse((child: any) => {
    if (/^hj\d$/.test(child.name)) {
      if (name == 'sh') {
        if (hwIndex > 2) hwIndex = 0;
        hwName = name + (hwIndex + 1)
      }
      if (sceneModel[hwName]) {
        const xz = modelClone(sceneModel[hwName].threeGroud);
        xz.userData.name = 'xz';
        if (name == 'jzx1') {
          xz.position.set(0.45, 0.25, 0.5)
        } else if (name == 'sh') {
          xz.position.set(0.5, 0.25, 0.5)
          xz.rotateZ(Math.PI / 2)
        }
        xz.name += ('_' + hwIndex);
        hwIndex++;
        xz.traverse((child: any) => {
          child.name = child.name.replace('对象', 'xz')
        })
        child.add(xz)
      }
    }
  })
  return hjc
}




// 轮挡就位
function ldMove(model: any): void {
  const lundang1 = sceneModel['lundang'].threeGroud.clone();
  const lundang2 = sceneModel['lundang'].threeGroud.clone();
  lundang1.visible = true;
  lundang2.visible = true;
  lundang1.name = 'lundang1'
  lundang2.name = 'lundang2'
  lundang2.rotateY(Math.PI)
  lundang1.position.set(.15, 0, -17.3)
  lundang2.position.set(.15, 0, -18.3)
  if (model.name == '400') {
    lundang1.position.set(0, 0, 14.9)
    lundang2.position.set(0, 0, 13.7)
  }
  model.add(lundang1, lundang2)
}
// 轮挡移开
function ldMove2(model: any): void {
  let lundang1: any = null;
  let lundang2: any = null;
  model.children.forEach((child: any) => {
    if (child.name == 'lundang1') {
      lundang1 = child;
    }
    if (child.name == 'lundang2') {
      lundang2 = child;
    }
  })
  if (!lundang1 || !lundang2) return;
  let l1 = -16.2;
  let l2 = -19.4;
  if (model.name == '400') {
    l1 = 16;
    l2 = 12.6;
  }
  new Bol3D.TWEEN.Tween(lundang1.position).to({
    z: l1
  }, 1000).start().onComplete(() => {
    lundang1.removeFromParent()
  })
  new Bol3D.TWEEN.Tween(lundang2.position).to({
    z: l2
  }, 1000).start().onComplete(() => {
    lundang2.removeFromParent()
  })
}

// 飞机牵引车推出飞机
function fjQycMove2(fj: any): void {
  fj.add(fj['qyc']);
  if (fj.name == '400') {
    fj['qyc'].position.set(0, 0, 26.4)
    fj['qyc'].rotateY(Math.PI / 2)
  } else {
    fj['qyc'].position.set(0, 0, -29.75)
    fj['qyc'].rotateY(Math.PI / -2)
  }
  fj.userData.direction = true;
}

// 加油车接管动画
function jycMove(fj: any, model: any): void {
  if (typeof fj == 'object') fj = fj.name;
  const mixer1 = new Bol3D.AnimationMixer(model);
  const move = mixer1.clipAction(container.three.sceneAnimations['jyc'][0].clone()) // start
  container.three.mixers.push(mixer1);
  model.userData.mixer = move;
  move.loop = Bol3D.LoopOnce;
  move.time = 0;
  move.timeScale = 1;
  move.clampWhenFinished = true;
  move.paused = false;
  move.play();
  if (fj == '400') {
    moveOff(move, 2, undefined, true)
  }
}
// 污水车接管动画
function wscMove(fj: any, model: any): void {
  if (typeof fj == 'object') fj = fj.name;
  const mixer1 = new Bol3D.AnimationMixer(model)
  const move = mixer1.clipAction(container.three.sceneAnimations["wsc"][0].clone()) // start
  container.three.mixers.push(mixer1);
  model.userData.mixer = move;
  move.time = 0;
  move.loop = Bol3D.LoopOnce;
  move.timeScale = 1;
  move.clampWhenFinished = true;
  move.paused = false;
  move.play();
  if (fj == '400') {
    moveOff(move, .7, undefined, true)
  }
}
// 升降平台车车头动画
function sjptcMove(fj: any, model: any): void {
  if (typeof fj == 'object') fj = fj.name;
  const mixer1 = new Bol3D.AnimationMixer(model)
  const move = mixer1.clipAction(container.three.sceneAnimations['sjptc_ct'][0].clone()) // start
  container.three.mixers.push(mixer1);
  model.userData.mixer = move;
  move.loop = Bol3D.LoopOnce;
  move.time = 0;
  move.timeScale = 1;
  move.clampWhenFinished = true;
  move.paused = false;
  move.play();
  if (fj == '400') {
    moveOff(move, .35)
  }
}
// 升降平台车车尾动画
function sjptcMove2(fj: any, model: any): Function {
  if (typeof fj == 'object') fj = fj.name;
  if (!model.userData.cwMixer) {
    const mixer1 = new Bol3D.AnimationMixer(model)
    const move = mixer1.clipAction(container.three.sceneAnimations['sjptc_cw'][0].clone()) // start
    container.three.mixers.push(mixer1);
    model.userData.cwMixer = move
  }
  return (open: boolean, callback?: Function): void => {
    const move = model.userData.cwMixer;
    move.loop = Bol3D.LoopOnce;
    if (open) move.time = 0;
    move.timeScale = open ? 1 : -1;
    move.clampWhenFinished = true;
    move.paused = false;
    move.play();
    if (fj == '400' && open) {
      moveOff(move, .55, () => {
        if (callback) callback()
      })
      return
    }
    const finished = () => {
      if (callback) callback()
      move._mixer.removeEventListener('finished', finished);
    }
    move._mixer.addEventListener('finished', finished);
  }
}
// 货物在车头动画 flag = true 为上货
function sjptcCt(model: any, flag: Boolean): void {
  let x = -3.5;
  let endX = 0;
  if (flag) {
    x = 3.5;
    endX = -3.5
  }
  const ct = model.getObjectByName("对象006_primitive0");
  const jzx = sceneModel['jzx1'].threeGroud.clone();
  jzx.rotation.set(Math.PI / -2, 0, Math.PI / 2)
  jzx.position.set(x, 0, .3)
  jzx.visible = true;
  ct.add(jzx)
  new Bol3D.TWEEN.Tween(jzx.position).to({
    x: endX
  }, flag ? 5000 : 2500).start().onComplete(() => {
    if (flag) modeDelete(jzx)
  })
}
function sjptcCtToCw(model: any, flag: Boolean) {
  const ct = model.getObjectByName("对象006_primitive0");
  const cw = model.getObjectByName("对象003_primitive0");
  if (flag) {
    const jzx = cw.getObjectByName('jzx1');
    jzx.removeFromParent();
    sjptcCt(model, flag)
  } else {
    const jzx = ct.getObjectByName('jzx1');
    new Bol3D.TWEEN.Tween(jzx.position).to({
      x: 3.5
    }, 2500).start().onComplete(() => {
      jzx.removeFromParent();
      jzx.rotation.set(Math.PI / -2, 0, Math.PI / 2);
      jzx.position.set(-2, .1, 0);
      cw.add(jzx)
    })
  }
}
// 货物在车尾动画 flag = true 为上货
function sjptcCw(model: any, flag: Boolean,): void {
  const hwc = model.userData.jzxhwc
  let hjNum = 0;
  let x = -2;
  let endX = 6;
  if (flag) {
    x = 6;
    endX = -2;
    hwc && hwc.threeGroud.children.forEach((item: any) => {
      if(/^hj\d/.test(item.name)) {
        hjNum ++
        if (item.name == `hj${hwc.threeGroud.userData.index}`) {
          item.children.forEach((item2: any) => {
            if (item2.userData.name == 'xz') item2.visible = false;
          })
        }
      }
    })
    if (hwc) hwc.threeGroud.userData.index++
  }
  const cw = model.getObjectByName("对象003_primitive0");
  let jzx = cw.getObjectByName('jzx1');
  if (!jzx) {
    jzx = sceneModel['jzx1'].threeGroud.clone();
    jzx.rotation.set(Math.PI / -2, 0, Math.PI / 2)
    jzx.position.set(x, 0.1, 0)
    cw.add(jzx)
    jzx.visible = true;
  }
  new Bol3D.TWEEN.Tween(jzx.position).to({
    x: endX
  }, 5000).start().onComplete(() => {
    if (!flag) {
      jzx.removeFromParent();
      hwc && hwc.threeGroud.children.forEach((item: any) => {
        if(/^hj\d/.test(item.name)) {
          hjNum ++
          if (item.name == `hj${hwc.threeGroud.userData.index}`) {
            item.children.forEach((item2: any) => {
              if (item2.userData.name == 'xz') item2.visible = true;
            })
          }
        }
      })
      if (hwc) hwc.threeGroud.userData.index++
    }
    if(hwc.threeGroud.userData.index < hjNum) {
      const position = new Bol3D.Vector3();
      hwc.threeGroud.userData.box.getWorldPosition(position);
      const {longitude,latitude} = container.getCartographic(position)
      modelMove(hwc,[hwc.wgs84,[longitude,latitude]])
    }
  })
}
// 传送带打开动画
function csdMove(fj: any, model: any): void {
  const mixer1 = new Bol3D.AnimationMixer(model)
  const move = mixer1.clipAction(container.three.sceneAnimations['csdc'][0].clone()) // start
  container.three.mixers.push(mixer1);
  model.userData.mixer = move;
  move.loop = Bol3D.LoopOnce;
  move.time = 0;
  move.timeScale = 1;
  move.clampWhenFinished = true;
  move.paused = false;
  move.play();
  console.log(move);

  if (fj.name == '400') {
    if (fj.userData.hcIndex == 1) {
      moveOff(move, 1.5)
    } else {
      moveOff(move, 1.8)
    }
  }
}
// 传送带上货
function csdInfj(model: any, hjc: any): void {
  let num = 0;
  let index = 0;
  const shList: any = []
  console.log('####',model);
  
  const csd = model.getObjectByName("CT06");
  hjc && hjc.traverse((child: any) => {
    if (child.userData.name == 'xz') {
      shList.push(child)
    }
  })
  model.userData.running = true;
  function sh() {
    const xz = xzList[index].clone();
    xz.position.set(0, 0, 0);
    xz.scale.set(.008, .008, .008)
    xz.rotation.set(Math.PI / -2, -0.16, 0)
    xz.visible = true;
    csd.add(xz);
    new Bol3D.TWEEN.Tween(xz.position).to({
      x: -0.075
    }, 5000).start().onComplete(() => {
      xz.removeFromParent()
      // xz.geometry.dispose();
      // xz.material.dispose();
      num++;
      if (num % 20 == 0) {
        if (num / 20 < shList.length - 1) {
          if (shList[num / 20 - 1]) shList[num / 20 - 1].visible = false
        }
      }
    })
    const timer = setTimeout(() => {
      index++;
      if (index >= 6) index = 0;
      clearTimeout(timer)
      if (model.userData.running) sh()
      else shList.forEach((child:any) => {
        child.visible = false
      })
    }, 1000)
  }
  sh()
}
// 传送带下货
function csdOutfj(model: any, hjc: any): void {
  let num = 0;
  let index = 0;
  const shList: any = []
  const csd = model.getObjectByName("CT06");
  hjc && hjc.traverse((child: any) => {
    if (child.userData.name == 'xz') {
      shList.push(child)
    }
  })
  model.userData.running = true;
  function sh() {
    const xz = xzList[index].clone();
    xz.position.set(-0.075, 0, 0);
    xz.scale.set(.008, .008, .008)
    xz.rotation.set(Math.PI / -2, -0.16, 0)
    xz.visible = true;
    csd.add(xz);
    new Bol3D.TWEEN.Tween(xz.position).to({
      x: 0
    }, 5000).start().onComplete(() => {
      xz.removeFromParent()
      num++;
      if (num % 20 == 1) {
        if (num / 20 < shList.length) {
          if (shList[Math.floor(num / 20)]) shList[Math.floor(num / 20)].visible = true
        }
      }
    })
    const timer = setTimeout(() => {
      index++;
      if (index >= 6) index = 0;
      clearTimeout(timer)
      if (model.userData.running) sh()
    }, 1000)
  }
  sh()
}

// 设备车倒放动画
function equipmentReverseMove(model: any, callback?: any): void {
  const move: any = model.userData.mixer;
  if (move) {
    move.timeScale = -1;
    move.clampWhenFinished = true;
    move.paused = false;
    move.play();
    const finished = function (): void {
      if (callback) callback()
      move._mixer.removeEventListener('finished', finished)
    }
    move._mixer.addEventListener('finished', finished)
  }
}

async function pushData(points:any,num:number) {
  const date = new Date();
  const time = date.getTime()
  const Y = date.getFullYear()
  const M = date.getMonth() + 1;
  const D = date.getDate();
  const getHM = function (num: number) {
    const H = new Date(time + num * 60 * 1000).getHours()
    const M = new Date(time + num * 60 * 1000).getMinutes()
    return `${H < 10 ? '0' + H : H}:${M < 10 ? '0' + M : M}`
  }
  // 先清空旧数据
  await request.get('/del')
  // 飞机进港
  request.post('/airportFlightSs/add', {
    "id": 1,
    "airportid": null,
    "flightno": "MU2755", //航班号
    "planfly": "B9902",
    "unitnumber": "001",
    "actualcargo": "001",
    "actualsecurity": "001",
    "actualpersonnel": "001",
    "models": "A320",
    "target": num,
    "actualflightreservation": num, // 实际机位
    "oneName": "进港",
    "oneTime": getHM(1),
    "twoName": "入位",
    "twoTime": getHM(3),
    "threeName": "开启货舱门",
    "threeTime": getHM(7),
    "fourName": "关闭货舱门",
    "fourTime": getHM(29),
    "fiveName": "开启货舱门",
    "fiveTime": getHM(32),
    "sixName": "关闭货舱门",
    "sixTime": getHM(54),
    "sevenName": "滑行",
    "sevenTime": getHM(59),
    "eightName": "起飞",
    "eightTime": getHM(61),
    "actuallandingsrrip": "2",  // 降落跑道
    "startPoints": JSON.stringify(points.fjStart),
    "endPoints": JSON.stringify(points.fjEnd)
  }).then((info) => {
    console.log(info);
  }, err => {
    console.log(err);
  })
  
  // 污水车
  request.post('/wcarSs/add', {
    "id": 1,
    "ctime": "2022-11-02",
    "equipmentnumber": "004",
    "licenseplate": "苏A00004",
    "drivers": "刘四",
    "contactphone": "1236985",
    "flightno": "MU2755",
    "vehicletype": "定位传感器",
    "sensornumber": "001",
    "taskname": "排污",
    "onename": "前往指定位置",
    "oneinstruction": getHM(2),
    "onefeedback": "到达指定位置",
    "onefeedbacktime": getHM(4),
    "twoname": "接管",
    "twoinstruction": getHM(5),
    "threename": "排污",
    "threeinstruction": getHM(6),
    "fourname": "拔管",
    "fourinstruction": getHM(7),
    "fivename": "撤离",
    "fivetime": getHM(8),
    "sixname": "撤离完成至指定位置",
    "sixtime": getHM(10),
    "startPoints": JSON.stringify(points.wscStart),
    "endPoints": JSON.stringify(points.wscEnd)
  })
  
  // 升降平台车(卸)
  request.post('/carYx/add', {
    "id": 1,
    "equipmentnumber": "003",
    "platenumber": "苏A00003",
    "actualdriver": "刘三",
    "contactphone": "1236547",
    "actualserviceflight": "MU2755",
    "boardsensorstype": "定位传感器",
    "vehiclesensornumber": "001",
    "taskname": "集装器的卸传输",
    "onename": "前往指定位置",
    "oneinstruction": getHM(5),
    "onefeedback": "到达指定位置",
    "onefeedbacktime": getHM(7),
    "twoname": "对接",
    "twoinstruction": getHM(8),
    "twofeedback": "从货舱传送集装器至升降平台车",
    "twofeedbacktime": getHM(9),
    "threename": "主平台升指令",
    "threeinstruction": getHM(10),
    "threefeedback": "主平台降指令",
    "threefeedbacktime": getHM(11),
    "fourname": "从货舱传送集装器至升降平台车",
    "fourinstruction": getHM(12),
    "fourfeedback": "主平台升指令",
    "fourfeedbacktime": getHM(13),
    "fivename": "主平台降指令",
    "fivetime": getHM(14),
    "fivefeedback": "从货舱传送集装器至升降平台车",
    "fivefeedbacktime": getHM(15),
    "sixname": "主平台升指令",
    "sixtime": getHM(16),
    "sixfeedback": "主平台降指令",
    "sixfeedbacktime": getHM(17),
    "sevenname": "传送完成",
    "seventime": getHM(18),
    "sevenfeedback": "升降车平台撤离指令",
    "sevenfeedbacktime": getHM(20),
    "eightName": "撤离至指定位置",
    "eightTime": getHM(22),
    "startPoints": JSON.stringify(points.sjStart),
    "endPoints": JSON.stringify(points.sjEnd)
  })

  // 货物牵引车(卸集)
  request.post('/tractorSs/add', {
    "id": 1,
    "ctime": `${Y}-${M}-${D}`,
    "equipmentnumber": "0011",
    "platenumber": "苏A00001",
    "actualfriver": "南宝",
    "contactphone": "1236547",
    "actualserviceflight": "MU2755",
    "boardsensors": "定位传感器",
    "boardsensorsnumber": "001",
    "reportingtime": "15:40:00",
    "taskname": "集装器卸货",
    "onename": "前往指定位置",
    "onetime": getHM(6),
    "oneinformation": "到达指定位置",
    "oneinformationtime": getHM(8),
    "twoname": "撤离",
    "twotime": getHM(19),
    "twoinformation": "撤离至制定位置",
    "twoinformationtime": getHM(21),
    "stickId": "001",
    "startPoints": JSON.stringify(points.hwJiStart),
    "endPoints": JSON.stringify(points.hwJiEnd)
  })
  
  // 传送带车(卸)
  request.post('/transferCarsSs/add', {
    "id": 1,
    "ctime": "2022-11-02",
    "equipmentnumber": "002",
    "platenumber": "苏A00002",
    "actualdriver": "刘二",
    "contactphone": "1236547",
    "flightnumber": "MU2755",
    "boardsensors": "定位传感器",
    "sensornumber": "001",
    "taskname": "散货的卸传输",
    "onename": "前往指定位置",
    "onttime": getHM(21),
    "onefeedback": "到达指定位置",
    "onefeedbacktime": getHM(23),
    "twoname": "传送带启动",
    "twotime": getHM(24),
    "twofeedback": "传送带车传送货物至滚棒车（散货）指令",
    "twofeedbacktime": getHM(25),
    "threename": "传送完成",
    "threetime": getHM(27),
    "threefeedback": "升降车平台撤离指令",
    "threefeedbacktime": getHM(29),
    "fourname": "撤离至指定位置",
    "fourtime": getHM(31),
    "startPoints": JSON.stringify(points.csdcStart),
    "endPoints": JSON.stringify(points.csdcEnd)
  })
  // 货物牵引车(卸散)
  request.post('/tractorSs/add', {
    "id": 1,
    "ctime": `${Y}-${M}-${D}`,
    "equipmentnumber": "0011",
    "platenumber": "苏A00001",
    "actualfriver": "南宝",
    "contactphone": "1236547",
    "actualserviceflight": "MU2755",
    "boardsensors": "定位传感器",
    "boardsensorsnumber": "001",
    "reportingtime": "15:40:00",
    "taskname": "散货卸货",
    "onename": "前往指定位置",
    "onetime": getHM(22),
    "oneinformation": "到达指定位置",
    "oneinformationtime": getHM(24),
    "twoname": "撤离",
    "twotime": getHM(28),
    "twoinformation": "撤离至制定位置",
    "twoinformationtime": getHM(30),
    "stickId": "001",
    "startPoints": JSON.stringify(points.hwSanStart),
    "endPoints": JSON.stringify(points.hwSanEnd)
  })
  // 加油车
  request.post('/truckJySs/add', {
    "id": 1,
    "ctime": "2022-11-02",
    "equipmentnumber": "5",
    "licenseplate": "苏A00005",
    "drivers": "刘五",
    "contactphone": "123478",
    "flightno": "MU2755",
    "vehicletype": "定位传感器",
    "sensornumber": "001",
    "taskname": "加油",
    "onename": "前往指定位置",
    "oneinstruction": getHM(28),
    "onefeedback": "到达指定位置",
    "onefeedbacktime": getHM(30),
    "twoname": "接管",
    "twoinstruction": getHM(31),
    "twofeedback": "加油",
    "twofeedbacktime": getHM(32),
    "threename": "拔管",
    "threeinstruction": getHM(33),
    "threefeedback": "撤离",
    "threefeedbacktime": getHM(34),
    "fourname": "撤离完成至指定位置",
    "fourinstruction": getHM(36),
    "startPoints": JSON.stringify(points.jycStart),
    "endPoints": JSON.stringify(points.jycEnd)
  })
  
  // 升降平台车(装)
  request.post('/carYx/add', {
    "id": 1,
    "equipmentnumber": "003",
    "platenumber": "苏A00003",
    "actualdriver": "刘三",
    "contactphone": "1236547",
    "actualserviceflight": "MU2755",
    "boardsensorstype": "定位传感器",
    "vehiclesensornumber": "001",
    "taskname": "集装器的装传输",
    "onename": "前往指定位置",
    "oneinstruction": getHM(30),
    "onefeedback": "到达指定位置",
    "onefeedbacktime": getHM(32),
    "twoname": "对接",
    "twoinstruction": getHM(33),
    "twofeedback": "集装器传送至主平台",
    "twofeedbacktime": getHM(34),
    "threename": "主平台升指令",
    "threeinstruction": getHM(35),
    "threefeedback": "主平台降指令",
    "threefeedbacktime": getHM(36),
    "fourname": "集装器传送至主平台",
    "fourinstruction": getHM(37),
    "fourfeedback": "主平台升指令",
    "fourfeedbacktime": getHM(38),
    "fivename": "主平台降指令",
    "fivetime": getHM(39),
    "fivefeedback": "集装器传送至主平台",
    "fivefeedbacktime": getHM(40),
    "sixname": "主平台升指令",
    "sixtime": getHM(41),
    "sixfeedback": "主平台降指令",
    "sixfeedbacktime": getHM(42),
    "sevenname": "传送完成",
    "seventime": getHM(43),
    "sevenfeedback": "升降车平台撤离指令",
    "sevenfeedbacktime": getHM(45),
    "eightName": "撤离至指定位置",
    "eightTime": getHM(47),
    "startPoints": JSON.stringify(points.sjStart),
    "endPoints": JSON.stringify(points.sjEnd)
  })

  // 货物牵引车(装集)
  request.post('/tractorSs/add', {
    "id": 1,
    "ctime": `${Y}-${M}-${D}`,
    "equipmentnumber": "0011",
    "platenumber": "苏A00001",
    "actualfriver": "南宝",
    "contactphone": "1236547",
    "actualserviceflight": "MU2755",
    "boardsensors": "定位传感器",
    "boardsensorsnumber": "001",
    "reportingtime": "15:40:00",
    "taskname": "集装器装货",
    "onename": "前往指定位置",
    "onetime": getHM(31),
    "oneinformation": "到达指定位置",
    "oneinformationtime": getHM(33),
    "twoname": "撤离",
    "twotime": getHM(44),
    "twoinformation": "撤离至制定位置",
    "twoinformationtime": getHM(46),
    "stickId": "001",
    "startPoints": JSON.stringify(points.hwJiStart),
    "endPoints": JSON.stringify(points.hwJiEnd)
  })
  
  // 传送带车（装）
  request.post('/transferCarsSs/add', {
    "id": 1,
    "ctime": "2022-11-02",
    "equipmentnumber": "002",
    "platenumber": "苏A00002",
    "actualdriver": "刘二",
    "contactphone": "1236547",
    "flightnumber": "MU2755",
    "boardsensors": "定位传感器",
    "sensornumber": "001",
    "taskname": "散货的装传输",
    "onename": "前往指定位置",
    "onttime": getHM(46),
    "onefeedback": "到达指定位置",
    "onefeedbacktime": getHM(48),
    "twoname": "传送带启动",
    "twotime": getHM(49),
    "twofeedback": "传送货物至货舱",
    "twofeedbacktime": getHM(50),
    "threename": "传送完成",
    "threetime": getHM(52),
    "threefeedback": "升降车平台撤离指令",
    "threefeedbacktime": getHM(54),
    "fourname": "撤离至指定位置",
    "fourtime": getHM(56),
    "startPoints": JSON.stringify(points.csdcStart),
    "endPoints": JSON.stringify(points.csdcEnd)
  })
  // 货物牵引车（装散）
  request.post('/tractorSs/add', {
    "id": 1,
    "ctime": `${Y}-${M}-${D}`,
    "equipmentnumber": "0011",
    "platenumber": "苏A00001",
    "actualfriver": "南宝",
    "contactphone": "1236547",
    "actualserviceflight": "MU2755",
    "boardsensors": "定位传感器",
    "boardsensorsnumber": "001",
    "reportingtime": "15:40:00",
    "taskname": "散货装货",
    "onename": "前往指定位置",
    "onetime": getHM(47),
    "oneinformation": "到达指定位置",
    "oneinformationtime": getHM(49),
    "twoname": "撤离",
    "twotime": getHM(53),
    "twoinformation": "撤离至制定位置",
    "twoinformationtime": getHM(55),
    "stickId": "001",
    "startPoints": JSON.stringify(points.hwSanStart),
    "endPoints": JSON.stringify(points.hwSanEnd)
  })

  // 牵引车
  request.post('/tractorqycSs/add', {
    "id": 1,
    "ctime": "2022-11-03",
    "equipmentnumber": "6",
    "licenseplate": "苏A00006",
    "drivers": "刘六",
    "contactphone": "123589",
    "flightno": "MU2755",
    "vehicletype": "定位传感器",
    "sensornumber": "001",
    "longitude": null,
    "latitude": null,
    "locationtime": "15:40:00",
    "taskname": "航空器推出",
    "onename": "前往指定位置",
    "oneinstruction": getHM(54),
    "onefeedback": "到达指定位置",
    "onefeedbacktime": getHM(56),
    "twoname": "牵引航空器",
    "twoinstruction": getHM(57),
    "twofeedback": "牵引完成",
    "twofeedbacktime": getHM(58),
    "threename": '撤离',
    "threeinstruction": getHM(59),
    "threefeedback": '撤离完成至指定位置',
    "threefeedbacktime": getHM(61),
    "startPoints": JSON.stringify(points.qyStart),
    "endPoints": JSON.stringify(points.qyEnd),
    "qyPoints": JSON.stringify(points.qyTc)
  })

}

function popupClick(callback:Function) {
  PopupClickCallback = callback
}

function changePeople(callback:Function) {
  wranBtnClick = callback
}
function airPointOne() {
  const points = {
    fjStart: [
      [118.84701184630416, 31.73217744659702],
      [118.84763200970637, 31.731336976217737],
      [118.84574176177955, 31.730297254573113],
      [118.84610923479994, 31.729807948731775],
      [118.84537924595591, 31.729415476482384],
    ],
    fjEnd: [
      [118.84628303632272, 31.729571171679314],
      [118.84574176177955, 31.730297254573113],
      [118.84763200970637, 31.731336976217737],
      [118.84701184630416, 31.73217744659702],
    ],
    wscStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.8455606572811, 31.729839447918202],
      [118.84504273202487, 31.729561780491622],
      [118.84516649190856, 31.72940076396354]
    ],
    wscEnd: [
      [118.84516649190856, 31.72940076396354],
      [118.84504273202487, 31.729561780491622],
      [118.8455606572811, 31.729839447918202],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685],
    ],
    jycStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84567117398997, 31.7296891584195],
      [118.84527086377248, 31.729472300911937]
    ],
    jycEnd: [
      [118.84527086377248, 31.729472300911937],
      [118.84567117398997, 31.7296891584195],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685]
    ],
    csdcStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84570056689624, 31.729655296747502],
      [118.84539946494566, 31.729495576810532],
    ],
    csdcEnd: [
      [118.84539946494566, 31.729495576810532],
      [118.84570056689624, 31.729655296747502],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685],
    ],
    hwSanStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84566191790269, 31.729700997552797],
      [118.84531396188544, 31.72953776157434]
    ],
    hwSanEnd: [
      [118.84531396188544, 31.72953776157434],
      [118.84566191790269, 31.729700997552797],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685]
    ],
    sjStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84582287416126, 31.729481038220136],
      [118.84530719723278, 31.729240862448187],
    ],
    sjEnd: [
      [118.84530719723278, 31.729240862448187],
      [118.84582287416126, 31.729481038220136],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685],
    ],
    hwJiStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.8458400036457, 31.72946093765977],
      [118.84532276276705, 31.72917027169375]
    ],
    hwJiEnd: [
      [118.84532276276705, 31.72917027169375],
      [118.8458400036457, 31.72946093765977],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685]
    ],
    qyStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.84492220931791, 31.72918763847104],
      [118.8450025486866, 31.729221970681138]
    ],
    qyTc: [
      [118.8450025486866, 31.729221970681138],
      [118.84610949754236, 31.729807687627357],
      [118.84630087744594, 31.729547894077815],
    ],
    qyEnd: [
      [118.84630087744594, 31.729547894077815],
      [118.84590909169795, 31.729359650752805],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685]
    ]
  }
  pushData(points,1)
}
function airPointTwo() {
  const points = {
    fjStart: [
      [118.84701184630416, 31.73217744659702],
      [118.84763200970637, 31.731336976217737],
      [118.84574176177955, 31.730297254573113],
      [118.84644888940174, 31.729347438125103],
      [118.84571866651139, 31.72895847309768],
    ],
    fjEnd: [
      [118.84659987869234, 31.729143266572333],
      [118.84574176177955, 31.730297254573113],
      [118.84763200970637, 31.731336976217737],
      [118.84701184630416, 31.73217744659702],
    ],
    wscStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84600612873766, 31.729234880895245],
      [118.84545432608559, 31.72892658423934],
      [118.84546912081869, 31.72892255672869]
    ],
    wscEnd: [
      [118.84546912081869, 31.72892255672869],
      [118.84545432608559, 31.72892658423934],
      [118.84600612873766, 31.729234880895245],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685],
    ],
    jycStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84598735687388, 31.729258896385804],
      [118.84563124059282, 31.729061514912033]
    ],
    jycEnd: [
      [118.84563124059282, 31.729061514912033],
      [118.84598735687388, 31.729258896385804],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685]
    ],
    csdcStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84604221153107, 31.729192962116656],
      [118.84578343004786, 31.729056089175756],
    ],
    csdcEnd: [
      [118.84578343004786, 31.729056089175756],
      [118.84604221153107, 31.729192962116656],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685],
    ],
    hwSanStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84589126972935, 31.729391929597938],
      [118.8455544752575, 31.729219113550283]
    ],
    hwSanEnd: [
      [118.8455544752575, 31.729219113550283],
      [118.84589126972935, 31.729391929597938],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685]
    ],
    sjStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84614151325844, 31.729048996190805],
      [118.84565112176651, 31.728768423011967],
    ],
    sjEnd: [
      [118.84565112176651, 31.728768423011967],
      [118.84614151325844, 31.729048996190805],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685],
    ],
    hwJiStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8458215853032, 31.728019506720045],
      [118.8465866617021, 31.728446464732816],
      [118.84616295118053, 31.72902437910852],
      [118.84561209542792, 31.72872481262173]
    ],
    hwJiEnd: [
      [118.84561209542792, 31.72872481262173],
      [118.84616295118053, 31.72902437910852],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685]
    ],
    qyStart: [
      [118.84036970784949, 31.724725357790685],
      [118.84600615989937, 31.727765370853703],
      [118.8452964486231, 31.728729399402575],
      [118.84536798776124, 31.72876304530371]
    ],
    qyTc: [
      [118.84536798776124, 31.72876304530371],
      [118.84645250110361, 31.729340728171387],
      [118.84664026702856, 31.72908680831797],
    ],
    qyEnd: [
      [118.84664026702856, 31.72908680831797],
      [118.84627552039017, 31.7288672506324],
      [118.8465866617021, 31.728446464732816],
      [118.8458215853032, 31.728019506720045],
      [118.84600615989937, 31.727765370853703],
      [118.84036970784949, 31.724725357790685]
    ]
  }
  pushData(points,2)
}

export { locatorDevice, cancelLocator, popupClick,airPointOne,airPointTwo,changePeople }


