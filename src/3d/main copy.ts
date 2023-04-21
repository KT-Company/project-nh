import CesiumThree from './cesiumThree';
import * as Bol3D from './Bol3d.js'
import * as Cesium from 'cesium'
import "cesium/Source/Widgets/widgets.css";
import Move from './move';
import request from '../2d/api/request';
import ws from './websocket.js';

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
  xzList: any[] = [],
  qcList:any[] = [];
let speed = 30,
  focusModel: any,
  currentModel: any = null;
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
  stats: true,
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
    const showModel = ['wj', '757wk', '400k', 'qyc', 'jyc', 'wsc', 'sjptc1', 'sjptc2', 'gbc', 'hwqyc', 'cbc'];
    if (!showModel.includes(scene.name)) {
      scene.visible = false;
    }
    if (scene.name == 'wj') {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material.roughness = 50
        }
      })
      const axes = new Bol3D.AxesHelper(100)
      scene.add(axes)
      const material = new Bol3D.LineBasicMaterial({
        color: 0x0000ff
      });

      const points = [];
      points.push(new Bol3D.Vector3(300, 224, 0));
      points.push(new Bol3D.Vector3(-600, 224, 0));

      const geometry = new Bol3D.BufferGeometry().setFromPoints(points);

      const line = new Bol3D.Line(geometry, material);
      scene.add(line);
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
          child.rotation.y = -Math.PI - 0
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
      // object3d.wgs84 = [118.839511,31.725687]
    } else if (scene.name == 'jyc') {
      object3d.wgs84 = [118.839584, 31.725590]
    } else if (scene.name == 'wsc') {
      object3d.wgs84 = [118.839651, 31.725495]
    } else if (scene.name == 'gbc') {
      object3d.wgs84 = [118.839722, 31.725397]
    } else if (scene.name == 'hwqyc') {
      object3d.wgs84 = [118.839791, 31.725304]
    } else if (scene.name == 'cbc') {
      object3d.wgs84 = [118.839865, 31.725208]
    } else if (scene.name == 'csdc') {
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
    } else if (/x\d/.test(scene.name)) {
      xzList.push(scene)
    }
    container.object3d.push(object3d);
    const noOp = ['wj', '757wk', '400k', 'gzt', '757gzt']
    if (!noOp.includes(scene.name)) {
      sceneModel[scene.name] = object3d;
    }
  },
  onLoad() {
    container.three.renderer.logarithmicDepthBuffer = false

    // container.three.clickObjects = [];
    sceneModel['sjptc_ct'] && sceneModel['sjptc_ct'].threeGroud.add(sceneModel['sjptc_cw'].threeGroud)
    console.log(container.three);
    sceneModel['757'].threeGroud.visible = true;
    sceneModel['757'].wgs84 = [118.847479, 31.729158];
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
let isOpen = true;
// 绑定点击事件
container.addEventListener('click', function (res: any) {
  console.log(res.threeObj.object);
  
  const { longitude, latitude } = res.cartographic;
  // mToP('wsc', [longitude,latitude])
  openHCCM(sceneModel['757'].threeGroud,isOpen)
  isOpen = !isOpen;
})
// 设置模型位置
function mToP(model: any, wgs84: number[]) {
  const minRotation: any = {
    '400': -130,
    '757': 50,
    'qyc': -40,
    'jyc': -40,
    'csdc': -40,
    'sjptc_ct': -40,
    'wsc': 50
  }
  const { x, z } = Cesium.Cartesian3.fromDegrees(wgs84[0], wgs84[1]);
  const { position } = model.threeGroud;
  const point = new Bol3D.Vector3(x, position.y, z)
  const resPoint = point.sub(position)
  resPoint.x = resPoint.x + 1;
  const rotation = new Bol3D.Vector3(1, 0, 0).angleTo(resPoint) * 180 / Math.PI
  model.rotation = (resPoint.z < 0 ? rotation : - rotation) + minRotation[model.threeGroud.name];
  model.wgs84 = wgs84
}
// websocket 接收指令
ws.addEventListener('message', function (res) {
  console.log(res);
  
  const {data} = JSON.parse(res.data)
  if(data) {
    let model = container.object3d.find( (item:any) => item.threeGroud.userData.licenseplatenumber == data.licenseplatenumber && item.threeGroud.userData.type == data.type);
    if(!model) {
      let gltf = null;
      switch(data.type) {
        case '货物牵引车':
          gltf = sceneModel['hwqyc'].threeGroud.clone();
        break;
        case '传送带车':
          gltf = sceneModel['csdc'].threeGroud.clone();
        break;
        case '升降车平台':
          gltf = sceneModel['sjptc_ct'].threeGroud.clone();
        break;
        case '污水车':
          gltf = sceneModel['wsc'].threeGroud.clone();
        break;
        case '加油车':
          gltf = sceneModel['jyc'].threeGroud.clone();
        break;
        case '航空器牵引车':
          gltf = sceneModel['qyc'].threeGroud.clone();
        break;
      }
      gltf.userData.type = data.type;
      gltf.userData.licenseplatenumber = data.licenseplatenumber
      model = {
        threeGroud: gltf,
        wgs84: [data.longitudevehicleposition,data.vehiclelocationlatitude],
        rotation: 0
      }
      container.object3d.push(model)
    }else {
      mToP(model,[data.longitudevehicleposition,data.vehiclelocationlatitude])
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
  container.three.remove(model);
  const popup = model.children.find((item: any) => item.name == 'popup');
  if (popup) {
    popup.visible = false;
    popup.removeFromParent()
  }
}
// 聚焦模型位置
function locatorDevice(model: any): void {
  if(focusModel) (focusModel).removeFromParent()
  container.three.outlineObjects = [];
  const geometry = new Bol3D.BoxGeometry(1, 1, 1);
  const material = new Bol3D.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  focusModel = new Bol3D.Mesh(geometry, material);
  focusModel.name = 'box';
  let range = 16;
  if (model.name == '757' || model.name == '400') {
    range = 20
  }
  focusModel.position.set(0, -1 * range, 5);
  model.add(focusModel)
  model.traverse((child: any) => {
    if (child.isMesh && child.name !== 'box') container.three.outlineObjects.push(child)
  })
  const position = new Bol3D.Vector3();
  focusModel.getWorldPosition(position)
  const { longitude, latitude, height } = container.getCartographic(position.x, position.y, position.z);
  const loop = function () {
    focusModel.getWorldPosition(position)
    const target = new Cesium.Cartesian3(position.x, position.y, position.z);
    const offset = new Cesium.HeadingPitchRange(
    container.getHeading(position, model.position)
    ,container.getPitch(position, model.position)
    ,.1)
    container.viewer.camera.lookAt(target, offset);
  }

  container.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    orientation: {
      heading: container.getHeading(position, model.position),
      pitch: container.getPitch(position, model.position),
      roll: Cesium.Math.toRadians(0),
    },
    duration: 1,
    complete: function () {
      container.addEventListener('loop', loop)
    }
  })
}
// 取消聚焦
function cancelLocator(): void {
  focusModel.removeFromParent()
  container.three.outlineObjects = [];
  container.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(118.84241372564283, 31.73113275521421, 1006),
    orientation: {
      heading: Cesium.Math.toRadians(147.5345894894121),
      pitch: Cesium.Math.toRadians(-65.33366237306274),
      roll: Cesium.Math.toRadians(0.001012108706811133),
    },
    duration: 1,
  })
}


function openJCCM(scene: any, callback?: any): void {
  if (scene.name == '757') {
    const obj: any = {};
    scene.traverse((child: any) => {
      if (child.name == "jccm" || child.name == "对象350") {
        obj[child.name] = child;
      }
    })
    if (obj["jccm"].rotation.z == 0) {
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
    if (obj["400jcm"].rotation.y <= 0.00022627169056406543) {
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
    childList = scene.children.filter((child: any) => child.name == 'qcm' || child.name == 'cm08' || child.name == "对象358" || child.name == "对象357");
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
          num = y - rotate;
          if (num <= -3.2584138953324575e-7) {
            state1 = false
          }
        } else {
          num = y + rotate;
          if (num >= Math.PI) {
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
          if (num <= 0) {
            state2 = false
          }
        }
        child.rotation.z = num;
      }
      if (child.name == '对象358' && state3) {
        let num = 0;
        const y = child.rotation.y;
        child.visible = true;
        if (isOpen) {
          num = y + rotate;
          if (num >= -.4) {
            state3 = false
          }
        } else {
          num = y - rotate;
          if (num <= -Math.PI - .4) {
            state3 = false
            child.visible = false;
          }
        }
        child.rotation.y = num;
      }
      if (child.name == '对象357' && state4) {
        let num = 0;
        const y = child.rotation.y;
        child.visible = true;
        if (isOpen) {
          num = y + rotate;
          if (num >= -.4) {
            state4 = false
          }
        } else {
          num = y - rotate;
          if (num <= -Math.PI - .4) {
            state4 = false
            child.visible = false;
          }
        }
        child.rotation.y = num;
      }
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
          if (num <= 0) {
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
    case 'sjptc1':
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
  const hj = modelClone(sceneModel['gbc']);
  const hwqyc = modelClone(sceneModel['hwqyc']);
  hj.name = 'hj';
  hj.traverse((child: any) => {
    child.name = child.name.replace('对象', 'hj')
  })
  hj.rotation.y = 0
  for (let index = 0; index < num; index++) {
    const hj1 = hj.clone();
    hj1.position.set(3.5 + index * 3.9, 0, 0.04);
    hj1.name = 'hj' + index;
    hwqyc.add(hj1)
  }
  return hwqyc
}
// 货物装载到货架车 可能参数 jzx1,jzx2,jzx3,sh
function hwToHj(hjc: any, name: string): any {
  let hwIndex = 0;
  let hwName = name;
  hjc.traverse((child: any) => {
    if (/^hj\d$/.test(child.name)) {
      if (name == 'sh') {
        if (hwIndex > 2) hwIndex = 0;
        hwName = name + (hwIndex + 1)
      }
      if (sceneModel[hwName]) {
        const xz = modelClone(sceneModel[hwName]);
        xz.userData.name = 'xz';
        if (name == 'jzx1') {
          xz.position.set(0.4, 0.5, 0)
        } else if (name == 'sh') {
          xz.position.set(0.5, 0.5, 0)
          xz.rotateY(Math.PI / 2)
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

// 飞机入港
function modelMove(model: any, fj?: any, remove?: boolean): void {
  const model1 = typeof model === 'string' ? fj.userData[model] : remove ? model : modelClone(model);
  if (fj) {
    fj.userData[model.name] = model;
  } else {
    sceneModel[model1.name + 'kb'] = model1;
  }
  if (!model.userData.prevPoint) model1.visible = false;
  if (remove) model1.userData.remove = remove;
  currentModel = model1;
  if (!model.userData.prevPoint) {
    request({
      method: 'get',
      url: 'getPlaneSuspended?type=1'
    }).then((info: any) => {
      if (info.code == 200) {
        const popup = new Bol3D.POI.Popup3D({
          value: `<div style="background: rgba(1, 19, 67, 0.8);border: 1px solid #00a1ff;border-radius: 8px;font-size: 12px; color: #fff;padding:10px;">
                  <p class="name">航班号：${info.data[0].flightNo}</p>
                  <p>机型：${info.data[0].models}</p>
                  <p>目标机位：${info.data[0].targetReservation}</p>
              </div>`,
          position: [0, 20, 0],
          scale: [.2, .2, .2],
          className: model1.userData.name + ' popup3d',
          closeVisible: 'visible'
        })
        popup.name = 'popup';
        popup.visible = false;
        model1.userData.popup = popup
        model1.add(popup)
      }
    })
  }
}
// 轮挡就位
function ldMove(model: any): void {
  const lundang1 = sceneModel['lundang'].clone();
  const lundang2 = sceneModel['lundang'].clone();
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
  currentModel = fj
}
// 飞机牵引车撤退
function fjQycMove3(fj: any): void {
  fj.userData.direction = false;
  const qyc = fj.userData['qyc']
  const position = new Bol3D.Vector3();
  qyc.getWorldPosition(position)
  qyc.removeFromParent();
  qyc.position.set(position.x, position.y, position.z)
  container.three.attach(qyc);
  currentModel = qyc;
}
// 加油车接管动画
function jycMove2(fj: any): void {
  const model = fj.userData['jyc'];
  const mixer1 = new Bol3D.AnimationMixer(model);
  const move = mixer1.clipAction(container.three.sceneAnimations['jyc'][0].clone()) // start
  container.three.mixers.push(mixer1);
  model.userData.mixer = move;
  move.loop = Bol3D.LoopOnce;
  move.time = 3.3333332538604736;
  move.timeScale = -1;
  move.clampWhenFinished = true;
  move.paused = false;
  move.play();
  if (fj.name == '400') {
    moveOff(move, .85, undefined, true)
  }
}
// 加油车拔管动画
function jycMove3(fj: any): void {
  const model = fj.userData['jyc'];
  const move = model.userData.mixer;
  move.timeScale = 1;
  move.clampWhenFinished = true;
  move.paused = false;
  move.play();
}
// 污水车接管动画
function wscMove2(fj: any): void {
  const model = fj.userData['wsc'];
  const mixer1 = new Bol3D.AnimationMixer(model)
  const move = mixer1.clipAction(container.three.sceneAnimations["wsc"][0].clone()) // start
  container.three.mixers.push(mixer1);
  model.userData.mixer = move;
  move.loop = Bol3D.LoopOnce;
  move.timeScale = 1;
  move.clampWhenFinished = true;
  move.paused = false;
  move.play();
  if (fj.name == '400') {
    moveOff(move, .7, undefined, true)
  }
}
// 货物牵引车就位
function hwqycMove(fj: any, type: string, num: number = 4): void {
  const hjc = hwToHj(hjToQyc(num), type);
  hjc.position.set(-555, 0.04, 62);
  hjc.userData.name = 'hwqyckb';
  fj.userData['hwqyckb'] = hjc;
  currentModel = hjc;

}
// 传送带动画
function csdMove2(fj: any): void {
  const model = fj.userData['csdc']
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
  if (fj.name == '400') {
    if (fj.userData.hcIndex == 1) {
      moveOff(move, 1.5)
    } else {
      moveOff(move, 1.8)
    }
  }
}
// 传送带上货
function csdInfj(fj: any): void {
  const model = fj.userData['csdc'];
  const hjc = fj.userData['hwqyc'];
  let num = 0;
  let index = 0;
  const shList: any = []
  const csd = model.getObjectByName("CT0611");
  hjc.traverse((child: any) => {
    if (child.userData.name == 'xz') {
      shList.push(child)
    }
  })
  model.userData.running = true;
  function sh() {
    const xz = xzList[index].clone();
    xz.position.set(0, 0, 0);
    xz.rotateX(Math.PI / 2);
    xz.visible = true;
    csd.add(xz);
    new Bol3D.TWEEN.Tween(xz.position).to({
      x: -6.8
    }, 5000).start().onComplete(() => {
      xz.removeFromParent()
      num++;
      if (num % 20 == 0) {
        if (num / 20 < shList.length) {
          shList[num / 20 - 1].visible = false
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
// 传送带下货
function csdOutfj(fj: any): void {
  const model = fj.userData['csdc'];
  const hjc = fj.userData['hwqyc'];

}
// 上散货保障车撤离
function csdcOutMove(fj: any): void {
  const model = fj.userData['csdc'];
  const hjc = fj.userData['hwqyc'];
  model.userData.running = false;
  hjc.traverse((child: any) => {
    if (child.userData.name == 'xz') child.removeFromParent();
  })
  const timer1 = setTimeout(() => {
    clearTimeout(timer1)
  }, 1000);
  const timer2 = setTimeout(() => {
    clearTimeout(timer2)
    equipmentReverseMove(fj, model.name, () => {
    })
  }, 6000);
}

// 设备车倒放动画
function equipmentReverseMove(fj: any, type: string, callback?: any): void {
  const model: any = fj.userData[type]
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

function htmlbtn() {
  const btnBox: any = document.createElement('div');
  btnBox.style.position = 'fixed';
  btnBox.style.right = '30%';
  btnBox.style.top = '20%';
  btnBox.style.zIndex = 4;
  const btn1: any = document.createElement('button');
  btn1.style.margin = '10px 0px';
  btn1.style.display = 'block';
  btn1.innerText = '飞机入港';
  btn1.onclick = function () {
    if (sceneModel['757'] && !sceneModel['757kb']) modelMove(sceneModel['757'])
  }
  btnBox.appendChild(btn1)
  const btn2: any = btn1.cloneNode();
  btn2.innerText = '污水车就位';
  btn2.onclick = function () {
    if (sceneModel['757kb']) modelMove(sceneModel['wsc'], sceneModel['757kb'])
  }
  btnBox.appendChild(btn2)
  const btn3: any = btn1.cloneNode();
  btn3.innerText = '污水车接管';
  btn3.onclick = function () {
    if (sceneModel['757kb']) wscMove2(sceneModel['757kb'])
  }
  btnBox.appendChild(btn3)
  const btn4: any = btn1.cloneNode();
  btn4.innerText = '污水车拔管';
  btn4.onclick = function () {
    if (sceneModel['757kb']) equipmentReverseMove(sceneModel['757kb'], 'wsc')
  }
  btnBox.appendChild(btn4)
  const btn5: any = btn1.cloneNode();
  btn5.innerText = '污水车撤退';
  btn5.onclick = function () {
    if (sceneModel['757kb']) modelMove('wsc', undefined, true)
  }
  btnBox.appendChild(btn5)
  const btn6: any = btn1.cloneNode();
  btn6.innerText = '加油车就位';
  btn6.onclick = function () {
    if (sceneModel['757kb']) modelMove(sceneModel['jyc'], sceneModel['757kb'])
  }
  btnBox.appendChild(btn6)
  const btn7: any = btn1.cloneNode();
  btn7.innerText = '加油车接管';
  btn7.onclick = function () {
    if (sceneModel['757kb']) jycMove2(sceneModel['757kb'])
  }
  btnBox.appendChild(btn7)
  const btn8: any = btn1.cloneNode();
  btn8.innerText = '加油车拔管';
  btn8.onclick = function () {
    if (sceneModel['757kb']) jycMove3(sceneModel['757kb'])
  }
  btnBox.appendChild(btn8)
  const btn9: any = btn1.cloneNode();
  btn9.innerText = '加油车撤退';
  btn9.onclick = function () {
    if (sceneModel['jyckb']) modelMove('jyc', undefined, true)
  }
  btnBox.appendChild(btn9)
  const btn10: any = btn1.cloneNode();
  btn10.innerText = '牵引车就位';
  btn10.onclick = function () {
    if (sceneModel['757kb']) modelMove(sceneModel['qyc'])
  }
  btnBox.appendChild(btn10)
  const btn11: any = btn1.cloneNode();
  btn11.innerText = '牵引车推出';
  btn11.onclick = function () {
    if (sceneModel['qyckb']) fjQycMove2(sceneModel['757kb'])
  }
  btnBox.appendChild(btn11)
  const btn12: any = btn1.cloneNode();
  btn12.innerText = '牵引车撤退';
  btn12.onclick = function () {
    if (sceneModel['qyckb']) fjQycMove3(sceneModel['757kb'])
  }
  btnBox.appendChild(btn12)
  const btn13: any = btn1.cloneNode();
  btn13.innerText = '飞机离岗';
  btn13.onclick = function () {
    if (sceneModel['757kb']) modelMove(sceneModel['757kb'], undefined, true)
  }
  btnBox.appendChild(btn13)
  const btn14: any = btn1.cloneNode();
  btn14.innerText = '聚焦飞机';
  btn14.onclick = function () {
    if (sceneModel['757kb']) locatorDevice(sceneModel['757kb'])
  }
  btnBox.appendChild(btn14)
  const btn15: any = btn1.cloneNode();
  btn15.innerText = '取消聚焦';
  btn15.onclick = function () {
    cancelLocator()
  }
  btnBox.appendChild(btn15)

  const btn16: any = btn1.cloneNode();
  btn16.innerText = '传送带车就位';
  btn16.onclick = function () {
    if (sceneModel['757kb']) modelMove(sceneModel['csdc'])
  }
  btnBox.appendChild(btn16)

  const btn17: any = btn1.cloneNode();
  btn17.innerText = '散货牵引车就位';
  btn17.onclick = function () {
    if (sceneModel['757kb']) hwqycMove(sceneModel['757kb'], 'sh')
  }
  btnBox.appendChild(btn17)

  const btn18: any = btn1.cloneNode();
  btn18.innerText = '传送带升起';
  btn18.onclick = function () {
    if (sceneModel['757kb']) csdMove2(sceneModel['757kb'])
  }
  btnBox.appendChild(btn18)

  const btn19: any = btn1.cloneNode();
  btn19.innerText = '传送带下降';
  btn19.onclick = function () {
    if (sceneModel['757kb']) equipmentReverseMove(sceneModel['757kb'], 'csdc')
  }
  btnBox.appendChild(btn19)

  const btn20: any = btn1.cloneNode();
  btn20.innerText = '散货上货';
  btn20.onclick = function () {
    if (sceneModel['757kb']) csdInfj(sceneModel['757kb'])
  }
  btnBox.appendChild(btn20)
  const btn21: any = btn1.cloneNode();
  btn21.innerText = '散货下货';
  btn21.onclick = function () {
    if (sceneModel['757kb']) csdOutfj(sceneModel['757kb'])
  }
  btnBox.appendChild(btn21)
  const btn22: any = btn1.cloneNode();
  btn22.innerText = '上散货保障车撤离';
  btn22.onclick = function () {
    if (sceneModel['csdckb']) csdcOutMove(sceneModel['757kb'])
  }
  btnBox.appendChild(btn22)

  // document.body.appendChild(btnBox)
}
htmlbtn()
