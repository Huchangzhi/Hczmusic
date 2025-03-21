<template>
    <transition name="fade">
        <div v-if="isOpen" class="modal">
            <div class="modal-content">
                <h3>{{ t('shou-cang-dao') }}</h3>
                <ul class="playlist-select-list" v-if="playlists.length > 0">
                    <li v-for="playlist in playlists" 
                        :key="playlist.list_id" 
                        @click="addToPlaylist(playlist.listid, currentSong); isOpen = false">
                        {{ playlist.name }}
                    </li>
                </ul>
                <div v-else>{{ t('mei-you-ge-dan') }}</div>
                <button class="close-btn-modal" @click="isOpen = false">{{ t('guan-bi') }}</button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { defineProps, ref } from 'vue';
import { get } from '../utils/request';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { MoeAuthStore } from '../stores/store';

const MoeAuth = MoeAuthStore();
const { t } = useI18n();

const props = defineProps({
    currentSong: {
        type: Object,
        required: true
    }
});
const playlists = ref([]);
const isOpen = ref(false);

const validateUserAndSong = () => {
    if (!MoeAuth.isAuthenticated) {
        window.$modal.alert(t('qing-xian-deng-lu'));
        return false;
    }
    if (!props.currentSong.hash) {
        window.$modal.alert(t('mei-you-zheng-zai-bo-fang-de-ge-qu'));
        return false;
    }
    return true;
};

const fetchPlaylists = async () => {
    if (!validateUserAndSong()) return;
    try {
        const playlistResponse = await get('/user/playlist', {
            pagesize: 100
        });
        if (playlistResponse.status !== 1) {
            ElMessage.error(t('huo-qu-ge-dan-shi-bai'));
            return;
        }
        playlists.value = playlistResponse.data.info.filter(
            playlist => playlist.list_create_userid === MoeAuth.UserInfo.userid
        );
        isOpen.value = true;
    } catch (error) {
        console.log(error);
        ElMessage.error(t('huo-qu-ge-dan-shi-bai'));
        isOpen.value = false;
    }
};

const addToPlaylist = async (listid, song) => {
    try {
        await get(`/playlist/tracks/add?listid=${listid}&data=${encodeURIComponent(song.name.replace(',', ''))}|${song.hash}`);
        ElMessage.success({
            message: t('cheng-gong-tian-jia-dao-ge-dan'),
            duration: 2000
        });
    } catch (error) {
        ElMessage.error({
            message: t('tian-jia-dao-ge-dan-shi-bai'),
            duration: 2000
        });
    }
    isOpen.value = false;
};

const toLike = () => {
    const like_id = localStorage.getItem('like');
    if(!like_id) {window.$modal.alert('先去看看你的收藏夹吧');return;}
    addToPlaylist(like_id, props.currentSong);
};

defineExpose({
    toLike,
    fetchPlaylists,
    validateUserAndSong,
    addToPlaylist
});
</script>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: var(--background-color);
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.playlist-select-list {
    list-style: none;
    padding: 0;
    margin: 15px 0;
}

.playlist-select-list li {
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-radius: 8px;
}

.playlist-select-list li:hover {
    background-color: var(--secondary-color);
}

.modal .close-btn-modal {
    width: 100%;
    padding: 8px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
}

.modal .close-btn-modal:hover {
    opacity: 0.9;
}
</style>