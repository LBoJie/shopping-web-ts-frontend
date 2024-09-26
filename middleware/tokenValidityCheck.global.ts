import { useMemberStore } from "@/store/index";
import { jwtDecode } from "jwt-decode";
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.client) {
    const memberStore = useMemberStore();
    const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
    if (memberStore.member) {
      const accessToken = memberStore.accessToken;
      // 檢查token是否合法
      if (accessToken.split(".").length === 3) {
        try {
          const decoded = jwtDecode(accessToken);
          const currentTime = Math.floor(Date.now() / 1000);
          const expTime = decoded.exp!;
          const secondsUntilExpiration = expTime - currentTime;
          const daysUntilExpiration = secondsUntilExpiration / 86400;
          if (daysUntilExpiration < 0.5) {
            //執行刷新token api
            await $fetch(`${apiBaseUrl}/auth/refreshToken`, {
              headers: {
                Authorization: `Bearer ${memberStore.refreshToken}`,
              },
              onResponse({ response }) {
                const { accessToken, refreshToken } = response._data.responseData;
                memberStore.updateToken(accessToken, refreshToken);
              },
            });
          }
        } catch (error) {
          handleError(error);
          await memberStore.logout();
          navigateTo("/login");
        }
      } else {
        alert("帳號驗證錯誤，請重新登入");
        await memberStore.logout();
        navigateTo("/login");
      }
    }
  }
});
