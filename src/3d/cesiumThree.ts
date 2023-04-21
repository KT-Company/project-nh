import * as Cesium from 'cesium'
import * as Bol3D from './Bol3d.js';
interface cesiumOption {
    container: string | Element,
    imageryUrl?: string,
    minWGS84?: number[],
    maxWGS84?: number[],
    centerWGS84?: number[],
    creditContainer?: string | Element
    camera?: any
}
export default class CesiumThree {
    viewer: any = null
    private imageryUrl: string = (window as any).GISBaseURL + '/geoserver/cesium/wms';
    private minWGS84: number[] = [115.39, 38.9];
    private maxWGS84: number[] = [117.39, 40.9];
    private _listeners: any;
    three: any;
    threeContainer: Element | null;
    cesiumContainer: Element | null;
    cesiumOption:any;
    threeOption:any
    object3d: any[] = [];
    constructor(cesiumOption: cesiumOption, threeOption: any) {
        if (!(threeOption.container instanceof Element)) threeOption.container = document.querySelector(threeOption.container)
        this.threeContainer = threeOption.container
        this.cesiumContainer = cesiumOption.container instanceof Element ? cesiumOption.container : document.querySelector(cesiumOption.container);
        this.cesiumOption = cesiumOption;
        this.threeOption = threeOption;
        if (cesiumOption.imageryUrl) this.imageryUrl = cesiumOption.imageryUrl as string;
        this.minWGS84 = cesiumOption.minWGS84 || this.minWGS84;
        this.maxWGS84 = cesiumOption.maxWGS84 || this.maxWGS84;
        this.init(() => {
            const destination = cesiumOption?.camera?.destination ?? [(this.minWGS84[0] + this.maxWGS84[0]) / 2,
            ((this.minWGS84[1] + this.maxWGS84[1]) / 2) - 1, 20000]
            const center = Cesium.Cartesian3.fromDegrees( destination[0], destination[1], destination[2] );
            this.viewer.camera.flyTo({
                destination: center,
                orientation: {
                    heading: Cesium.Math.toRadians(cesiumOption?.camera?.heading ?? 0),
                    pitch: Cesium.Math.toRadians(cesiumOption?.camera?.pitch ?? -60),
                    roll: Cesium.Math.toRadians(cesiumOption?.camera?.roll ?? 0)
                },
                duration: 3
            });
        })
        this.loop()
    }
    init(callback:Function) {
        this.initCesium(this.cesiumOption)
        if(this.threeOption){
            const onLoad:any = this.threeOption?.onLoad ?? null;
            if(onLoad) delete this.threeOption.onLoad
            this.initThree({
                ...this.threeOption,
                onLoad: () => {
                    callback()
                    onLoad()
                }
            })
        }else {
            callback()
        }
    }
    initCesium(cesiumOption: any) {
        // 设置默认的视角为中国
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
            // 西边经度
            89.5,
            // 南边维度
            20.4,
            // 东边经度
            110.4,
            // 北边维度
            61.2
        );

        this.viewer = new Cesium.Viewer(cesiumOption.container, {
            animation: false,
            infoBox: false,
            selectionIndicator: false,
            shadows: true,
            shouldAnimate: true,
            baseLayerPicker: false,
            fullscreenButton: false,
            vrButton: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            timeline: false,
            navigationHelpButton: false,
            imageryProvider: new Cesium.TileMapServiceImageryProvider({
                url: Cesium.buildModuleUrl("./Assets/Textures/NaturalEarthII"),
            })
        });
        this.onMouseClick(this.viewer)
        const imageryProvider = new Cesium.WebMapServiceImageryProvider({
            url: this.imageryUrl,
            layers: 'cesium:cesiumGroup',
            parameters: {
                service: 'wms',
                format: 'image/png',
                transparent: false,
            }
        })
        // this.viewer.imageryLayers.remove(this.viewer.imageryLayers.get(0));
        this.viewer.imageryLayers.addImageryProvider(imageryProvider)
        this.viewer._cesiumWidget._creditContainer.style.display = "none";
        // 设置抗锯齿
        this.viewer.scene.postProcessStages.fxaa.enabled = true;
        // 修改鼠标控制地图视图的默认行为：左键拖动，右键旋转
        this.viewer.scene.screenSpaceCameraController.zoomEventTypes = [
            Cesium.CameraEventType.WHEEL,
            Cesium.CameraEventType.MIDDLE_DRAG,
            // Cesium.CameraEventType.PINCH,
        ];
        this.viewer.scene.screenSpaceCameraController.tiltEventTypes = [
            Cesium.CameraEventType.RIGHT_DRAG,
            // Cesium.CameraEventType.PINCH,
            {
                eventType: Cesium.CameraEventType.RIGHT_DRAG,
                modifier: Cesium.KeyboardEventModifier.CTRL,
            },

            {
                eventType: Cesium.CameraEventType.MIDDLE_DRAG,
                modifier: Cesium.KeyboardEventModifier.CTRL,
            },
        ];
        this.viewer.scene.sun.show = true;
        this.viewer.scene.globe.enableLighting = true;
        this.viewer.shadows = true;
    }

    initThree(threeOption: any) {
        this.three = new Bol3D.Container(threeOption)
    }
    /**
     * 鼠标点击地图事件
     */
    onMouseClick(viewer: any) {
        const _this = this;
        // 开启深度测试
        viewer.scene.globe.depthTestAgainstTerrain = true;
        new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction(function (pick: any) {
            const threeObj: any = _this.getThreeClick(_this.cesiumContainer as Element, _this.three.renderer.domElement as Element, pick.position)
            const res = _this.getCartographic(_this.getCartesian(viewer, pick.position));
            const pickObj = viewer.scene.pick(pick.position);
            _this.dispatchEvent('click',{
                threeObj,
                pickObj,
                cartographic: res
            })
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    // 获取两点之间的朝向 ,返回弧度
    getHeading(pointA: Cesium.Cartesian3 | Bol3D.Vector3, pointB: Cesium.Cartesian3 | Bol3D.Vector3): number {
        if(pointA instanceof Bol3D.Vector3) pointA = new Cesium.Cartesian3(pointA.x,pointA.y,pointA.z);
        if(pointB instanceof Bol3D.Vector3) pointB = new Cesium.Cartesian3(pointB.x,pointB.y,pointB.z);
        
        //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
        //向量AB
        const positionvector = new Cesium.Cartesian3()
        Cesium.Cartesian3.subtract(pointB, pointA, positionvector);
        //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
        //AB为世界坐标中的向量
        //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
        const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
        
        //归一化
        const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
        
        //heading
        const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
        return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
    }
    // 获取两点之间的仰角 ,返回弧度
    getPitch(pointA: Cesium.Cartesian3 | Bol3D.Vector3, pointB: Cesium.Cartesian3 | Bol3D.Vector3): number {
        if(pointA instanceof Bol3D.Vector3) pointA = new Cesium.Cartesian3(pointA.x,pointA.y,pointA.z);
        if(pointB instanceof Bol3D.Vector3) pointB = new Cesium.Cartesian3(pointB.x,pointB.y,pointB.z);
        const transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
        const vector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
        const direction = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transfrom, transfrom), vector, vector);
        Cesium.Cartesian3.normalize(direction, direction);
        //因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
        return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
    }
    /**
     * 坐标转换
     */
    // 将屏幕坐标转为笛卡尔系坐标
     getCartesian(viewer: any, position: any) {
        let cartesian: any = null;
        const feature = viewer.scene.pick(position);
        if (viewer.scene.pickPositionSupported && Cesium.defined(feature) && feature.content) {
            cartesian = viewer.scene.pickPosition(position);
        } else if (feature instanceof Cesium.Cesium3DTileFeature) {
            cartesian = viewer.scene.pickPosition(position);
        } else {
            cartesian = viewer.scene.pickPosition(position);
        }
        return cartesian
    }
    // 将笛卡尔系坐标转为经纬度
    getCartographic(x:number | Cesium.Cartesian3 | Bol3D.Vector3,y?:number,z?:number) {
        let cartesian = x;
        if(typeof cartesian === 'number') {
            cartesian = new Cesium.Cartesian3(x as number,y,z)
        }else if(cartesian instanceof Bol3D.Vector3) {
            cartesian = new Cesium.Cartesian3((x as Bol3D.Vector3).x,(x as Bol3D.Vector3).y,(x as Bol3D.Vector3).z)
        }
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian as Cesium.Cartesian3); // 结果对象中的值将以弧度表示。
        const longitude = Number(Cesium.Math.toDegrees(cartographic.longitude));
        const latitude = Number(Cesium.Math.toDegrees(cartographic.latitude));
        const height = Number(cartographic.height);
        return {
            longitude,
            latitude,
            height
        };
    }
    getThreeClick(cesiumContainer: any, threeContainer: any, cesiumPosition: any): void {
        const raycaster: Bol3D.Raycaster = new Bol3D.Raycaster();
        const pointer: Bol3D.Vector2 = new Bol3D.Vector2();
        const cesiumP = cesiumContainer.getBoundingClientRect()
        const { width, height, top, left } = threeContainer.getBoundingClientRect()
        const offsetx = threeContainer.offsetLeft
        const offsety = threeContainer.offsetTop

        const x = cesiumPosition.x + cesiumP.x - left + offsetx;
        const y = cesiumPosition.y + cesiumP.y - top + offsety;
        pointer.x = (x / width) * 2 - 1;
        pointer.y = - (y / height) * 2 + 1;
        const clickObjects = this.three.clickObjects;
        // 通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(pointer, this.three.orbitCamera);

        // 计算物体和射线的焦点
        const intersects = raycaster.intersectObjects(clickObjects);
        return intersects[0]
    }
    addEventListener(type: string, func: Function) {
        if (typeof this._listeners === 'undefined') this._listeners = {};
        const listeners = this._listeners;
        if (!listeners[type]) listeners[type] = [];
        if (listeners[type].findIndex((item: any) => item === func) === -1) listeners[type].push(func)
    }
    removeEventListener(type: string, func: Function) {
        if (this._listeners?.[type]) {
            const index = this._listeners[type].findIndex((item: any) => item === func);
            if (index > -1) {
                delete this._listeners[type][index]
            }
        }
    }
    dispatchEvent(type: string, event?: any) {
        if (this._listeners?.[type]?.length > 0) {
            this._listeners[type].forEach((item: any) => {
                item(event)
            })
        }
    }

    loop() {
        requestAnimationFrame(() => { this.loop() });
        this.renderCesium();
        this.renderThree();
        this.dispatchEvent('loop')
    }
    renderCesium() {
        this.viewer.render();
    }
    cartToVec(cart: any) {
        return new Bol3D.Vector3(cart.x, cart.y, cart.z);
    }
    renderThree() {
        this.three.orbitCamera.fov = Cesium.Math.toDegrees(this.viewer.camera.frustum.fovy) // ThreeJS FOV is vertical
        // Configure Three.js meshes to stand against globe center position up direction
        this.object3d.forEach((item: any) => {
            // item.scale.set(10,10,10)
            // convert lat/long center position to Cartesian3
            const center = Cesium.Cartesian3.fromDegrees(item?.wgs84?.[0] ?? (this.minWGS84[0] + this.maxWGS84[0]) / 2, item?.wgs84?.[1] ?? (this.minWGS84[1] + this.maxWGS84[1]) / 2,);
            item.threeGroud.position.copy(this.cartToVec(center));
            // if(item.name == '757wk')console.log(item.position);
            // get forward direction for orienting model
            const centerHigh = Cesium.Cartesian3.fromDegrees(item?.wgs84?.[0] ?? (this.minWGS84[0] + this.maxWGS84[0]) / 2, item?.wgs84?.[1] ?? (this.minWGS84[1] + this.maxWGS84[1]) / 2, 1);

            // use direction from bottom left to top left as up-vector
            const bottomLeft = this.cartToVec(Cesium.Cartesian3.fromDegrees(this.minWGS84[0], this.minWGS84[1]));
            const topLeft = this.cartToVec(Cesium.Cartesian3.fromDegrees(this.minWGS84[0], this.maxWGS84[1]));
            const latDir = new Bol3D.Vector3().subVectors(bottomLeft, topLeft).normalize();

            // configure entity position and orientation
            item.threeGroud.lookAt(this.cartToVec(centerHigh));
            item.threeGroud.up.copy(latDir);
            item.threeGroud.rotateOnAxis(new Bol3D.Vector3(0, 0, 1), Math.PI / 180 * (212.5 + (item?.rotation ?? 0)))
        })
        // Clone Cesium Camera projection position so the
        // Three.js Object will appear to be at the same place as above the Cesium Globe
        this.three.orbitCamera.matrixAutoUpdate = false;
        const cvm = this.viewer.camera.viewMatrix;
        const civm = this.viewer.camera.inverseViewMatrix;
        this.three.orbitCamera.lookAt(0, 0, 0);

        this.three.orbitCamera.matrixWorld.set(
            civm[0], civm[4], civm[8], civm[12],
            civm[1], civm[5], civm[9], civm[13],
            civm[2], civm[6], civm[10], civm[14],
            civm[3], civm[7], civm[11], civm[15]
        );
        this.three.orbitCamera.matrixWorldInverse.set(
            cvm[0], cvm[4], cvm[8], cvm[12],
            cvm[1], cvm[5], cvm[9], cvm[13],
            cvm[2], cvm[6], cvm[10], cvm[14],
            cvm[3], cvm[7], cvm[11], cvm[15]
        );
        const width = (this.threeContainer as Element).clientWidth;
        const height = (this.threeContainer as Element).clientHeight;
        const aspect = width / height;
        this.three.orbitCamera.aspect = aspect;
        this.three.orbitCamera.updateProjectionMatrix();

        this.three.sceneComposer.render()
    }
}