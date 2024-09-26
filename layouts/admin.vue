<template>
    <div class="bg-[#303133] text-white">
        <div class=" p-9 text-4xl">
            後台系統
        </div>
        <div class="flex">
            <el-row class="w-4/12">
                <el-col>
                    <el-menu class="border-none" unique-opened active-text-color="#ffd04b" background-color="#545c64"
                        text-color="#fff" default-active="1" @open="handleOpen" @close="handleClose">
                        <el-sub-menu index="1">
                            <template #title>
                                <span class="text-xl">商品</span>
                            </template>
                            <el-menu-item-group>
                                <el-menu-item index="1-1">
                                    <nuxt-link class="w-full" to="/admin/product/view">商品總覽</nuxt-link>
                                </el-menu-item>
                                <el-menu-item index="1-2">
                                    <nuxt-link class="w-full" to="/admin/product/add">新增商品</nuxt-link>
                                </el-menu-item>
                                <el-menu-item index="1-3">
                                    <nuxt-link class="w-full" to="/admin/product/category">商品分類</nuxt-link>
                                </el-menu-item>
                            </el-menu-item-group>
                        </el-sub-menu>
                        <el-sub-menu index="2">
                            <template #title>
                                <span class="text-xl">活動</span>
                            </template>
                            <el-menu-item-group>
                                <el-menu-item index="2-1">
                                    <nuxt-link class="w-full" to="/admin/promotion/view">活動總覽</nuxt-link>
                                </el-menu-item>
                            </el-menu-item-group>
                            <el-menu-item index="2-2">
                                <nuxt-link class="w-full" to="/admin/promotion/add">新增活動</nuxt-link>
                            </el-menu-item>
                        </el-sub-menu>
                        <el-sub-menu index="3">
                            <template #title>
                                <span class="text-xl">訂單</span>
                            </template>
                            <el-menu-item-group>
                                <el-menu-item index="3-1">
                                    <NuxtLink class="w-full" to="/admin/order/view">
                                        訂單查看
                                    </NuxtLink>
                                </el-menu-item>
                            </el-menu-item-group>
                        </el-sub-menu>
                        <el-sub-menu index="4">
                            <template #title>
                                <span class="text-xl">輪播</span>
                            </template>
                            <el-menu-item-group>
                                <el-menu-item index="4-1">
                                    <NuxtLink class="w-full" to="/admin/carousel">
                                        輪播控制
                                    </NuxtLink>
                                </el-menu-item>
                            </el-menu-item-group>
                        </el-sub-menu>
                    </el-menu>
                </el-col>
            </el-row>
            <ClientOnly>
                <div class="w-8/12 px-8">
                    <slot v-if="memberStore.member && memberStore.member.role === 'admin'" />
                </div>
            </ClientOnly>
        </div>
    </div>


</template>

<script setup lang="ts">
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
const router = useRoute();
const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
onBeforeMount(() => {
    if (!memberStore.member || memberStore.member.role !== "admin") {
        navigateTo({ path: "/login", query: { redirect: router.path } });
    }
})

</script>
<style lang="scss"></style>