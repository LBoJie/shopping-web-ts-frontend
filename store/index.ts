import { defineStore } from "pinia";
import type { CartItem } from "~/types/common";

// member store
export const useMemberStore = defineStore(
  "member",
  () => {
    const member = ref<Member | null>(null);
    const accessToken = ref("");
    const refreshToken = ref("");
    const cart = ref<CartItem[]>([]);
    const updateMember = (upadateMember: Member) => {
      member.value = upadateMember;
    };
    const updateToken = (newAccessToken: string, newRefreshToken: string) => {
      accessToken.value = newAccessToken;
      refreshToken.value = newRefreshToken;
    };
    const login = async (accountOrEmail: string, password: string) => {
      const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
      const route = useRoute();
      try {
        await $fetch(`${apiBaseUrl}/member/login`, {
          method: "POST",
          body: {
            accountOrEmail,
            password,
            guestCart: cart.value,
          },

          async onResponse({ response }) {
            if (response.status === 200) {
              const { accessToken: responseAccessToken, refreshToken: responseRefreshToken, ...responseMember } = response._data.responseData;
              member.value = responseMember;
              accessToken.value = responseAccessToken;
              refreshToken.value = responseRefreshToken;
              await getCart();
              if (route.query.redirect) {
                navigateTo(route.query.redirect as string);
              } else {
                navigateTo("/");
              }
            }
          },
        });
      } catch (error) {
        handleError(error);
      }
    };
    const logout = async () => {
      try {
        const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
        if (member.value) {
          await $fetch(`${apiBaseUrl}/member/logout`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
            onRequest() {
              showLoading();
            },
          });
        }
      } catch (error: any) {
      } finally {
        member.value = null;
        accessToken.value = "";
        refreshToken.value = "";
        cart.value = [];
        hideLoading();
        navigateTo("/");
      }
    };
    const getCart = async () => {
      const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
      if (member.value) {
        try {
          await $fetch(`${apiBaseUrl}/cart`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
            onRequest() {
              showLoading();
            },
            onResponse({ response }) {
              if (response.status === 200) {
                cart.value = response._data.responseData;
              }
            },
          });
        } catch (error: any) {
          if (error.response.status === 401) {
            handleRefreshToken();
          } else {
            handleError(error);
          }
        } finally {
          hideLoading();
        }
      } else {
        const newMemerJson = localStorage.getItem("member");
        if (newMemerJson) {
          cart.value = JSON.parse(newMemerJson).cart;
        }
      }
    };

    const addToCart = async (cartItem: CartItem): Promise<boolean> => {
      //避免pass by reference 更動到原始cartItem
      cartItem = { ...cartItem };
      const isSuccess = false;
      const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
      const index = cart.value.findIndex((item) => item.productId === cartItem.productId);
      if (index !== -1) {
        if (cart.value[index].quantity + cartItem.quantity > cartItem.inventory) {
          console.log("狀態一");
          ElNotification({
            title: "Warning",
            message: "購物車內數量已達庫存上限",
            type: "warning",
          });
          return isSuccess;
        }
      } else {
        if (cartItem.quantity > cartItem.inventory) {
          console.log("狀態二");
          ElNotification({
            title: "Warning",
            message: "已達庫存上限",
            type: "warning",
          });
          return isSuccess;
        }
      }
      if (member.value) {
        try {
          await $fetch(`${apiBaseUrl}/cart`, {
            method: "POST",
            body: { productId: cartItem.productId, quantity: cartItem.quantity },
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
            onRequest() {
              showLoading;
            },
            onResponse({ response }) {
              if (response.status === 201) {
                ElNotification({
                  title: "Success",
                  message: "商品加入成功",
                  type: "success",
                });
              }
            },
          });
          await getCart();
          return !isSuccess;
        } catch (error: any) {
          if (error.response.status === 401) {
            handleRefreshToken();
          } else {
            handleError(error);
          }
          return false;
        } finally {
          hideLoading();
        }
      } else {
        if (index !== -1) {
          console.log("修改數量");
          cart.value[index].quantity += cartItem.quantity;
        } else {
          console.log("新增購物車商品");
          cart.value.push(cartItem);
        }
        ElNotification({
          title: "Success",
          message: "商品加入成功",
          type: "success",
        });
        return !isSuccess;
      }
    };
    const modifyCartItem = async (cartItem: CartItem) => {
      if (member.value) {
        try {
          const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
          await $fetch(`${apiBaseUrl}/cart`, {
            method: "PATCH",
            body: { productId: cartItem.productId, quantity: cartItem.quantity },
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
            onResponse({ response }) {
              if (response.status === 204) {
                ElNotification({
                  title: "Success",
                  message: "修改成功",
                  type: "success",
                });
              }
            },
          });
          await getCart();
        } catch (error: any) {
          if (error.response.status === 401) {
            handleRefreshToken();
          } else {
            handleError(error);
          }
        }
      } else {
        const index = cart.value.findIndex((item) => item.productId === cartItem.productId);
        if (index !== -1) {
          cart.value[index].quantity = cartItem.quantity;
          ElNotification({
            title: "Success",
            message: "修改成功",
            type: "success",
          });
        }
      }
    };
    const deleteCartItem = async (productId: number) => {
      const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
      if (member.value) {
        try {
          console.log("object");
          await $fetch(`${apiBaseUrl}/cart/${productId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
            onResponse({ response }) {
              if (response.status === 204) {
                ElNotification({
                  title: "Success",
                  message: "商品刪除成功",
                  type: "success",
                });
              }
            },
          });
          await getCart();
        } catch (error: any) {
          if (error.response.status === 401) {
            handleRefreshToken();
          } else {
            handleError(error);
          }
        }
      } else {
        console.log("deleteCartItem");
        const index = cart.value.findIndex((item) => item.productId === productId);
        if (index !== -1) {
          cart.value.splice(index, 1);
          ElNotification({
            title: "Success",
            message: "商品刪除成功",
            type: "success",
          });
        }
      }
    };
    return {
      member,
      accessToken,
      refreshToken,
      updateToken,
      updateMember,
      login,
      logout,
      cart,
      addToCart,
      getCart,
      modifyCartItem,
      deleteCartItem,
    };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  }
);

type Order = {
  name: string;
  phone: string;
  address: string;
  notes?: string;
};
// store/index.js
export const useOrderStore = defineStore(
  "order",
  () => {
    const order = ref<Order | null>(null);
    const clearOrder = () => {
      order.value = null;
    };
    return {
      order,
      // sendOrder,
      clearOrder,
    };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  }
);
