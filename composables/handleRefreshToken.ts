import { useMemberStore } from "@/store/index";
export default async () => {
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
  const memberStore = useMemberStore();
  try {
    await $fetch(`${apiBaseUrl}/auth/refreshToken`, {
      headers: {
        Authorization: `Bearer ${memberStore.refreshToken}`,
      },
      onResponse({ response }) {
        if (response.status === 200) {
          const { accessToken, refreshToken } = response._data.responseData;
          memberStore.updateToken(accessToken, refreshToken);
          alert("連線逾時，將重新整理頁面");
          location.reload();
        }
      },
    });
  } catch (error) {
    alert("連線逾時，請重新登入");
    await memberStore.logout();
    navigateTo("/login");
  }
};
