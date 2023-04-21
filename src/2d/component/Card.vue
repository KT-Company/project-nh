<template>
  <section class="card">
    <div class="card-nav-header">
      <span class="card-nav-header-text">{{ title }}</span>
    </div>
    <slot></slot>
  </section>
</template>

<script>
export default {
  name: "Card",
  props: ["title"],
};
</script>

<style lang="less" scoped>
.card {
  .card-nav-header {
    font-family: YouSheBiaoTiHei;

    text-align: center;
    line-height: 53px;
    font-size: 30px;
    font-weight: 400;
    height: 53px;
    background: url("~@/assets/imgs/标题1.png");
    &-text {
      background: linear-gradient(0deg, #ffffff 0%, #a9b3ea 100%);
      background-clip: text;
      color: transparent;
    }
  }
}
</style>