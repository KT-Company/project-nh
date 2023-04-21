<template>
  <div class="progress-bar">
    <div class="progress"></div>
    <div class="progress-val">
      <span class="progress-val-t">{{value}}</span>
      <span class="progress-val-u">%</span>
    </div>
  </div>
</template>

<script>

import {computed} from "vue";

export default {
  name: "ProgressBar",
  props: ["value"],
  setup(props) {
    const valueRate = computed(()=>props.value +"%")
    return {
      valueRate
    }
  }
}
</script>

<style lang="less" scoped>

.progress-bar {
  padding: 0 5px;
  display: flex;
  height: 15px;
  align-items: center;
  background: linear-gradient(90deg, rgba(155, 164, 210, 1) 0%, rgba(155, 164, 210, 1) 50%, rgba(155, 164, 210, .2) 70%) left center/4px 100% no-repeat,
  linear-gradient(90deg, rgba(155, 164, 210, .2) 30%, rgba(155, 164, 210, 1) 50%, rgba(155, 164, 210, 1) 100%) right center/4px 100% no-repeat;
}

.progress {
  flex: 1;
  height: 100%;
  background: linear-gradient(90deg,rgba(72, 81, 125, 1), rgba(72, 81, 125, .5)) left top/v-bind('valueRate') no-repeat,
      repeating-linear-gradient(60deg, rgba(143, 162, 255, 0.9) 0 10px, transparent 10px 15px) left top/v-bind('valueRate') no-repeat
  ;
}

.progress-val {
  height: 100%;

  .progress-val-t, .progress-val-u {
    font-weight: bold;
    font-size: 12px;
    line-height: 1;
    vertical-align: top;
    font-style: italic;
  }

  .progress-val-t {
    color: rgba(235, 205, 114, 1);
  }

  .progress-val-u {
    margin-left: 5px;
    color: rgba(188, 196, 239, 1);
  }
}
</style>