import { ElLoading } from "element-plus";

let loadingInstance: any;

export function showLoading() {
  if (loadingInstance) return;
  loadingInstance = ElLoading.service({
    lock: true,
    text: "Loading",
    background: "rgba(0, 0, 0, 0.7)",
  });
}

export function hideLoading() {
  if (loadingInstance) {
    loadingInstance.close();
    loadingInstance = null;
  }
}
