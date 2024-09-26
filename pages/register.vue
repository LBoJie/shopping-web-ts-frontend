<template>
    <div class="mx-auto mt-40 mb-40 w-1/2 flex justify-center">
        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto" class="w-[300px]" status-icon
            scroll-to-error>
            <h1 class="text-2xl border-b-2 pb-2 text-primary font-bold mb-5">會員註冊</h1>
            <el-form-item label="帳號" prop="account">
                <el-input v-model.trim="ruleForm.account" type="string" />
            </el-form-item>
            <el-form-item label="密碼" prop="password">
                <el-input v-model.trim="ruleForm.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="確認密碼" prop="confirmPassword">
                <el-input v-model.trim="ruleForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model="ruleForm.name" type="string" />
            </el-form-item>
            <el-form-item label="手機" prop="phone">
                <el-input v-model.trim="ruleForm.phone" type="string" />
            </el-form-item>
            <el-form-item label="email" prop="email">
                <el-input v-model.trim="ruleForm.email" type="string" />
            </el-form-item>
            <el-form-item label="生日" prop="birthday">
                <el-date-picker v-model="ruleForm.birthday" :disabled-date="disabledDate" value-format="YYYY-MM-DD"
                    type="date" placeholder="生日" />
            </el-form-item>
            <el-form-item label="性別" prop="gender">
                <el-radio-group v-model="ruleForm.gender">
                    <el-radio value="0">男</el-radio>
                    <el-radio value="1">女</el-radio>
                </el-radio-group>
            </el-form-item>
            <div class="flex justify-end">
                <el-form-item>
                    <el-button type="primary" :loading="registerLoading" @click="register(ruleFormRef)">
                        註冊
                    </el-button>
                </el-form-item>
            </div>
        </el-form>
    </div>
</template>


<script setup lang="ts">
import type { FormInstance, ComponentSize, FormRules } from 'element-plus';
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;

type FormData = {
    account: string
    password: string
    confirmPassword: string
    name: string
    gender: string
    phone: string
    email: string
    birthday: string
}
type RegisterData = Omit<FormData, "confirmPassword">

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<FormData>({
    account: '',
    password: '',
    confirmPassword: '',
    name: '',
    gender: '0',
    phone: '',
    email: '',
    birthday: '',
})
const validateConfirmPassword = () => {
    return ruleForm.password === ruleForm.confirmPassword;
}
const rules = reactive<FormRules<FormData>>({
    account: [
        { required: true, message: '請填寫帳號', trigger: 'blur' },
        { min: 4, max: 8, message: '帳號長度必須在 4 到 8 個字符之間', trigger: 'blur' },
        {
            pattern: /^[a-zA-Z0-9]+$/,
            message: '帳號只能包含英文和數字',
            trigger: 'blur'
        }
    ],
    password: [
        { required: true, message: '請填寫密碼', trigger: 'blur' },
        { min: 8, max: 16, message: '帳號長度必須在 8 到 16 個字符之間', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '請填寫確認密碼', trigger: 'blur', },
        { validator: validateConfirmPassword, message: '密碼不一致', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '請填寫姓名', trigger: 'blur' },
        { min: 2, max: 5, message: '姓名必須是 2 ~ 5 個字符', trigger: 'blur' }
    ],
    gender: [
        {
            required: true
        }
    ],
    phone: [
        { required: true, message: '請輸入有效的手機號碼', trigger: 'blur', pattern: /^09\d{8}$/ },
    ],
    email: [
        { required: true, type: 'email', message: '請輸入有效的email', trigger: ['blur'] },
    ],
    birthday: [
        { required: true, type: "date", message: '請填寫生日', trigger: 'blur' },
    ],
})
const disabledDate = (time: Date) => {
    return time.getTime() > Date.now()
}
const registerLoading = ref(false);
const register = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            const registerData: RegisterData = {
                account: ruleForm.account,
                password: ruleForm.password,
                name: ruleForm.name,
                gender: ruleForm.gender,
                phone: ruleForm.phone,
                email: ruleForm.email,
                birthday: ruleForm.birthday,
            }
            try {
                await $fetch(`${apiBaseUrl}/member`, {
                    method: 'POST',
                    body: registerData,
                    onRequest() {
                        registerLoading.value = true;
                    },
                    onResponse({ response }) {
                        if (response.status === 201) {
                            alert("註冊成功，將跳轉至燈入頁");
                            navigateTo("/login");
                        }
                    }
                })
            }
            catch (error) {
                handleError(error);
            }
            finally {
                registerLoading.value = false;
            }
        }
    })
}

</script>

<style setup lang="scss"></style>
