<template>
    <div class="flex my-8 mobile:my-4">
        <el-aside class="w-[200px] items-stretch mobile:hidden">
            <el-scrollbar>
                <el-menu :default-openeds="['1']" :default-active="activeIndex">
                    <el-sub-menu index="1">
                        <template #title>
                            <el-icon>
                                <User />
                            </el-icon>
                            會員專區
                        </template>
                        <el-menu-item-group>
                            <el-menu-item index="1-1">
                                <NuxtLink to="/account" class="w-full">
                                    會員基本資料
                                </NuxtLink>
                            </el-menu-item>
                            <el-menu-item index="1-2">
                                <NuxtLink to="/account/order" class="w-full">
                                    訂單總覽
                                </NuxtLink>
                            </el-menu-item>
                        </el-menu-item-group>
                    </el-sub-menu>
                </el-menu>
            </el-scrollbar>
        </el-aside>
        <ClientOnly>
            <div class="px-8 w-full mobile:p-0">
                <NuxtPage v-if="memberStore.member" />
            </div>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
const activeIndex = ref("1-1");
const router = useRoute();

watch(() => router.path, () => {
    if (router.path.startsWith("/account/order")) {
        activeIndex.value = "1-2"
    }
    else {
        activeIndex.value = "1-1"
    }
}, { immediate: true })
onBeforeMount(() => {
    if (!memberStore.member) {
        navigateTo({ path: "/login", query: { redirect: router.path } });
    }
})
</script>

<style scoped lang="scss">
:deep(.el-scrollbar__view) {
    height: 100%;

    .el-menu {
        height: 100%;
    }
}
</style>