<template>
    <div :class="{ 'pointer-events-none': !editForm }">
        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto" class="w-[300px] mobile:w-full"
            status-icon scroll-to-error :disabled="!editForm">
            <h1 class="text-2xl border-b-2 pb-2 text-primary font-bold mb-5">會員資料</h1>
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
                <el-date-picker v-model="ruleForm.birthday" value-format="YYYY-MM-DD" type="date" placeholder="生日" />
            </el-form-item>
            <el-form-item label="性別" prop="gender">
                <el-radio-group v-model="ruleForm.gender">
                    <el-radio value="0">男</el-radio>
                    <el-radio value="1">女</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </div>
    <div class="flex justify-end w-[300px] mobile:w-full">
        <el-button type="primary" v-if="!editForm" :loading="registerLoading" @click="editForm = true">
            編輯
        </el-button>
        <el-button type="primary" v-else :loading="registerLoading" @click="register(ruleFormRef)">
            編輯完成
        </el-button>

    </div>

</template>


<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { compare } from 'fast-json-patch';
import { useMemberStore } from '@/store/index';

const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const memberStore = useMemberStore();
type FormData = {
    name: string
    gender: string
    phone: string
    email: string
    birthday: string
}

const editForm = ref(false);
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<FormData>({
    name: '',
    gender: '0',
    phone: '',
    email: '',
    birthday: '',
})
const rules = reactive<FormRules<FormData>>({
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

const registerLoading = ref(false);
const register = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            const comPareMember = {
                name: memberStore.member!.name,
                phone: memberStore.member!.phone,
                email: memberStore.member!.email,
                birthday: memberStore.member!.birthday,
                gender: memberStore.member!.gender,
            }
            const patch = compare(comPareMember, ruleForm);
            if (patch.length === 0) {
                ElNotification({
                    title: 'Error',
                    message: "無須編輯",
                    type: 'error',
                })
                return
            }
            try {
                await $fetch(`${apiBaseUrl}/member`, {
                    method: 'PATCH',
                    body: { jsonPatch: patch },
                    headers: {
                        Authorization: `Bearer ${memberStore.accessToken}`,
                    },
                    onRequest() {
                        registerLoading.value = true;
                    },
                    onResponse({ response }) {
                        if (response.status === 204) {
                            editForm.value = false;
                            const fields = Object.keys(ruleForm);
                            ruleFormRef.value!.clearValidate(fields);
                            ElNotification({
                                title: 'Success',
                                message: "編輯成功",
                                type: 'success',
                            })
                        }
                    }
                })

                //取得更新member資料
                await $fetch(`${apiBaseUrl}/member`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${memberStore.accessToken}`,
                    },
                    onResponse({ response }) {
                        if (response.status === 200) {
                            memberStore.updateMember(response._data.responseData)
                        }
                    }
                })
            }
            catch (error: any) {
                if (error.response.status === 401) {
                    handleRefreshToken()
                }
                else {
                    handleError(error);
                }
            }
            finally {
                registerLoading.value = false;
            }
        }
    })
}
onMounted(() => {
    ruleForm.name = memberStore.member!.name;
    ruleForm.phone = memberStore.member!.phone;
    ruleForm.email = memberStore.member!.email;
    ruleForm.birthday = memberStore.member!.birthday;
    ruleForm.gender = memberStore.member!.gender;
})
</script>

<style setup lang="scss"></style>
