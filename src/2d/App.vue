<script>
import Card from "./component/Card.vue";
import { ref, watch, computed } from "vue";
import ProgressBar from "@/2d/component/ProgressBar";
import { getFlightInfos, getGuaranteeStatistics, getTianqi, searchGoodsInfo, getOperation } from "./api/index";
import { locatorDevice, cancelLocator, popupClick, airPointOne, airPointTwo } from "../3d/main.ts"
import { debounce } from 'lodash-es'
import dialogHook from './dialogHook'

export default {
  name: "App",
  components: {
    ProgressBar,
    Card,
  },
  setup(props, context) {
    const tableData = ref([]);
    const rateData = ref([
      {
        icon: require("@/assets/imgs/时间.png"),
        name: "航班平均延误",
        nameUnit: "（分钟）",
        val: "",
        valUnit: "min/架",
      },
      {
        icon: require("@/assets/imgs/出港 拷贝 3.png"),
        name: "航班离港正常率",
        nameUnit: "",
        val: "",
        valUnit: "",
      },
      {
        icon: require("@/assets/imgs/出港 拷贝 3.png"),
        name: "每小时离港正常率",
        nameUnit: "",
        val: "",
        valUnit: "",
      },
      {
        icon: require("@/assets/imgs/飞机.png"),
        name: "机场放行正常率",
        nameUnit: "",
        val: "",
        valUnit: "",
      },
      {
        icon: require("@/assets/imgs/飞机.png"),
        name: "保障航班量",
        nameUnit: "（架/时）",
        val: "",
        valUnit: "",
      },
    ]);
    const weatherData = ref({
      icon: require("@/assets/imgs/3.png"),
      temperature: "18度",
      brief: "多云",
      en: "WEF",
      otherInfos: [
        { key: "气压", val: "104" },
        { key: "能见度", val: "> 十公里" },
        { key: "露点", val: "-0.1度" },
        { key: "风速", val: "东北风2m/s" },
      ],
      periodList: [
        { icon: require("@/assets/imgs/组 21 拷贝.png"), time: "14:00" },
        { icon: require("@/assets/imgs/组 38.png"), time: "15:00" },
        { icon: require("@/assets/imgs/组 40.png"), time: "16:00" },
        { icon: require("@/assets/imgs/组 21 拷贝.png"), time: "18:00" },
        { icon: require("@/assets/imgs/组 21 拷贝.png"), time: "19:00" },
        { icon: require("@/assets/imgs/组 40.png"), time: "20:00" },
        { icon: require("@/assets/imgs/组 38.png"), time: "21:00" },
      ],
    });
    const videoList = ref([
      {
        name: "全景监控",
        video: require("@/2d/assets/video/1.mp4"),
        date: "2022-09-14",
      },
      {
        name: "航班保障监控",
        video: require("@/2d/assets/video/2.mp4"),
        date: "2022-09-14",
      },
    ]);
    const guaranteeData = ref([
      {
        name: "加油",
        val: 50,
        date: "23:02",
      },
      {
        name: "污水",
        val: 60,
        date: "23:02",
      },
      {
        name: "主货舱卸货",
        val: 75,
        date: "23:02",
      },
      {
        name: "主货舱装货",
        val: 50,
        date: "23:02",
      },
      {
        name: "腹舱卸货",
        val: 70,
        date: "23:02",
      },
      {
        name: "腹舱装货",
        val: 50,
        date: "23:02",
      },
    ]);
    getOperation().then(({ data }) => {
      guaranteeData.value = data.map(item => ({
        name: item.conditionVehicle,
        val: item.accounted,
        date: item.consuming
      }))
    })
    const guaranteeOrflight = ref("flight")
    popupClick(() => {
      guaranteeOrflight.value = "guarantee"


    })
    // response
    const scaleH = ref(window.innerHeight / 1080);
    const scaleW = ref(window.innerWidth / 1920);
    window.addEventListener(
      "resize",
      () => {
        scaleH.value = window.innerHeight / 1080;
        scaleW.value = window.innerWidth / 1920
      }
    );
    const scale = computed(() => Math.min(scaleH.value, scaleW.value))
    // api
    getFlightInfos().then((res) => {
      tableData.value = res.data;
    });

    getGuaranteeStatistics().then((res) => {
      console.log(res);
      rateData.value[0].val = res.data[0].aaverageFlightDelay;
      rateData.value[1].val = res.data[0].bflightDepartureRate;
      rateData.value[2].val = res.data[0].cnormalDepartureRatePerHour;
      rateData.value[3].val = res.data[0].dairportReleaseOnTimeRate;
      rateData.value[4].val = res.data[0].ensureFlightCapacity;
    });
    getTianqi().then((res) => {
      const hours = new Date().getHours();
      weatherData.value.temperature = res.data[0].tem;
      weatherData.value.brief = res.data[0].wea;
      weatherData.value.otherInfos[0].val = res.data[0].pressure;
      weatherData.value.otherInfos[1].val = res.data[0].visibility;
      weatherData.value.otherInfos[2].val = res.data[0].win_speed;
      weatherData.value.otherInfos[3].val =
        res.data[0].hours[hours].win + res.data[0].hours[hours].win_speed;
      const dayHours = res.data[0].hours
        .slice(16)
        .concat(res.data[0].hours.slice(0, 16))
        .concat(res.data[1].hours.slice(16, 23));
      const sevenHours = dayHours.slice(hours, hours + 7);
      weatherData.value.periodList.forEach((item, i) => {
        item.icon = "./imgs/" + sevenHours[i].wea_img + ".png";
        item.time = parseInt(sevenHours[i].hours) + ":00";
      });
    });

    // search
    const flightVal = ref("");
    const goodsVal = ref("");
    watch(
      () => flightVal.value,
      (newVal) => searchFlight(newVal)
    );
    watch(
      () => goodsVal.value,
      (newVal) => searchGoods(newVal)
    );

    function searchFlight(content) {
      tableData.value.forEach(
        (item) =>
        (item.searchActive =
          !!content &&
          new RegExp(content, "g").test(
            item.flightNo + item.immediatelyModels
          ))
      );
    }
    const tableRowClass = ({ row }) => (row.searchActive ? "active-row" : "");
    const rowClick = (row, col, event) => {
      locatorDevice(row.flightNo)
    }

    // 
    const goodsInfo = ref()
    const isShowSearchRes = computed(() => !!goodsInfo.value);

    function _searchGoods(content) {
      searchGoodsInfo({ number: content }).then(res => {
        goodsInfo.value = res.data
      })
    }

    const searchGoods = debounce(_searchGoods, 200)


    const backHandle = () => {
      guaranteeOrflight.value = "flight"
      cancelLocator()
    }


    return {
      tableData,
      rateData,
      weatherData,
      videoList,
      guaranteeData,
      scale,
      flightVal,
      goodsVal,
      searchFlight,
      tableRowClass,
      isShowSearchRes,
      rowClick,
      goodsInfo,
      backHandle,
      guaranteeOrflight,
      ...dialogHook(),
      airPointOne, airPointTwo
    };
  },
};
// import {openJzx1Move,openShMove, openQycMove, openGztMove, openWscMove} from '@/3d/main'
</script>
<template>
  <div class="home">
    <!-- <ul>
        <li class="" @click="openJzx1Move">openJzx1Move</li>
        <li class="" @click="openShMove">openShMove</li>
        <li class="" @click="openQycMove">openQycMove</li>
        <li class="" @click="openGztMove">openGztMove</li>
        <li class="" @click="openWscMove">openWscMove</li>
    </ul> -->
    <!-- header -->
    <header class="header"></header>
    <!-- main content -->
    <section class="main-container">
      <div class="left-box" :style="`transform: scale(${scale})`">
        <card title="机场搜索">
          <div class="card-search-content" style="margin-top: 18px">
            <input class="search-inp" type="text" v-model="flightVal" placeholder="请输入航班名称..." />
            <img class="search-btn" src="~@/assets/imgs/2.png" />
          </div>
          <div class="card-search-content">
            <input class="search-inp" type="text" v-model="goodsVal" placeholder="请输入货物编号..." />
            <img class="search-btn" src="~@/assets/imgs/2.png" />
            <div class="search-res-box" v-show="isShowSearchRes">
              <p class="search-res">
                <span class="search-res-key">位置：{{ goodsInfo && goodsInfo?.location }}</span>
                <span class="search-res-val"></span>
              </p>
              <p class="search-res">
                <span class="search-res-key">状态信息：{{ goodsInfo && goodsInfo?.state }}</span>
                <span class="search-res-val"></span>
              </p>
              <div class="close" @click="goodsInfo = null"></div>
            </div>
          </div>
        </card>

        <card title="航班详情" style="margin-top: 2px">
          <div class="card-content" style="margin-top: 10px">
            <el-table :data="tableData" style="width: 100%" height="260" :row-class-name="tableRowClass"
              @row-click="rowClick">
              <el-table-column :width="90">
                <template #header>
                  <div>
                    <p style="text-align: left">航班号</p>
                    <p class="mt-3 no-wrap" style="text-align: left">
                      机号/机型
                    </p>
                  </div>
                </template>
                <template v-slot:default="{ row }">
                  <div class="base-table-text">
                    <p>{{ row.flightNo }}</p>
                    <p class="mt-3 no-wrap">{{ row.immediatelyModels }}</p>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :width="60">
                <template #header>
                  <div>
                    <p>出发地</p>
                    <p mt-3>目的地</p>
                  </div>
                </template>
                <template v-slot:default="{ row }">
                  <div class="base-table-text">
                    <p>{{ row.origin }}</p>
                    <p class="mt-3">{{ row.destination }}</p>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="track" :width="60" label="跑道">
                <template v-slot:default="{ row }">
                  <span class="track">{{ row.runway }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="seat" :width="54" label="机位">
                <template v-slot:default="{ row }">
                  <span style="font-weight: bold">{{ row.reservation }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="adsb" :width="70" label="ADS-B">
                <template v-slot:default="{ row }">
                  <span class="adsb">{{ row.adsb }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="takeOff" :width="50" label="起飞">
                <template v-slot:default="{ row }">
                  <span style="color: rgba(235, 205, 114, 1)">{{
                      row.takeOff
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="arrive" label="到达" :width="60"></el-table-column>
            </el-table>
          </div>
        </card>

        <card title="航班正常率" style="margin-top: 20px" v-show="guaranteeOrflight === 'flight'">
          <ul class="flight-statistics-list" style="margin-top: 24px">
            <li class="flight-statistics-item" v-for="item in rateData">
              <div class="flight-statistics-item-icon">
                <img :src="item.icon" alt="" />
              </div>
              <p class="flight-statistics-item-name">
                <span class="flight-statistics-item-name-text">{{
                    item.name
                }}</span>
                <span class="flight-statistics-item-name-unit">{{
                    item.nameUnit
                }}</span>
              </p>
              <p class="flight-statistics-item-val">
                <span class="flight-statistics-item-val-text">{{
                    item.val
                }}</span>
                <span class="flight-statistics-item-val-unit">{{
                    item.valUnit
                }}</span>
              </p>
            </li>
          </ul>
        </card>
        <card title="过站保障作业" style="margin-top: 20px" v-show="guaranteeOrflight === 'guarantee'">
          <ul class="guarantee-statistics-list" style="margin-top: 24px">
            <li class="guarantee-statistics-item" v-for="item in guaranteeData">
              <span class="guarantee-statistics-item-name">{{ item.name }}
                <i style="
                    width: 100%;
                    display: inline-block;
                    height: 0;
                    line-height: 0;
                  "></i></span>
              <progress-bar :value="item.val"></progress-bar>
              <span class="guarantee-statistics-item-date">耗时：{{ item.date }}</span>
            </li>
          </ul>
        </card>
      </div>
      <div class="right-box" :style="`transform: scale(${scale});`">
        <card title="天气预警">
          <template #default>
            <div class="card-content" style="margin-top: 20px">
              <div class="cur-day-weather">
                <img :src="weatherData.icon" />
                <div class="cur-day-weather-info-box">
                  <p class="cur-day-weather-info-desc">
                    <span class="cur-day-weather-info-desc-celsius">{{
                        weatherData.temperature
                    }}</span>
                    <span class="cur-day-weather-info-desc-brief">{{
                        weatherData.brief
                    }}</span>
                    <span class="cur-day-weather-info-desc-en">（{{ weatherData.en }}）</span>
                  </p>
                  <ul class="other-info-list">
                    <li class="other-info-item" v-for="item in weatherData.otherInfos">
                      <span class="other-info-item-key">{{ item.key }}：</span>
                      <span class="other-info-item-val">{{ item.val }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <ul class="weather-period-list">
                <li class="weather-period" v-for="item in weatherData.periodList">
                  <img :src="item.icon" alt="" width="40" height="40" />
                  <span>{{ item.time }}</span>
                </li>
              </ul>
            </div>
          </template>
        </card>

        <card title="实时视频" style="margin-top: 43px">
          <ul class="video-list" style="margin-top: 30px">
            <li class="video-item" v-for="item in videoList">
              <h3 class="video-title">{{ item.name }}</h3>
              <video class="video" controls :src="item.video" autoplay></video>
              <p class="video-date">{{ item.date }}</p>
            </li>
          </ul>
        </card>
      </div>
    </section>
    <!-- footer -->
    <footer class="footer" :style="{ transform: `scale(${scale})`, transformOrigin: 'center bottom' }">
      <ul class="footer-nav-list">
        <li class="footer-nav">
          <span><a href="http://192.168.0.113:4200/gisplatPage/gisplat">大屏展示</a></span>
          <img class="line" src="~../assets/imgs/1.png" />
        </li>
        <li class="footer-nav">
          <span><a href="http://192.168.0.113:4200/monitorPage/monitor">远程监控</a></span>
          <img class="line" src="~../assets/imgs/1.png" />
        </li>
        <li class="footer-nav">
          <span><a href="http://192.168.0.113:4200/remoteControlPage/remoteControl">远程指挥</a></span>
          <img class="line" src="~../assets/imgs/1.png" />
        </li>
        <li class="footer-nav">
          <span><a href="http://192.168.0.113:4200/analysisWarningPage/analysisWarning">分析预警</a></span>
          <img class="line" src="~../assets/imgs/1.png" />
        </li>
        <li class="footer-nav">
          <span><a href="http://192.168.0.113:4200/decisionMaking/planConfigureManage">辅助决策</a></span>
          <img class="line" src="~../assets/imgs/1.png" />
        </li>
        <li class="footer-nav">
          <span><a href="http://192.168.0.113:4200/evaluatePage/evaluate">控制指挥</a></span>
          <img class="line" src="~../assets/imgs/1.png" />
        </li>
        <li class="footer-nav active">
          <span>数字孪生</span>
          <img class="line" src="~../assets/imgs/1.png" />
        </li>
      </ul>
    </footer>

    <div class="back-icon" @click="backHandle"></div>

    <dialog id="formDialog" ref="dialogEl" @close="dialogChange">
      <form class="staff-form" method="dialog">
        <label for="id" class="inp-prefix">
          <span class="inp-name">工号:</span>
          <input type="text" id="id" name="id" v-model="_userInfo.worknumber" disabled>
        </label>
        <label for="name" class="inp-prefix">
          <span class="inp-name">姓名:</span>
          <input type="text" id="name" v-model="_userInfo.name">
        </label>
        <div >
          <span class="inp-name">性别:</span>
          <label for="male">
            <span>男</span>
            <input type="radio" value="男" id="male" name="sex" checked @change="_userInfo.sex = '男'">
          </label>
          <label for="female" style="margin-left:20px;">
            <span>女</span>
            <input type="radio" value="女" id="female" name="sex" @change="_userInfo.sex = '女'">
          </label>
        </div>


        <label for="typework" class="inp-prefix">
          <span class="inp-name">工种:</span>
          <input type="text" id="typework" name="typework" v-model="_userInfo.typework">
        </label>
        <label for="contact" class="inp-prefix">
          <span class="inp-name">联系方式:</span>
          <input type="text" id="contact" name="contact" v-model="_userInfo.contact">
        </label>
        <div class="dialog-control-box">
          <button class="control-btn" @click="closeState = 'cancel'">取消</button>
          <button class="control-btn" @click="closeState = 'confirm'">修改</button>
        </div>
      </form>
    </dialog>
    <div class="footnote-box">
      <div class="footnote" @click="airPointOne">机位1</div>
      <div class="footnote" @click="airPointTwo" style="display:none;">机位2</div>
    </div>
  </div>
</template>


<style lang="less">
#app {
  pointer-events: none;

  .header,
  .footer,
  .left-box,
  .right-box {
    pointer-events: all;
  }
}

.home {
  background: #eee;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;

  background: url("~@/assets/imgs/遮罩.png") no-repeat;
  background-size: cover;

  // pointer-events: none;
  &>ul {
    position: absolute;
    right: 0;
    top: 0;
    pointer-events: all;

    li {
      margin: 10px;
    }
  }
}

.header {
  height: 127px;
  width: 1549px;
  margin: 0 auto;
  background: url("~@/assets/imgs/top.png");
}

.main-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;

  .left-box,
  .right-box {
    position: absolute;
    width: 444px;
    top: 66px;
  }

  .left-box {
    transform-origin: left top;
    left: 26px;

    .search-res-box {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0 5px;
      color: #fff;
      position: absolute;
      padding-left: 13px;
      top: 0px;
      right: -267px;
      width: 226px;
      height: 93px;
      background: url("~@/assets/imgs/货物弹窗.png");

      .close {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 15px;
        height: 15px;
        cursor: pointer;
      }
    }

    .card-search-content {
      position: relative;
      box-sizing: border-box;
      display: flex;
      padding: 17px 27px 27px 25px;
      gap: 20px;
      position: relative;
      height: 66px;
      background: url("~@/assets/imgs/矩形 24.png");

      .search-inp {
        outline: none;
        background: none;
        border: none;

        color: rgba(72, 80, 136, 1);
        flex: 1;
      }

      .search-btn:hover {
        opacity: 0.8;
        cursor: pointer;
      }

      .search-btn:active {
        opacity: 1;
      }

      .base-table-text {
        color: #e9dcff;
      }
    }

    .track {
      font-family: YouSheBiaoTiHei;
      color: rgba(235, 205, 114, 1);
      font-size: 15px;
      font-weight: 400;
      display: inline-block;
      padding: 8px 5px;
      border-radius: 6px;
      background: rgba(235, 205, 114, 0.2);
    }

    .adsb {
      display: inline-block;
      color: rgba(188, 196, 239, 1);
      padding: 8px 5px;
      border-radius: 6px;
      background: rgba(114, 235, 182, 0.2);
    }

    .flight-statistics-list,
    .guarantee-statistics-list {
      display: flex;
      flex-direction: column;
      gap: 2px 0;

      .flight-statistics-item {
        width: 440px;
        box-sizing: border-box;
        padding-left: 14px;
        padding-right: 21px;
        background: url("~@/assets/imgs/矩形 33 拷贝 2.png"),
          linear-gradient(rgba(72, 81, 125, 0.4), rgba(72, 81, 125, 0.4));
        display: grid;
        align-items: center;
        grid-template-columns: 39px 1fr max-content;
        grid-template-rows: 60px;
        gap: 0 10px;

        &-name {
          font-size: 18px;

          &-text {
            color: rgba(209, 215, 243, 1);
          }

          &-unit {
            color: rgba(128, 128, 128, 1);
          }
        }

        &-val {
          &-text {
            color: rgba(235, 205, 114, 1);
            font-size: 24px;
          }

          &-unit {
            margin-left: 3px;
            font-size: 18px;
            color: rgba(209, 215, 243, 1);
          }
        }
      }

      .guarantee-statistics-item {
        padding: 0 16px;
        gap: 0 10px;
        display: grid;
        grid-template-columns: minmax(80px, max-content) 1fr max-content;
        align-items: center;
        height: 50px;
        background: url("~@/assets/imgs/组 87.png") no-repeat;

        &-name {
          display: inline-block;
          height: 22px;
          color: rgba(188, 196, 239, 1);
          text-align: justify;
        }

        &-date {
          color: rgba(128, 128, 128, 1);
        }
      }
    }
  }

  .right-box {
    transform-origin: right top;

    right: 26px;

    .cur-day-weather {
      box-sizing: border-box;
      height: 112px;
      padding: 15px 17px 15px 26px;
      display: flex;
      gap: 0 25px;
      background: url("~@/assets/imgs/矩形 7.png");

      .cur-day-weather-info-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .cur-day-weather-info-desc {
          font-family: YouSheBiaoTiHei;
          font-weight: 400;
          display: flex;
          gap: 0 15px;
          font-size: 20px;
          font-weight: bold;
          color: rgba(241, 200, 120, 1);

          &-en {
            color: rgba(209, 215, 243, 1);
          }
        }

        .other-info-list {
          color: rgba(209, 215, 243, 1);
          font-size: 14px;
          display: grid;
          grid-template-columns: repeat(2, max-content);
          justify-content: space-between;
          gap: 5px 0;
        }

        .other-info-item {
          font-weight: normal;
        }
      }
    }

    .weather-period-list {
      margin-top: 25px;
      display: flex;
      text-align: center;
      justify-content: space-between;

      .weather-period {
        flex: 1;
      }

      .weather-period>span {
        margin-top: 16px;
        font-size: 14px;
        color: rgba(209, 215, 243, 1);
      }
    }

    .video-list {
      font-weight: 400;
      display: flex;
      flex-direction: column;
      gap: 25px 0;

      .video-item {
        box-sizing: border-box;
        width: 419px;
        height: 254px;
        padding: 15px 15px 6px 20px;
        background: url("~@/assets/imgs/视频框.png");

        .video-title {
          font-family: YouSheBiaoTiHei;
          font-weight: 400;
          font-size: 25px;
          color: #fff;
          text-shadow: 0px 3px 0px #333c52;
        }

        .video {
          width: 100%;
          height: 160px;
          margin-top: 14px;
          object-fit: fill;
        }

        .video-date {
          text-align: center;
          margin-top: 5px;
          color: rgba(249, 211, 107, 1);
          font-size: 16px;
        }
      }
    }
  }
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 120px;
  background: url("~@/assets/imgs/底.png") center;
  display: flex;
  justify-content: center;

  .footer-nav-list {
    font-family: YouSheBiaoTiHei;
    font-weight: 400;
    margin-top: 70px;
    display: inline-flex;
    gap: 0 50px;
    font-style: italic;
    font-size: 20px;
    color: #b9b0e6;

    .footer-nav {
      position: relative;

      &:hover>span>a {
        display: inline-block;
        color: rgba(235, 205, 114, 1);
      }

      &:hover>.line {
        display: block;
      }

      &:hover {

        &:hover::before,
        &:hover::after {
          position: absolute;
          content: "";
          display: block;
          width: 31px;
          height: 52px;
          top: -10px;
        }

        &:hover::before {
          rotate: 180deg;
          left: -30px;
          background: url("~@/assets/imgs/形状 48 拷贝 3.png");
        }

        &:hover::after {
          right: -30px;
          background: url("~@/assets/imgs/形状 48 拷贝 3.png");
        }
      }

      &>.line {
        display: none;
        position: absolute;
        left: -70%;
        top: 15px;
      }

      &.active {
        &>span {
          display: inline-block;
          color: rgba(235, 205, 114, 1);
        }

        &>.line {
          display: inline-block;
        }
      }

      &.active::before,
      &.active::after {
        position: absolute;
        content: "";
        display: block;
        width: 31px;
        height: 52px;
        top: -10px;
      }

      &.active::before {
        rotate: 180deg;
        left: -30px;
        background: url("~@/assets/imgs/形状 48 拷贝 3.png");
      }

      &.active::after {
        right: -30px;
        background: url("~@/assets/imgs/形状 48 拷贝 3.png");
      }
    }
  }
}

.mt-3 {
  margin-top: 3px;
}

.no-wrap {
  white-space: nowrap;
}

a {
  color: rgba(185, 176, 230, 1);
  text-decoration: none;
}

.back-icon {
  position: absolute;
  top: 20px;
  right: 50px;
  width: 30px;
  height: 30px;
  z-index: 10;
  background: url(~@/assets/imgs/复位.png);
  cursor: pointer;
  pointer-events: all;
}

.back-icon:hover {
  opacity: .8;
}

#formDialog {
  font-size: 13px;
  box-sizing: border-box;
  color: #FFF;
  width: 233px;
  height: 282px;
  position: absolute;
  top: 40%;
  left: 50%;
  outline: none;
  border: none;
  pointer-events: all;
  padding: 20px 10px;
  transform: translate(-50%, -50%);
  background: url("~@/assets/imgs/form-bg.png");
}

.staff-form {
  display: flex;
  flex-direction: column;
  gap: 20px 0;
}

.dialog-control-box {
  display: flex;
  justify-content: center;
  gap: 0 40px;
}

.control-btn {
  padding: 2px 8px;
  color: #FFF;
  border-radius: 4px;
  background-color: none;
}

.control-btn:nth-child(1) {
  border: 1px solid rgba(255, 255, 255, .8);
  background: none;
}

.control-btn:nth-child(2) {
  color: #000;
  background: rgba(218, 218, 218, 0.8);
}

.inp-name {
  display: inline-block;
  width: 70px;
}

input[type="text"] {
  padding: 4px;
  border: 1px solid rgba(190, 222, 255, 0.86);
  background: rgba(156, 145, 255, 0.29);
  outline: none;
  width: 127px;
}

.footnote-box {
  pointer-events: all;
  position: absolute;
  right: 26vw;
  bottom: 11vh;
  display: flex;
  gap: 0 10px;
}

.footnote {
  cursor: pointer;
  text-align: center;
  line-height: 52px;
  width: 110px;
  height: 52px;
  color: #D1D7F3;
  font-family: Source Han Sans SC;
  background: url("~@/assets/imgs/123.png");
}

/*table*/

.el-table__header-wrapper th .cell {
  font-weight: normal;
  line-height: 1.1;
  color: #ebcd72;
  font-size: 14px;
}

.el-table__header th {
  border: none !important;
  box-sizing: border-box !important;
  height: 54px !important;
  padding: 0 !important;
  background: url("~@/assets/imgs/矩形 677.png") no-repeat !important;
  background-position: center 50px !important;
}

.el-table__header-wrapper .cell {
  text-align: center;
}

.el-table__header-wrapper tr,
.el-table__header,
.el-table {
  border: none !important;
  background: none !important;
}

.el-table__row:nth-child(n) {
  background: rgba(72, 81, 125, 0.4);
}

.el-table__row:nth-child(2n) {
  background: none !important;
}

.el-table__row .cell {
  line-height: 1;
  font-size: 14px;
  color: #e9dcff;
  text-align: center;
}

.el-table__row td {
  border: none !important;
  box-sizing: border-box;
  height: 54px;
  padding: 12px 0 !important;
}

.el-table__row:hover>td {
  background: none !important;
}

.el-table__inner-wrapper::before {
  content: none !important;
}

.el-table .cell {
  padding: 0 6px;
}

.el-table .active-row {
  position: relative;
  z-index: 2;
  box-shadow: 0 0 8px #fff;
}

.el-table .el-scrollbar__wrap {
  overflow: visible !important;
  overflow-x: unset;
}

.el-table .el-table__body-wrapper {
  overflow: visible !important;
}

.el-table .el-scrollbar {
  overflow: visible;
}

.el-table {
  overflow: visible !important;
}
</style>
