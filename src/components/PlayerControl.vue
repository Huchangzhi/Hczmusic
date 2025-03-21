<template>
    <div class="player-container">
        <div class="progress-bar" @mousedown="onProgressDragStart" @click="updateProgressFromEvent"
            @mousemove="updateTimeTooltip" @mouseleave="hideTimeTooltip">
            <div class="progress" :style="{ width: progressWidth + '%' }"></div>
            <div class="progress-handle" :style="{ left: progressWidth + '%' }"></div>
            <div v-for="(point, index) in climaxPoints" :key="index" class="climax-point"
                :style="{ left: point.position + '%' }">
            </div>
            <div v-if="showTimeTooltip" class="time-tooltip" :style="{ left: tooltipPosition + 'px' }">
                {{ tooltipTime }}
            </div>
        </div>
        <div class="player-bar">
            <div class="album-art" @click="toggleLyrics">
                <img v-if="currentSong.img" :src="currentSong.img" alt="Album Art" />
                <i v-else class="fas fa-music"></i>
            </div>
            <div class="song-info" @click="toggleLyrics">
                <div class="song-title">{{ currentSong?.name || "MoeKoeMusic" }}</div>
                <div class="artist">{{ currentSong?.author || "MoeJue" }}</div>
            </div>
            <div class="controls">
                <button class="control-btn" @click="playSongFromQueue('previous')">
                    <i class="fas fa-step-backward"></i>
                </button>
                <button class="control-btn" @click="togglePlayPause">
                    <i :class="playing ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button class="control-btn" @click="playSongFromQueue('next')">
                    <i class="fas fa-step-forward"></i>
                </button>
            </div>
            <div class="extra-controls">
                <button class="extra-btn" title="桌面歌词" v-if="isElectron()" @click="desktopLyrics"><i class="fas">词</i></button>
                <button class="extra-btn" title="我喜欢" @click="playlistSelect.toLike()"><i class="fas fa-heart"></i></button>
                <button class="extra-btn" title="收藏至" @click="playlistSelect.fetchPlaylists()"><i class="fas fa-add"></i></button>
                <button class="extra-btn" @click="togglePlaybackMode">
                    <i v-if="currentPlaybackModeIndex != '2'" :class="currentPlaybackMode.icon"
                        :title="currentPlaybackMode.title"></i>
                    <span v-else class="loop-icon" :title="currentPlaybackMode.title">
                        <i class="fas fa-repeat"></i>
                        <sup>1</sup>
                    </span>
                </button>
                <button class="extra-btn" @click="queueList.openQueue()"><i class="fas fa-list"></i></button>
                <!-- 音量控制 -->
                <div class="volume-control" @wheel="handleVolumeScroll">
                    <i :class="isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'" @click="toggleMute"></i>
                    <div class="volume-slider" @mousedown="onDragStart">
                        <div class="volume-progress" :style="{ width: volume + '%' }"></div>
                        <input type="range" min="0" max="100" v-model="volume" @input="changeVolume" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 播放队列 -->
    <QueueList :current-song="currentSong" @add-song-to-queue="addSongToQueue" ref="queueList"/>

    <!-- 全屏歌词界面 -->
    <transition name="slide-up">
        <div v-if="showLyrics" class="lyrics-bg"
            :style="(lyricsBackground == 'on' ? ({ backgroundImage: `url(${currentSong?.img || 'https://random.MoeJue.cn/randbg.php'})` }) : ({ background: 'var(--secondary-color)' }))">
            <div class="lyrics-screen">
                <div class="close-btn">
                    <i class="fas fa-chevron-down" @click="toggleLyrics"></i>
                </div>

                <div class="left-section">
                    <div class="album-art-large">
                        <img v-if="easterEggImage" :src="easterEggImage.src" :class="easterEggClass" alt="Easter Egg" />
                        <img :src="currentSong?.img || 'https://random.MoeJue.cn/randbg.php'" alt="Album Art" />
                    </div>
                    <div class="song-details">
                        <div class="song-title">{{ currentSong?.name }}</div>
                        <div class="artist">{{ currentSong?.author }}</div>
                    </div>

                    <!-- 播放进度条 -->
                    <div class="progress-bar-container">
                        <span class="current-time">{{ formattedCurrentTime }}</span>
                        <div class="progress-bar" @mousedown="onProgressDragStart" @click="updateProgressFromEvent"
                            @mousemove="updateTimeTooltip" @mouseleave="hideTimeTooltip">
                            <div class="progress" :style="{ width: progressWidth + '%' }"></div>
                            <div class="progress-handle" :style="{ left: progressWidth + '%' }"></div>
                            <div v-for="(point, index) in climaxPoints" :key="index" class="climax-point"
                                :style="{ left: point.position + '%' }">
                            </div>
                            <div v-if="showTimeTooltip" class="time-tooltip" :style="{ left: tooltipPosition + 'px' }">
                                {{ tooltipTime }}
                            </div>
                        </div>
                        <span class="duration">{{ formattedDuration }}</span>
                    </div>

                    <div class="player-controls">
                        <button class="control-btn like-btn" title="我喜欢" @click="playlistSelect.toLike()">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="control-btn" @click="playSongFromQueue('previous')">
                            <i class="fas fa-step-backward"></i>
                        </button>
                        <button class="control-btn" @click="togglePlayPause">
                            <i :class="playing ? 'fas fa-pause' : 'fas fa-play'"></i>
                        </button>
                        <button class="control-btn" @click="playSongFromQueue('next')">
                            <i class="fas fa-step-forward"></i>
                        </button>
                        <button class="control-btn" @click="togglePlaybackMode">
                            <i v-if="currentPlaybackModeIndex != '2'" :class="currentPlaybackMode.icon"
                                :title="currentPlaybackMode.title"></i>
                            <span v-else class="loop-icon" :title="currentPlaybackMode.title">
                                <i class="fas fa-repeat"></i>
                                <sup>1</sup>
                            </span>
                        </button>
                    </div>
                </div>
                <div id="lyrics-container">
                    <div v-if="lyricsData.length > 0" id="lyrics"
                        :style="{ fontSize: lyricsFontSize, transform: `translateY(${scrollAmount ? scrollAmount+'px' : '50%'})` }">
                        <div v-for="(lineData, lineIndex) in lyricsData" :key="lineIndex" class="line">
                            <span v-for="(charData, charIndex) in lineData.characters" :key="charIndex" class="char"
                                :class="{ highlight: charData.highlighted }">
                                {{ charData.char }}
                            </span>
                        </div>
                    </div>
                    <div v-else class="no-lyrics">{{ SongTips }}</div>
                </div>
            </div>
        </div>
    </transition>

    <!-- 歌单选择模态框 -->
    <PlaylistSelectModal ref="playlistSelect" :current-song="currentSong" :playlists="playlists"/>

</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, onBeforeUnmount } from 'vue';
import { get } from '../utils/request';
import { useMusicQueueStore } from '../stores/musicQueue';
import { MoeAuthStore } from '../stores/store';
import { useI18n } from 'vue-i18n';
import PlaylistSelectModal from './PlaylistSelectModal.vue';
import QueueList from './QueueList.vue';
const queueList = ref(null);
const playlistSelect = ref(null);
const MoeAuth = MoeAuthStore();
const { t } = useI18n();
const showLyrics = ref(false); // 是否显示歌词
const isDragging = ref(false);
const currentSong = ref({ name: '', author: '', img: '', url: '', hash: '' }); // 当前播放的音乐信息
const playing = ref(false); // 是否正在播放
const isMuted = ref(false); // 是否静音
const volume = ref(66); // 音量初始值为 100
const audio = new Audio(); // 创建音频对象
const musicQueueStore = useMusicQueueStore(); // 使用 Pinia store
let sliderElement = null; // 用来保存音量滑块的 DOM 引用
const progressWidth = ref(0);
const lyricsData = ref([]);
const scrollAmount = ref();
const currentTime = ref(0);
const SongTips = ref(t('zan-wu-ge-ci'));
const lyricsBackground = ref('on');
let currentLineIndex = 0;
const timeoutId = ref(null);
const playbackModes = ref([
    { icon: 'fas fa-random', title: t('sui-ji-bo-fang') },
    { icon: 'fas fa-refresh', title: t('lie-biao-xun-huan') },
    { icon: '', title: t('dan-qu-xun-huan') }
]);
const currentPlaybackModeIndex = ref(0);
const currentPlaybackMode = computed(() => playbackModes.value[currentPlaybackModeIndex.value]);
const isProgressDragging = ref(false);
const isDraggingHandle = ref(false);
const climaxPoints = ref([]);
const NextSong = ref([]);
const playlists = ref([]);
const lyricsFontSize = ref('24px');
const isInputFocused = ref(false);
const playedSongsStack = ref([]);
const currentStackIndex = ref(-1);

// 切换随机/顺序/单曲播放
const togglePlaybackMode = () => {
    currentPlaybackModeIndex.value = (currentPlaybackModeIndex.value + 1) % playbackModes.value.length;
    audio.loop = currentPlaybackModeIndex.value == 2;
    playedSongsStack.value = [];
    currentStackIndex.value = -1;
    localStorage.setItem('player_playback_mode', currentPlaybackModeIndex.value);
};

onMounted(() => {
    const savedVolume = localStorage.getItem('player_volume');
    if (savedVolume !== null) volume.value = parseFloat(savedVolume);
    isMuted.value = volume.value === 0;
    audio.volume = volume.value / 100;
    const current_song = localStorage.getItem('current_song');
    if (current_song) currentSong.value = JSON.parse(current_song);
    currentPlaybackModeIndex.value = localStorage.getItem('player_playback_mode') || 1;
    audio.loop = currentPlaybackModeIndex.value == 2;
    const settings = JSON.parse(localStorage.getItem('settings'));
    if (settings) {
        lyricsBackground.value = settings?.lyricsBackground;
        lyricsFontSize.value = settings?.lyricsFontSize;
    }
    handleShortcut();
    if (current_song && localStorage.getItem('player_progress')) {
        audio.currentTime = localStorage.getItem('player_progress');
        progressWidth.value = (audio.currentTime / currentSong.value.timeLength) * 100;
    }
    initMediaSession();
    getVip();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focus', checkFocus, true);
    document.addEventListener('blur', checkFocus, true);
});
const formattedCurrentTime = computed(() => formatTime(currentTime.value));
const formattedDuration = computed(() => formatTime(currentSong.value?.timeLength || 0));
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
const easterEggImages = [
    { src: './assets/images/miku.png', class: 'miku' },
    { src: './assets/images/miku2.png', class: 'miku2' },
    { src: './assets/images/miku3.png', class: 'miku3' }
];
const easterEggImage = computed(() => {
    const author = currentSong.value?.author || '';
    if (author.includes('初音') || author.includes('Miku')) {
        const randomIndex = Math.floor(Math.random() * easterEggImages.length);
        return easterEggImages[randomIndex];
    }
    return null;
});
const easterEggClass = computed(() => easterEggImage.value?.class || '');
// 播放音乐
const playSong = async (song) => {
    try {
        currentSong.value = structuredClone(song);
        lyricsData.value = [];
        audio.src = song.url;
        try {
            changeMediaSession(currentSong.value);
            await audio.play();
            playing.value = true;
        } catch (playError) {
            console.warn('播放被中断，尝试重新播放:', playError);
            setTimeout(async () => {
                try {
                    await audio.play();
                    playing.value = true;
                } catch (retryError) {
                    window.$modal.alert(t('bo-fang-shi-bai'));
                    playing.value = false;
                }
            }, 100);
        }

        localStorage.setItem('current_song', JSON.stringify(currentSong.value));
        getLyrics(currentSong.value.hash);
        getVip();
        getMusicHighlights(currentSong.value.hash);
    } catch (error) {
        console.error('播放音乐时发生错误:', error);
        playing.value = false;
    }
};

// 获取音乐高潮
const getMusicHighlights = async (hash) => {
    try {
        const response = await get(`/song/climax?hash=${hash}`);
        if (response.status !== 1) {
            climaxPoints.value = [];
            return;
        }
        climaxPoints.value = response.data.map(point => ({
            position: (parseInt(point.start_time) / 1000 / audio.duration) * 100,
            duration: parseInt(point.timelength) / 1000
        }));
    } catch (error) {
        climaxPoints.value = [];
    }
};

// 从队列中播放歌曲
const playSongFromQueue = (direction) => {
    if (musicQueueStore.queue.length === 0) {
        window.$modal.alert(t('ni-huan-mei-you-tian-jia-ge-quo-kuai-qu-tian-jia-ba'));
        return;
    }

    if (direction == 'next') {
        // 添加下一首播放
        if (NextSong.value.length > 0) {
            addSongToQueue(NextSong.value[0].hash, NextSong.value[0].name, NextSong.value[0].img, NextSong.value[0].author);
            NextSong.value.shift();
            return;
        }
    }

    const currentIndex = musicQueueStore.queue.findIndex(song => song.hash === currentSong.value.hash);
    let targetIndex;
    if (currentIndex == -1) {
        targetIndex = 0;
    } else if (currentPlaybackModeIndex.value == 0) {
        if (direction === 'previous' && currentStackIndex.value > 0) {
            currentStackIndex.value--;
            targetIndex = playedSongsStack.value[currentStackIndex.value];
        } else if (direction === 'previous') {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * musicQueueStore.queue.length);
            } while (playedSongsStack.value.length > 0 && newIndex === playedSongsStack.value[currentStackIndex.value]);
            
            playedSongsStack.value.unshift(newIndex);
            targetIndex = newIndex;
        } else if (direction === 'next' && currentStackIndex.value < playedSongsStack.value.length - 1) {
            currentStackIndex.value++;
            targetIndex = playedSongsStack.value[currentStackIndex.value];
        } else if (direction === 'next') {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * musicQueueStore.queue.length);
            } while (playedSongsStack.value.length > 0 && newIndex === playedSongsStack.value[currentStackIndex.value]);
            
            if (currentStackIndex.value < playedSongsStack.value.length - 1) {
                playedSongsStack.value = playedSongsStack.value.slice(0, currentStackIndex.value + 1);
            }
            
            playedSongsStack.value.push(newIndex);
            currentStackIndex.value = playedSongsStack.value.length - 1;
            targetIndex = newIndex;
        }
    } else {
        targetIndex = direction === 'previous'
            ? (currentIndex === 0 ? musicQueueStore.queue.length - 1 : currentIndex - 1)
            : (currentIndex + 1) % musicQueueStore.queue.length;
    }
    addSongToQueue(
        musicQueueStore.queue[targetIndex].hash,
        musicQueueStore.queue[targetIndex].name,
        musicQueueStore.queue[targetIndex].img,
        musicQueueStore.queue[targetIndex].author
    );
};

// 切换播放/暂停
const togglePlayPause = async () => {
    if (!currentSong.value.hash) {
        playSongFromQueue('next');
        return;
    } else if (!audio.src) {
        addSongToQueue(
            currentSong.value.hash,
            currentSong.value.name,
            currentSong.value.img,
            currentSong.value.author,
            false
        );
        return;
    }

    if (playing.value) {
        audio.pause();
        playing.value = false;
    } else {
        try {
            await audio.play();
            playing.value = true;
        } catch (retryError) {
            window.$modal.alert(t('bo-fang-shi-bai'));
        }
    }
};

// 切换静音
const toggleMute = () => {
    isMuted.value = !isMuted.value;
    audio.muted = isMuted.value;
    if (isMuted.value) {
        volume.value = 0;
    } else {
        volume.value = audio.volume * 100;
    }
    localStorage.setItem('player_volume', volume.value);
};

// 更新音量的点击处理函数
const setVolumeOnClick = (event) => {
    const slider = event.target.closest('.volume-slider');
    if (slider) {
        const sliderWidth = slider.offsetWidth;
        const offsetX = event.offsetX;
        volume.value = Math.round((offsetX / sliderWidth) * 100);
        changeVolume();
    }
};

// 开始拖拽时触发，初始化拖拽并实时更新音量
const onDragStart = (event) => {
    sliderElement = event.target.closest('.volume-slider');
    if (sliderElement) {
        isDragging.value = true;
        setVolumeOnClick(event);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onDragEnd);
    }
};

// 拖拽过程中的音量更新
const onDrag = (event) => {
    if (isDragging.value && sliderElement) {
        const sliderWidth = sliderElement.offsetWidth;
        const rect = sliderElement.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const newVolume = Math.max(0, Math.min(100, Math.round((offsetX / sliderWidth) * 100)));
        volume.value = newVolume;
        changeVolume();
    }
};

const onDragEnd = () => {
    isDragging.value = false;
    sliderElement = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onDragEnd);
};

// 音量调节
const changeVolume = () => {
    audio.volume = volume.value / 100;
    localStorage.setItem('player_volume', volume.value);
    isMuted.value = volume.value === 0;
};

// 获取歌单全部歌曲
const getPlaylistAllSongs = async (id) => {
    try {
        let allSongs = [];
        for (let page = 1; page <= 4; page++) {
            const url = `/playlist/track/all?id=${id}&pagesize=300&page=${page}`;
            const response = await get(url);
            if (response.status !== 1) {
                window.$modal.alert(t('huo-qu-ge-dan-shi-bai'));
                return;
            }
            if (Object.keys(response.data.info).length === 0) break;
            allSongs = allSongs.concat(response.data.info);
            if (response.data.info.length < 300) break;
        }
        addPlaylistToQueue(allSongs);
    } catch (error) {
        console.error(error);
        window.$modal.alert(t('huo-qu-ge-dan-shi-bai'));
    }
}

// 添加歌单到播放列表
const addPlaylistToQueue = async (info) => {
    musicQueueStore.clearQueue();
    const songs = info.map((song, index) => {
        return {
            id: index + 1,
            hash: song.hash,
            name: song.name,
            img: song.cover?.replace("{size}", 480) || './assets/images/ico.png',
            author: song.author,
            timeLength: song.timelen
        };
    });
    musicQueueStore.queue = songs;
    let startIndex = 0;
    if (currentPlaybackModeIndex.value == 0) {
        startIndex = Math.floor(Math.random() * songs.length);
    }
    addSongToQueue(songs[startIndex].hash, songs[startIndex].name, songs[startIndex].img, songs[startIndex].author);
};

// 添加歌曲到队列并播放的方法
const addSongToQueue = async (hash, name, img, author, isReset = true) => {
    const currentSongHash = currentSong.value.hash;
    try {
        clearTimeout(timeoutId.value);
        currentSong.value.author = author;
        currentSong.value.name = name;
        currentSong.value.img = img;
        currentSong.value.hash = hash;
        const settings = JSON.parse(localStorage.getItem('settings'));
        const data = {
            hash: hash
        }
        if(!MoeAuth.isAuthenticated) data.free_part = 1;
        if(MoeAuth.isAuthenticated && settings?.quality === 'lossless' && settings?.qualityCompatibility === 'off') data.quality = 'flac';
        if(MoeAuth.isAuthenticated && settings?.quality === 'hires' && settings?.qualityCompatibility === 'off') data.quality = 'high';

        const response = await get('/song/url',data);
        if (response.status !== 1) {
            currentSong.value.author = currentSong.value.name = t('huo-qu-yin-le-shi-bai');
            if (response.status == 3) {
                currentSong.value.name = t('gai-ge-qu-zan-wu-ban-quan')
            }
            if (musicQueueStore.queue.length === 0) return;
            currentSong.value.author = t('3-miao-hou-zi-dong-qie-huan-xia-yi-shou');
            timeoutId.value = setTimeout(() => {
                playSongFromQueue('next');
            }, 3000);
            return;
        }

        if (response.extName == 'mp4') {
            addSongToQueue(hash, name, img, author, false);
            return;
        }
        
        if (isReset) {
            localStorage.setItem('player_progress', 0);
            audio.currentTime = progressWidth.value = 0;
        }

        const existingSongIndex = musicQueueStore.queue.findIndex(song => song.hash === hash);

        if (existingSongIndex === -1) {
            const song = {
                id: musicQueueStore.queue.length + 1,
                hash: hash,
                name: name,
                img: img,
                author: author,
                timeLength: response.timeLength,
                url: response.url[0]
            };

            const currentIndex = musicQueueStore.queue.findIndex(song => song.hash == currentSongHash);
            if (currentIndex !== -1) {
                musicQueueStore.queue.splice(currentIndex + 1, 0, song);
            } else {
                musicQueueStore.addSong(song);
            }
            playSong(song);
        } else {
            const updatedQueue = [...musicQueueStore.queue];
            const newSong = {
                id: musicQueueStore.queue[existingSongIndex].id,
                hash: hash,
                name: name,
                img: img,
                author: author,
                timeLength: response.timeLength,
                url: response.url[0]
            };
            updatedQueue[existingSongIndex] = newSong;
            musicQueueStore.setQueue(updatedQueue);
            playSong(newSong);
        }
    } catch (error) {
        currentSong.value.author = currentSong.value.name = t('huo-qu-yin-le-di-zhi-shi-bai');
        if (musicQueueStore.queue.length === 0) return;
        currentSong.value.author = t('3-miao-hou-zi-dong-qie-huan-xia-yi-shou');
        timeoutId.value = setTimeout(() => {
            playSongFromQueue('next');
        }, 3000);
    }
};

// 音乐播放结束后自动播放下一首
audio.addEventListener('ended', () => {
    if (currentPlaybackModeIndex.value == 2) return;
    playSongFromQueue('next');
});
const handleAudioEvent = (event) => {
    playing.value = event.type === 'play';
    if(isElectron()){
        window.electron.ipcRenderer.send('play-pause-action', playing.value);
    }
};

audio.addEventListener('pause', handleAudioEvent);
audio.addEventListener('play', handleAudioEvent);

const toggleLyrics = async () => {
    showLyrics.value = !showLyrics.value;
    SongTips.value = t('huo-qu-ge-ci-zhong');
    if (!currentSong.value) return;
    try {
        if (lyricsData.value.length != 0) return;
        getLyrics(currentSong.value.hash)
    } catch (error) {
        SongTips.value = t('huo-qu-ge-ci-shi-bai');
    }
};

// 请求歌词
const getLyrics = async (hash) => {
    try {
        const savedConfig = JSON.parse(localStorage.getItem('settings'));
        if (!showLyrics.value && savedConfig?.desktopLyrics === 'off') return;
        const lyricSearchResponse = await get(`/search/lyric?hash=${hash}`);
        if (lyricSearchResponse.status !== 200 || lyricSearchResponse.candidates.length === 0) {
            SongTips.value = t('zan-wu-ge-ci');
            return;
        }
        const lyricResponse = await get(`/lyric?id=${lyricSearchResponse.candidates[0].id}&accesskey=${lyricSearchResponse.candidates[0].accesskey}&decode=true`);
        if (lyricResponse.status !== 200) {
            SongTips.value = t('huo-qu-ge-ci-shi-bai');
            return;
        }
        parseLyrics(lyricResponse.decodeContent);
        centerFirstLine();
    } catch (error) {
        SongTips.value = t('huo-qu-ge-ci-shi-bai');
        return;
    }
}

const parseLyrics = (text) => {
    const lines = text.split('\n');
    const parsedLyrics = lines
        .map((line) => {
            const match = line.match(/^\[(\d+),(\d+)\](.*)/);
            if (match) {
                const time = parseInt(match[1]);
                const duration = parseInt(match[2]);
                const lyric = match[3].replace(/<.*?>/g, '');
                const characters = lyric.split('').map((char, index) => ({
                    char,
                    startTime: time + (index * duration) / lyric.length,
                    endTime: time + ((index + 1) * duration) / lyric.length,
                    highlighted: false,
                }));
                return { characters };
            }
            return null;
        })
        .filter((line) => line);
    lyricsData.value = parsedLyrics;
};

// 添加到下一首 
const addToNext = async (hash, name, img, author, timeLength) => {
    const existingSongIndex = musicQueueStore.queue.findIndex(song => song.hash === hash);
    if (existingSongIndex !== -1) {
        queueList.value.removeSongFromQueue(existingSongIndex);
    }
    const currentIndex = musicQueueStore.queue.findIndex(song => song.hash === currentSong.value.hash);
    musicQueueStore.queue.splice(currentIndex !== -1 ? currentIndex + 1 : musicQueueStore.queue.length, 0, {
        id: musicQueueStore.queue.length + 1,
        hash: hash,
        name: name,
        img: img,
        author: author,
        timeLength: timeLength,
    });

    NextSong.value.push({
        id: musicQueueStore.queue.length + 1,
        hash: hash,
        name: name,
        img: img,
        author: author,
        timeLength: timeLength,
    });
};
const centerFirstLine = () => {
    const lyricsContainer = document.getElementById('lyrics-container');
    if (!lyricsContainer) return;
    const containerHeight = lyricsContainer.offsetHeight;
    const lyricsElement = document.getElementById('lyrics');
    if (!lyricsElement) return;
    const lyricsHeight = lyricsElement.offsetHeight;
    scrollAmount.value = (containerHeight - lyricsHeight) / 2;
};
const throttle = (func, delay) => {
    let lastTime = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastTime >= delay) {
            lastTime = now;
            func.apply(this, args);
        }
    };
};
// 监听方法
const highlightCurrentChar = (currentTime) => {
    lyricsData.value.forEach((lineData, index) => {
        let isLineHighlighted = false;
        lineData.characters.forEach((charData) => {
            if (currentTime * 1000 >= charData.startTime && !charData.highlighted) {
                charData.highlighted = true;
                isLineHighlighted = true;
            }
        });

        if (isLineHighlighted && currentLineIndex !== index) {
            currentLineIndex = index;
            const lyricsContainer = document.getElementById('lyrics-container');
            if (!lyricsContainer) return;
            const containerHeight = lyricsContainer.offsetHeight;
            const lineElement = document.querySelectorAll('.line')[index];
            if (lineElement) {
                const lineHeight = lineElement.offsetHeight;
                scrollAmount.value = -lineElement.offsetTop + (containerHeight / 2) - (lineHeight / 2); // 计算中心位置
            }
        }
    });
};
// 节流处理
const throttledHighlight = throttle(() => {
    currentTime.value = audio.currentTime; // 实时更新当前时间
    if (!isProgressDragging.value) {  // 只在非拖动状态更新进度条
        progressWidth.value = (currentTime.value / audio.duration) * 100;
    }
    const savedConfig = JSON.parse(localStorage.getItem('settings'));
    if (audio && lyricsData.value) {
        if (showLyrics.value) {
            highlightCurrentChar(audio.currentTime);
        }
        if (isElectron() && savedConfig?.desktopLyrics === 'on') {
            window.electron.ipcRenderer.send('lyrics-data', { currentTime: audio.currentTime, lyricsData: JSON.parse(JSON.stringify(lyricsData.value)) });
        }
    } else if (isElectron() && savedConfig?.desktopLyrics === 'on') {
        getLyrics(currentSong.value.hash)
    }
    localStorage.setItem('player_progress', audio.currentTime);
}, 200);
// 启动监听
audio.addEventListener('timeupdate', throttledHighlight);

defineExpose({
    addSongToQueue,
    getPlaylistAllSongs,
    addPlaylistToQueue,
    addToNext,
    currentSong
});

onUnmounted(() => {
    if (isElectron()) {
        window.electron.ipcRenderer.removeAllListeners('play-previous-track');
        window.electron.ipcRenderer.removeAllListeners('play-next-track');
        window.electron.ipcRenderer.removeAllListeners('volume-up');
        window.electron.ipcRenderer.removeAllListeners('volume-down');
        window.electron.ipcRenderer.removeAllListeners('toggle-play-pause');
        window.electron.ipcRenderer.removeAllListeners('toggle-mute');
        window.electron.ipcRenderer.removeAllListeners('toggle-like');
        window.electron.ipcRenderer.removeAllListeners('toggle-mode');
    }
    document.removeEventListener('keydown', handleKeyDown);
});
onBeforeUnmount(() => {
    document.removeEventListener('focus', checkFocus, true);
    document.removeEventListener('blur', checkFocus, true);
});
const isElectron = () => {
    return typeof window !== 'undefined' && typeof window.electron !== 'undefined';
};
const handleVolumeScroll = (event) => {
    event.preventDefault();
    const delta = Math.sign(event.deltaY) * -1;
    volume.value = Math.min(Math.max(volume.value + delta * 10, 0), 100);
    changeVolume();
};
const getVip = async() => {
    if(!MoeAuth.isAuthenticated) return;
    const lastRequestTime = localStorage.getItem('lastVipRequestTime');
    if (lastRequestTime) {
        const now = new Date().getTime();
        const elapsedTime = now - parseInt(lastRequestTime);
        const threeHours = 3 * 60 * 60 * 1000;
        if (elapsedTime < threeHours) {
            return;
        }
    }
    try {
        await get('/youth/vip');
    } catch (error) {
        console.error('领取VIP失败:', error);
    }
    localStorage.setItem('lastVipRequestTime', new Date().getTime().toString());
}

const handleShortcut = (event) => {
    if (isElectron()) {
        window.electron.ipcRenderer.on('play-previous-track', () => playSongFromQueue('previous'));
        window.electron.ipcRenderer.on('play-next-track', () => playSongFromQueue('next'));
        window.electron.ipcRenderer.on('volume-up', () => {
            volume.value = Math.min(volume.value + 10, 100);
            changeVolume();
        });
        window.electron.ipcRenderer.on('volume-down', () => {
            volume.value = Math.max(volume.value - 10, 0);
            changeVolume();
        });
        window.electron.ipcRenderer.on('toggle-play-pause', () => {
            togglePlayPause();
        });
        window.electron.ipcRenderer.on('toggle-mute', () => {
            toggleMute();
        });
        window.electron.ipcRenderer.on('toggle-like', () => {
            playlistSelect.value.toLike();
        });
        window.electron.ipcRenderer.on('toggle-mode', () => {
            togglePlaybackMode();
        });
    }
}

// 修改进度条拖动
const onProgressDragStart = (event) => {
    event.preventDefault();

    const currentProgressBar = event.target.closest('.progress-bar');
    if (!currentProgressBar) return;

    // 检查是否点击在小圆点上
    const handle = event.target.closest('.progress-handle');
    if (!handle) {
        if (!audio.duration) return;
        const rect = currentProgressBar.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(event.clientX - rect.left, currentProgressBar.offsetWidth));
        const percentage = (offsetX / currentProgressBar.offsetWidth) * 100;
        progressWidth.value = Math.max(0, Math.min(percentage, 100));
    }

    isProgressDragging.value = true;
    isDraggingHandle.value = true;

    activeProgressBar.value = currentProgressBar;

    document.addEventListener('mousemove', onProgressDrag);
    document.addEventListener('mouseup', onProgressDragEnd);
};

// 添加一个 ref 来保存当前活动的进度条元素
const activeProgressBar = ref(null);

const onProgressDrag = (event) => {
    event.preventDefault();
    if (isProgressDragging.value && activeProgressBar.value) {
        const rect = activeProgressBar.value.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(event.clientX - rect.left, activeProgressBar.value.offsetWidth));
        const percentage = (offsetX / activeProgressBar.value.offsetWidth) * 100;
        progressWidth.value = Math.max(0, Math.min(percentage, 100));

        // 更新时间提示
        tooltipPosition.value = offsetX;
        const time = (percentage / 100) * audio.duration;
        tooltipTime.value = formatTime(time);
    }
};

// 重置歌词高亮
const resetLyricsHighlight = (currentTimeInSeconds) => {
    if (!lyricsData.value) return;

    // 重置所有字符的高亮状态
    lyricsData.value.forEach((lineData, lineIndex) => {
        lineData.characters.forEach(charData => {
            charData.highlighted = (currentTimeInSeconds * 1000 >= charData.startTime);
        });

        // 找到当前应该显示的行
        const isCurrentLine = lineData.characters.some(char =>
            currentTimeInSeconds * 1000 >= char.startTime &&
            currentTimeInSeconds * 1000 <= char.endTime
        );

        if (isCurrentLine) {
            currentLineIndex = lineIndex;
            const lyricsContainer = document.getElementById('lyrics-container');
            if (!lyricsContainer) return;
            const containerHeight = lyricsContainer.offsetHeight;
            const lineElement = document.querySelectorAll('.line')[lineIndex];
            if (lineElement) {
                const lineHeight = lineElement.offsetHeight;
                scrollAmount.value = -lineElement.offsetTop + (containerHeight / 2) - (lineHeight / 2);
            }
        }
    });
};

const onProgressDragEnd = (event) => {
    if (isProgressDragging.value && activeProgressBar.value) {
        const rect = activeProgressBar.value.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(event.clientX - rect.left, activeProgressBar.value.offsetWidth));
        const percentage = (offsetX / activeProgressBar.value.offsetWidth) * 100;
        const newTime = (percentage / 100) * audio.duration;

        audio.currentTime = Math.max(0, Math.min(newTime, audio.duration));
        resetLyricsHighlight(audio.currentTime);
    }
    isProgressDragging.value = false;
    isDraggingHandle.value = false;
    showTimeTooltip.value = false;
    activeProgressBar.value = null;
    document.removeEventListener('mousemove', onProgressDrag);
    document.removeEventListener('mouseup', onProgressDragEnd);
};

// 修改点击进度条的处理方法
const updateProgressFromEvent = (event) => {
    if (isProgressDragging.value) return; // 如果正在拖动则不处理点击

    const progressBar = event.target.closest('.progress-bar');
    if (!progressBar || !audio.duration) return;

    const rect = progressBar.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(event.clientX - rect.left, progressBar.offsetWidth));
    const percentage = (offsetX / progressBar.offsetWidth) * 100;
    const newTime = (percentage / 100) * audio.duration;

    audio.currentTime = Math.max(0, Math.min(newTime, audio.duration));
    progressWidth.value = percentage;
    resetLyricsHighlight(audio.currentTime);
};

// 在进度条模板中添加时间提示
const showTimeTooltip = ref(false);
const tooltipPosition = ref(0);
const tooltipTime = ref('0:00');

const updateTimeTooltip = (event) => {
    const progressBar = event.target.closest('.progress-bar');
    if (!progressBar || !audio.duration) return;

    const rect = progressBar.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(event.clientX - rect.left, progressBar.offsetWidth));
    
    const tooltipWidth = 50;
    if (offsetX < tooltipWidth / 2) {
        tooltipPosition.value = tooltipWidth / 2;
    } else if (offsetX > progressBar.offsetWidth - tooltipWidth / 2) {
        tooltipPosition.value = progressBar.offsetWidth - tooltipWidth / 2;
    } else {
        tooltipPosition.value = offsetX;
    }

    const percentage = (offsetX / progressBar.offsetWidth);
    const time = percentage * audio.duration;
    tooltipTime.value = formatTime(time);

    showTimeTooltip.value = true;
};

const hideTimeTooltip = () => {
    if (!isProgressDragging.value) {
        showTimeTooltip.value = false;
    }
};

const initMediaSession = () => {
    if (!("mediaSession" in navigator) || !navigator.mediaSession) return;
    navigator.mediaSession.setActionHandler('play', togglePlayPause);
    navigator.mediaSession.setActionHandler('pause', togglePlayPause);
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        playSongFromQueue('previous');
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
        playSongFromQueue('next');
    });
};

const changeMediaSession = (song) => {
    if (!("mediaSession" in navigator) || !navigator.mediaSession) return;

    const defaultArtwork = './assets/images/logo.png';
    const checkImageAccessibility = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => resolve(defaultArtwork);
            img.src = src;
        });
    };

    const updateMediaSession = async () => {
        try {
            const artworkSrc = await checkImageAccessibility(song.img || defaultArtwork);
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.name,
                artist: song.author,
                album: song.album,
                artwork: [{ src: artworkSrc }]
            });
        } catch (error) {
            console.error("Failed to update media session metadata:", error);
        }
    };
    updateMediaSession();
};

const checkFocus = () => {
    isInputFocused.value = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
};
// 处理键盘按下事件
const handleKeyDown = (event) => {
    if(isInputFocused.value) return;
    switch (event.code) {
        case 'Space':
            event.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            playSongFromQueue('previous');
            break;
        case 'ArrowRight':
            playSongFromQueue('next');
            break;
    }
};

const desktopLyrics = () => {
    let savedConfig = JSON.parse(localStorage.getItem('settings')) || {};
    if(!savedConfig?.desktopLyrics) savedConfig.desktopLyrics = 'off';
    let action = savedConfig?.desktopLyrics === 'off' ? 'display-lyrics' : 'close-lyrics';
    window.electron.ipcRenderer.send('desktop-lyrics-action', action);
    savedConfig.desktopLyrics = action === 'display-lyrics' ? 'on' : 'off';
    localStorage.setItem('settings', JSON.stringify(savedConfig));
};
</script>


<style scoped>
@import '@/assets/style/PlayerControl.css';
</style>