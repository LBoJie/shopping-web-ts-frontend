<template>
    <div class="mx-auto w-[300px] mt-40 mb-40 flex flex-col items-center">
        <h3 class="w-full border-b-2 pb-2 text-2xl text-primary font-bold mb-5">忘記密碼</h3>
        <el-form class="w-full" :model="ruleForm" :rules="rules" ref="ruleFormRef">
            <el-form-item prop="email">
                <el-input v-model="ruleForm.email" placeholder="請輸入註冊信箱" />
            </el-form-item>
        </el-form>
        <div class="flex justify-end w-full">
            <el-button type="primary" @click="sendValidation(ruleFormRef)">寄送驗證信</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
type FormData = {
    email: string
}
const ruleForm = reactive({
    email: ''
});
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<FormData>>({
    email: [
        { required: true, message: '請輸入註冊信箱', trigger: 'blur' },
        { type: 'email', message: '請輸入有效信箱', trigger: 'blur' }
    ]
});
const sendValidation = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid, fields) => {
        if (valid) {
            try {
                await $fetch(`${apiBaseUrl}/member/forgot-password`, {
                    method: 'POST',
                    body: {
                        email: ruleForm.email
                    }, onRequest() {
                        showLoading();
                    }, onResponse({ response }) {
                        if (response.status === 200) {
                            alert("驗證信已寄出 請前往信箱驗證");
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