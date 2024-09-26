<template>
    <div class="mx-auto w-[300px] mt-40 mb-40 flex flex-col  items-center">
        <h3 class="w-full border-b-2 pb-2 text-2xl text-primary font-bold mb-5">重設密碼</h3>
        <el-form class="w-full" :model="ruleForm" :rules="rules" ref="ruleFormRef">
            <el-form-item prop="password">
                <el-input v-model="ruleForm.password" type="password" placeholder="密碼" show-password />
            </el-form-item>
            <el-form-item prop="confirmPassword">
                <el-input v-model="ruleForm.confirmPassword" type="password" placeholder="確認密碼" show-password />
            </el-form-item>
        </el-form>
        <div class="flex justify-end w-full">
            <el-button type="primary" @click="resetPassword(ruleFormRef)">重設密碼</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const route = useRoute();
type FormData = {
    password: string
    confirmPassword: string
}

const ruleForm = reactive<FormData>({
    password: "",
    confirmPassword: ""
});
const ruleFormRef = ref<FormInstance>()
const validateConfirmPassword = () => {
    return ruleForm.password === ruleForm.confirmPassword;
}
const rules = reactive<FormRules<FormData>>({
    password: [
        { required: true, message: '請填寫密碼', trigger: 'blur' },
        { min: 8, max: 16, message: '帳號長度必須在 8 到 16 個字符之間', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '請填寫確認密碼', trigger: 'blur', },
        { validator: validateConfirmPassword, message: '密碼不一致', trigger: 'blur' }
    ],
});
const resetPassword = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            try {
                await $fetch(`${apiBaseUrl}/member/reset-password`, {
                    method: 'POST',
                    body: {
                        token: route.query.token,
                        newPassword: ruleForm.password
                    }, onRequest() {
                        showLoading();
                    }, onResponse({ response }) {
                        if (response.status === 204) {
                            alert("密碼重設成功");
                            navigateTo("/login");
                        }
                    }
                })
            } catch (error: any) {
                handleError(error);
            } finally {
                hideLoading();
            }
        }
    })

}
</script>