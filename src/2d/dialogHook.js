import { clone } from "lodash-es";
import { onMounted, ref, watch } from "vue";
import { updateUserInfo } from "./api/index";

const _userInfo = ref({ worknumber: "", name: "", sex: "男", typework: "", contact: "" })
let callback = null
export default function () {

  const dialogEl = ref(null)
  const closeState = ref("cancel") // confirm | cancel
  onMounted(() => {
    console.log(dialogEl.value)
  })

  watch(() => _userInfo.value, () => {
    dialogEl.value.showModal()
  })

  async function dialogChange(ev) {
    if (closeState.value !== "confirm") return
    for (const key in _userInfo.value) {
      if (_userInfo.value[key] === "") {
        alert(`参数:${key}为空修改失败`)
        return
      }
    }
    // 发送接口并执行回调
    const data = (await updateUserInfo(_userInfo.value)).data
    closeState.value = "cancel"
    callback && callback(data)
    callback = null
  }
  return { dialogEl, dialogChange, closeState, _userInfo }
}

export function _updateUserInfo(worknumber, cb) {
  _userInfo.value = { name: "", sex: "男", typework: "", contact: "", worknumber }
  callback = cb
}

console.log(_updateUserInfo)