<template>
    <ClientOnly>
        <div class="bg-primary-6">
            <div class="w-[1200px] mx-auto p-4 mobile:w-full">
                <div class="text-end text-sm">
                    <div class="" v-if="!memberStore.member">
                        <NuxtLink to="/register" class="mr-2">
                            <el-button plain>註冊</el-button>
                        </NuxtLink>
                        <NuxtLink to="/login">
                            <el-button plain>登入</el-button>
                        </NuxtLink>
                    </div>
                    <el-dropdown v-else>
                        <span class="el-dropdown-link flex items-center">
                            <el-icon class="mr-1">
                                <Avatar />
                            </el-icon>
                            {{ memberStore.member.account }}
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <NuxtLink to="/account"><el-dropdown-item>我的帳戶</el-dropdown-item></NuxtLink>
                                <NuxtLink to="/account/order"><el-dropdown-item>我的訂單</el-dropdown-item></NuxtLink>
                                <el-dropdown-item @click="memberStore.logout()">登出</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <div class="flex items-center">
                    <NuxtLink to="/">
                        <img class="w-[160px] h-[85px] mobile:h-[51px]" src="/images/logo.webp" alt="">
                    </NuxtLink>
                    <el-input v-model="search" placeholder="搜尋商品名稱" class="w-[300px] ml-4" @keyup.enter="searchProduct">
                        <template #append>
                            <el-button icon="Search" @click="searchProduct" />
                        </template>
                    </el-input>
                    <NuxtLink to="/cart" class="ml-auto relative">
                        <el-badge :value="memberStore.cart.length" class="item" :offset="[-3, 3]">
                            <el-icon class="text-[32px] mobile:ml-4">
                                <ShoppingCart />
                            </el-icon>
                        </el-badge>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </ClientOnly>

    <div class="w-[1200px] min-h-[700px] mx-auto p-8 mobile:w-full mobile:p-4 mobile:min-h-[450px]">
        <slot />
    </div>
    <div class="bg-[#F5F7FA] p-8">
        <NuxtLink to="/category/0" class="hover:text-primary hover:underline block">查看所有商品</NuxtLink>
        <NuxtLink to="https://github.com/LBoJie/shopping-web-ts-frontend"
            class="hover:text-primary hover:underline block">
            GitHub
            前端
        </NuxtLink>
        <NuxtLink to="https://github.com/LBoJie/shopping-web-ts-backend"
            class="hover:text-primary hover:underline block">
            GitHub
            後端
        </NuxtLink>
        <p class="mt-4">
            本網站為學習和個人作品集展示用途，網站中的所有內容僅供練習使用，並不構成實際的商業交易或購買行為。網站中的任何產品或服務展示僅為範例，並非真正的商品或服務。我們不對網站內容的準確性或完整性負責。
        </p>
    </div>
</template>


<script setup lang="ts">
import { useMemberStore } from '@/store/index';
const route = useRoute();

const search = ref(route.query.keyword as string || '');
const memberStore = useMemberStore();
const searchProduct = () => {
    if (!search.value) {
        return
    }
    navigateTo({ path: "/search", query: { keyword: search.value } })

}

watch(
    () => route.query.keyword,
    () => {
        if (route.fullPath.includes('/search?')) {
            search.value = route.query.keyword as string
        }
        else {
            search.value = ''
        }

    }
);

const handleVisibilityChange = async () => {
    const newMemerJson = localStorage.getItem('member');
    const newCart: CartItem[] = newMemerJson ? JSON.parse(newMemerJson).cart : null;
    if (document.visibilityState === 'visible' && newCart && memberStore.cart.length !== newCart.length) {
        {
            await memberStore.getCart();
        }
    }
}
onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
})
</script>
<style lang="scss"></style>