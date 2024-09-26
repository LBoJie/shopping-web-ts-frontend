<template>
    <div class="mx-auto w-[300px] mt-40 mb-40 flex flex-col  items-center">
        <h3 class="w-full border-b-2 pb-2 text-2xl text-primary font-bold mb-5">會員登入</h3>
        <el-input class="mb-5 w-full" v-model.trim="accountOrEmail" placeholder="帳號或信箱" clearable />
        <el-input class="mb-5 w-full" v-model.trim="password" type="password" placeholder="密碼" show-password />
        <div class="flex justify-between items-center w-full">
            <NuxtLink class="text-primary" to="/forgot-password">忘記密碼</NuxtLink>
            <el-button type="primary" :disabled="accountOrEmail.length < 4 || password.length < 8" :loading="loginLoading"
                @click="login">登入</el-button>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
const accountOrEmail = ref('');
const password = ref('');
const loginLoading = ref(false);

const login = async () => {
    loginLoading.value = true;
    await memberStore.login(accountOrEmail.value, password.value);
    loginLoading.value = false;
}
</script>