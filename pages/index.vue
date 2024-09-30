<template>
    <Swiper class="h-[400px] mb-4" :modules="[SwiperAutoplay, SwiperNavigation, SwiperPagination]" :slides-per-view="1"
        :loop="true" :autoplay="{
            delay: 5000,
            disableOnInteraction: true,
        }" navigation pagination>
        <SwiperSlide v-for="carousel in carousels" :key="carousel.id">
            <NuxtLink :to="carousel.href" class="w-full h-full">
                <img :src="carousel.imgUrl" alt="" class="w-full h-full object-cover">
            </NuxtLink>
        </SwiperSlide>
    </Swiper>
    <el-button type="primary" @click="router.push('/category/0')">查看所有商品</el-button>

</template>

<script setup lang="ts">
const router = useRouter();
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const { data, error } = await useFetch<ApiResponse<Carousel[]>>(`${apiBaseUrl}/carousel/1`,
    {
        method: "GET",
    })
if (error.value) {
    throw createError({
        statusCode: 404,
        message: error.value.message,
        fatal: true
    })
}

const carousels = ref<Carousel[]>(data.value!.responseData);




</script>

<style scoped lang="scss"></style>