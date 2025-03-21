<template>
    <div class="detail-page">
        <!-- 头部信息区域 -->
        <div class="header">
            <img class="cover-art" :class="isArtist ? 'artist-avatar' : ''"
                :src="isArtist ? ($getCover(detail.sizable_avatar, 480)) : (detail.pic ? $getCover(detail.pic, 480) : './assets/images/live.png')" />
            <div class="info">
                <h1 class="title">{{ isArtist ? detail.author_name : detail.name }}</h1>
                <p class="subtitle" v-if="!isArtist">{{ detail.publish_date }} | {{ detail.list_create_username }}</p>
                <div class="stats" v-if="isArtist">
                    <span>歌曲: {{ detail.song_count }}</span>
                    <span>专辑: {{ detail.album_count }}</span>
                    <span>MV: {{ detail.mv_count }}</span>
                    <span>粉丝: {{ detail.fansnums }}</span>
                </div>
                <p class="meta" v-if="!isArtist">{{ detail.tags }}</p>
                <div class="description">{{ isArtist ? detail.intro : detail.intro }}</div>
                <div class="actions">
                    <button class="primary-btn" @click="addPlaylistToQueue($event)">
                        <i class="fas fa-play"></i> {{ $t('bo-fang') }}
                    </button>
                    <button class="follow-btn" v-if="isArtist" @click="toggleFollow" :disabled="followLoading">
                        <i class="fas fa-heart"></i> {{ isFollowed ? '已关注' : '关注' }}
                    </button>
                    <button class="fav-btn" v-if="!isArtist && detail.list_create_userid != MoeAuth.UserInfo?.userid && !route.query.listid" 
                        @click="toggleFavorite(detail.list_create_gid)">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="more-btn-container" v-if="!isArtist">
                        <button class="more-btn" @click="toggleDropdown">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <div v-if="isDropdownVisible" class="dropdown-menu">
                            <ul>
                                <li @click="deletePlaylist(detail.listid)" v-if="(detail.list_create_userid == MoeAuth.UserInfo?.userid || route.query.listid) && detail.sort > 1">
                                    <i class="fas fa-trash-alt"></i>
                                </li>
                                <li @click="sharePlaylist">
                                    <i class="fas fa-share-alt"></i>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 导航按钮 -->
        <i class="location-arrow fas fa-location-arrow" @click="scrollToItem" :title="t('dang-qian-bo-fang-ge-qu')"></i>
        <img :src="`./assets/images/lemon.gif`" class="scroll-bottom-img" @click="scrollToFirstItem" :title="t('fan-hui-ding-bu')"/>

        <!-- 歌曲列表 -->
        <div class="track-list-container">
            <div class="track-list-header">
                <h2 class="track-list-title"><span>{{ $t('ge-qu-lie-biao') }}</span> ( {{ tracks.length }} )</h2>
                <input type="text" v-model="searchQuery" @keyup.enter="searchTracks" :placeholder="t('sou-suo-ge-qu')" class="search-input" />
            </div>
            <RecycleScroller ref="recycleScrollerRef" :items="filteredTracks" :item-size="50" class="track-list" key-field="hash">
                <template #default="{ item, index }">
                    <div class="li" :key="item.hash"
                        @click="playSong(item.hash, item.name, item.cover, item.author)"
                        @contextmenu.prevent="showContextMenu($event, item)">
                        <div class="track-number">{{ index + 1 }}</div>
                        <div class="track-title" :title="item.name">{{ item.name }}
                            <span v-if="item.privilege == 10" class="icon vip-icon">VIP</span>
                            <span v-if="item.isHQ" class="icon sq-icon">HQ</span>
                            <span v-else-if="item.isSQ" class="icon sq-icon">SQ</span>
                        </div>
                        <div class="track-artist" :title="item.author">{{ item.author }}</div>
                        <div class="track-album" :title="item.album">{{ item.album }}</div>
                        <div class="track-timelen">
                            <button v-if="props.playerControl?.currentSong.hash == item.hash" class="queue-play-btn fas fa-music"></button>
                            {{ $formatMilliseconds(item.timelen) }}
                        </div>
                    </div>
                </template>
            </RecycleScroller>
        </div>

        <!-- 歌手简介部分 -->
        <div class="content-section" v-if="isArtist && detail.long_intro && detail.long_intro.length">
            <div v-for="(section, index) in detail.long_intro" :key="index" class="intro-section">
                <h3>{{ section.title }}</h3>
                <div class="section-content">{{ section.content }}</div>
            </div>
        </div>

        <ContextMenu ref="contextMenuRef" :playerControl="playerControl" />
        <div class="note-container">
            <transition-group name="fly-note">
                <div v-for="note in flyingNotes" :key="note.id" class="flying-note" :style="note.style">♪</div>
            </transition-group>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue';
import { RecycleScroller } from 'vue3-virtual-scroller';
import ContextMenu from '../components/ContextMenu.vue';
import { get } from '../utils/request';
import { useRoute, useRouter } from 'vue-router';
import { MoeAuthStore } from '../stores/store';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const MoeAuth = MoeAuthStore();
const router = useRouter();
const route = useRoute();

// 判断是歌手还是歌单
const isArtist = computed(() => !!route.query.singerid);

// 通用状态
const detail = ref({});
const tracks = ref([]);
const filteredTracks = ref([]);
const searchQuery = ref('');
const pageSize = ref(250);
const contextMenuRef = ref(null);
const recycleScrollerRef = ref(null);
const loading = ref(true);
const isDropdownVisible = ref(false);
const flyingNotes = ref([]);
let noteId = 0;

// 歌手特有状态
const isFollowed = ref(true);
const followLoading = ref(false);

const props = defineProps({
    playerControl: Object
});

onMounted(() => {
    isFollowed.value = !!route.query.unfollow;
    loadData();
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});

watch(() => [route.query.global_collection_id, route.query.singerid], () => {
    loadData();
});

const loadData = async () => {
    if(!route.query.global_collection_id && !route.query.singerid) {
        router.push('/library');
        return;
    }
    if (isArtist.value) {
        getArtistInfo();
        fetchArtistSongs();
    } else {
        getPlaylistDetail();
    }
};

// 获取歌手信息
const getArtistInfo = async () => {
    try {
        const response = await get('/artist/detail', {
            id: route.query.singerid
        });
        if (response.status === 1) {
            detail.value = {
                ...response.data,
                id: route.query.singerid
            };
        }
    } catch (error) {
        console.error('获取歌手信息失败:', error);
    }
};

// 获取歌单信息
const getPlaylistDetail = async () => {
    try {
        const response = await get('/playlist/detail', { 
            ids: route.query.global_collection_id 
        });
        if (response.status === 1) {
            detail.value = response.data[0];
            await fetchPlaylistTracks();
        }
    } catch (error) {
        console.error('获取歌单信息失败:', error);
    }
};

// 获取歌手歌曲
const fetchArtistSongs = async () => {
    let allTracks = [];
    let currentPage = 1;
    
    try {
        const firstPageResponse = await get('/artist/audios', {
            id: route.query.singerid,
            sort: 'hot',
            page: currentPage,
            pagesize: pageSize.value
        });
        
        if (firstPageResponse.status === 1) {
            const formattedTracks = firstPageResponse.data.map(track => ({
                hash: track.hash || '',
                OriSongName: track.audio_name + ' - ' + track.author_name,
                name: track.audio_name || '',
                author: track.author_name || '',
                album: track.album_name || '',
                cover: track.trans_param.union_cover?.replace("{size}", 480) || '',
                timelen: track.timelength || 0,
                isSQ: track.hash_flac !== '',
                isHQ: track.hash_320 !== '',
                privilege: track.privilege || 0,
                originalData: track
            }));
            
            allTracks = formattedTracks;
            tracks.value = allTracks;
            filteredTracks.value = allTracks;
            currentPage++;
        }
    } catch (error) {
        window.$modal.alert(t('ge-qu-shu-ju-cuo-wu'));
        return;
    }

    const totalPages = Math.ceil(detail.value.song_count / pageSize.value);
    for (let i = 1; i < totalPages; i++) {
        try {
            const response = await get('/artist/audios', {
                id: route.query.singerid,
                sort: 'hot',
                page: currentPage,
                pagesize: pageSize.value
            });
            
            if (response.status === 1) {
                if (response.data.length > 0) {
                    const formattedTracks = response.data.map(track => ({
                        hash: track.hash || '',
                        OriSongName: track.audio_name + ' - ' + track.author_name,
                        name: track.audio_name || '',
                        author: track.author_name || '',
                        album: track.album_name || '',
                        cover: track.trans_param.union_cover?.replace("{size}", 480) || '',
                        timelen: track.timelength || 0,
                        isSQ: track.hash_flac !== '',
                        isHQ: track.hash_320 !== '',
                        privilege: track.privilege || 0,
                        originalData: track
                    }));
                    
                    allTracks = allTracks.concat(formattedTracks);
                    currentPage++;
                }
                if (response.data.length < pageSize.value) break;
            } else {
                break;
            }
        } catch (error) {
            console.error('获取更多歌手歌曲失败:', error);
            break;
        }
    }
    
    tracks.value = allTracks;
    filteredTracks.value = allTracks;
    loading.value = false;
};

// 获取歌单歌曲
const fetchPlaylistTracks = async () => {
    let allTracks = [];
    let currentPage = 1;
    
    try {
        const firstPageResponse = await get('/playlist/track/all', {
            id: route.query.global_collection_id,
            page: currentPage,
            pagesize: pageSize.value
        });
        
        if (firstPageResponse.status === 1) {
            const formattedTracks = firstPageResponse.data.info.map(track => {
                const nameParts = track.name.split(' - ');
                return {
                    hash: track.hash || '',
                    OriSongName: track.name,
                    name: nameParts.length > 1 ? nameParts[1] : track.name,
                    author: nameParts.length > 1 ? nameParts[0] : '',
                    album: track.albuminfo?.name || '',
                    cover: track.cover?.replace("{size}", 480) || '',
                    timelen: track.timelen || 0,
                    isSQ: track.relate_goods && track.relate_goods.length > 2,
                    isHQ: track.relate_goods && track.relate_goods.length > 1,
                    privilege: track.privilege || 0,
                    originalData: track
                };
            });
            
            allTracks = formattedTracks;
            tracks.value = allTracks;
            filteredTracks.value = allTracks;
            currentPage++;
        }
    } catch (error) {
        window.$modal.alert(t('ge-qu-shu-ju-cuo-wu'));
        return;
    }

    const totalPages = Math.ceil(detail.value.count / pageSize.value);
    for (let i = 1; i < totalPages; i++) {
        try {
            const response = await get('/playlist/track/all', {
                id: route.query.global_collection_id,
                page: currentPage,
                pagesize: pageSize.value
            });
            
            if (response.status === 1) {
                if (response.data.info.length > 0) {
                    const formattedTracks = response.data.info.map(track => {
                        const nameParts = track.name.split(' - ');
                        return {
                            hash: track.hash || '',
                            OriSongName: track.name,
                            name: nameParts.length > 1 ? nameParts[1] : track.name,
                            author: nameParts.length > 1 ? nameParts[0] : '',
                            album: track.albuminfo?.name || '',
                            cover: track.cover?.replace("{size}", 480) || '',
                            timelen: track.timelen || 0,
                            isSQ: track.relate_goods && track.relate_goods.length > 2,
                            isHQ: track.relate_goods && track.relate_goods.length > 1,
                            privilege: track.privilege || 0,
                            originalData: track
                        };
                    });
                    
                    allTracks = allTracks.concat(formattedTracks);
                    currentPage++;
                }
                if (response.data.info.length < pageSize.value) break;
            } else {
                break;
            }
        } catch (error) {
            console.error('获取更多歌单歌曲失败:', error);
            break;
        }
    }
    
    tracks.value = allTracks;
    filteredTracks.value = allTracks;
    loading.value = false;
};

// 搜索歌曲
const searchTracks = () => {
    filteredTracks.value = tracks.value.filter(track => 
        track.name.toLowerCase().trim().includes(searchQuery.value.toLowerCase().trim()) ||
        track.author.toLowerCase().trim().includes(searchQuery.value.toLowerCase().trim())
    );
};

// 播放歌曲
const playSong = (hash, name, img, author) => {
    props.playerControl.addSongToQueue(hash, name, img, author);
};

// 添加整个播放列表到队列
const addPlaylistToQueue = (event) => {
    const playButton = event.currentTarget;
    const rect = playButton.getBoundingClientRect();
    const note = {
        id: noteId++,
        style: {
            '--start-x': `${rect.left + rect.width/2}px`,
            '--start-y': `${rect.top + rect.height/2}px`,
            'left': '0',
            'top': '0'
        }
    };
    flyingNotes.value.push(note);
    setTimeout(() => {
        flyingNotes.value = flyingNotes.value.filter(n => n.id !== note.id);
    }, 1500);
    props.playerControl.addPlaylistToQueue(filteredTracks.value);
};

// 切换关注状态
const toggleFollow = async () => {
    if (!MoeAuth.isAuthenticated) {
        window.$modal.alert(t('qing-xian-deng-lu'));
        return;
    }
    followLoading.value = true;
    try {
        const response = await get(isFollowed.value ? '/artist/unfollow' : '/artist/follow', {
            id: route.query.singerid
        });
        if (response.status === 1) {
            isFollowed.value = !isFollowed.value;
        }
    } catch (error) {
        console.error('切换关注状态失败:', error);
    } finally {
        followLoading.value = false;
        localStorage.setItem('t', Date.now());
    }
};

// 收藏歌单
const toggleFavorite = async (id) => {
    if (!MoeAuth.isAuthenticated) {
        window.$modal.alert(t('qing-xian-deng-lu'));
        return;
    }
    
    try {
        await get('/playlist/add', { 
            name: detail.value.name, 
            list_create_userid: MoeAuth.UserInfo.userid, 
            type: 1,
            list_create_gid: id 
        });
        localStorage.setItem('t', Date.now());
        window.$modal.alert(t('shou-cang-cheng-gong'));
    } catch (error) {
        window.$modal.alert(t('shou-cang-shi-bai'));
    }
};

// 删除歌单
const deletePlaylist = async () => {
    isDropdownVisible.value = false;
    const result = await window.$modal.confirm(t('que-ren-shan-chu-ge-dan'));
    if (result) {
        await get('/playlist/del', { listid: route.query.listid });
        localStorage.setItem('t', Date.now());
        router.back();
    }
};

// 分享歌单
const sharePlaylist = () => {
    isDropdownVisible.value = false;
    navigator.clipboard.writeText(route.query.global_collection_id);
    window.$modal.alert(t('yi-fu-zhi-fen-xiang-ma-qing-zai-moekoe-ke-hu-duan-zhong-fang-wen'));
};

// 右键菜单
const showContextMenu = (event, song) => {
    if (contextMenuRef.value) {
        contextMenuRef.value.openContextMenu(event, { 
            OriSongName: song.OriSongName, 
            FileHash: song.hash, 
            fileid: song.originalData.fileid,
            userid: isArtist.value ? null : detail.value.list_create_userid,
            timeLength: song.timelen,
            cover: song.cover,
        }, isArtist.value ? null : detail.value.listid);
    }
};

// 滚动到当前播放歌曲
const scrollToItem = () => {
    const currentIndex = filteredTracks.value.findIndex(song => song.hash === props.playerControl.currentSong.hash);
    if (currentIndex !== -1) {
        recycleScrollerRef.value.scrollToItem(currentIndex - 5, { behavior: 'smooth' });
    }
};

// 滚动到顶部
const scrollToFirstItem = () => {
    recycleScrollerRef.value.scrollToItem(0, { behavior: 'smooth' });
    window.scrollTo({
        top: 0,
        behavior: 'smooth' 
    });
};

// 处理下拉菜单点击外部关闭
const handleClickOutside = (event) => {
    const dropdown = document.querySelector('.dropdown-menu');
    const moreBtn = document.querySelector('.more-btn');
    if (dropdown && !dropdown.contains(event.target) && !moreBtn.contains(event.target)) {
        isDropdownVisible.value = false;
    }
};

// 切换下拉菜单显示状态
const toggleDropdown = () => {
    isDropdownVisible.value = !isDropdownVisible.value;
};
</script>

<style scoped>
.detail-page {
    padding: 20px;
}

/* 头部样式 */
.header {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
}

.cover-art {
    width: 200px;
    height: 200px;
    border-radius: 10px;
    margin-right: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    object-fit: cover;
}

.artist-avatar {
    border-radius: 50%;
}

.info {
    max-width: 600px;
}

.title {
    font-size: 36px;
    font-weight: bold;
    width: 800px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
    color: var(--primary-color);
}

.subtitle {
    font-size: 18px;
    color: #666;
}

.meta {
    font-size: 14px;
    margin-bottom: 10px;
    color: #999;
}

.stats {
    display: flex;
    gap: 20px;
    color: #666;
    margin-top: 10px;
}

.description {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 20px;
    font-size: 16px;
    max-height: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: break-spaces;
    overflow-y: auto;
}

.actions {
    display: flex;
    gap: 10px;
}

.primary-btn, .follow-btn {
    background-color: #ff69b4;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.primary-btn i, .follow-btn i {
    margin-right: 5px;
}

.follow-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.fav-btn,
.more-btn {
    background-color: transparent;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    border: 1px solid var(--secondary-color);
}

.fav-btn i {
    color: var(--color-primary);
}

/* 歌曲列表样式 */
.track-list-container {
    margin-top: 30px;
}

.track-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.track-list-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    color: var(--primary-color);
}

.search-input {
    width: 250px;
    padding: 8px;
    border: 1px solid var(--secondary-color);
    border-radius: 20px;
    box-sizing: border-box;
    padding-left: 15px;
}

.track-list {
    height: 800px;
}

.li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
    border-radius: 5px;
    cursor: pointer;
}

.li:hover {
    background-color: var(--background-color);
}

.track-number {
    font-weight: bold;
    margin-right: 10px;
    width: 30px;
}

.track-title {
    flex: 2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-artist {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px;
}

.track-album {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px;
}

.track-timelen {
    width: 95px;
    text-align: right;
}

.icon {
    margin-left: 5px;
    border: 1px solid;
    border-radius: 5px;
    font-size: 10px;
    padding-left: 6px;
    padding-right: 6px;
}

.vip-icon {
    color: #ff6d00;
}

.sq-icon {
    color: #0094ff;
}

.queue-play-btn {
    background: none;
    border: none;
    font-size: 16px;
    color: var(--primary-color);
    cursor: pointer;
}

/* 歌手简介部分 */
.content-section {
    margin-top: 50px;
    border-top: 1px dotted var(--secondary-color);
}

.intro-section {
    margin-bottom: 30px;
}

.intro-section h3 {
    color: var(--primary-color);
    margin-bottom: 15px;
}

.section-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--text-color);
}

/* 导航按钮 */
.location-arrow {
    position: fixed;
    bottom: 168px;
    right: 14px;
    z-index: 1;
    cursor: pointer;
    font-size: 37px;
    color: var(--primary-color);
}

.scroll-bottom-img {
    position: fixed;
    width: 60px;
    height: 60px;
    bottom: 110px;
    right: 88px;
    z-index: 1;
    cursor: pointer;
}

/* 下拉菜单 */
.more-btn-container {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    top: 50px;
    z-index: 50;
}

.dropdown-menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.dropdown-menu li {
    padding: 10px;
    cursor: pointer;
}

.dropdown-menu li:hover {
    background-color: #f0f0f0;
}

/* 音符动画 */
.note-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    overflow: hidden;
}

.flying-note {
    position: absolute;
    font-size: 36px;
    color: var(--primary-color);
    pointer-events: none;
    transform-origin: center;
}

.fly-note-enter-active {
    animation: fly-note 2s ease-out forwards;
}

.fly-note-leave-active {
    animation: fly-note 2s ease-out forwards;
}

@keyframes fly-note {
    0% {
        transform: translate(var(--start-x), calc(var(--start-y) - 50px)) rotate(0deg) scale(1.2);
        opacity: 0.9;
    }
    20% {
        transform: translate(calc(var(--start-x) + 20px), calc(var(--start-y) - 70px)) rotate(45deg) scale(1.3);
        opacity: 0.85;
    }
    100% {
        transform: translate(80vw, 100vh) rotate(360deg) scale(0.6);
        opacity: 0;
    }
}
</style>