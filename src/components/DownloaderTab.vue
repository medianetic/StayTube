<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Search, Download, Loader2, CheckCircle2, AlertCircle, Youtube, Languages, Settings2, PlayCircle } from 'lucide-vue-next'

interface DownloadItem {
  url: string
  title: string
  thumbnail?: string
  progress: number
  status: 'downloading' | 'completed' | 'error'
  error?: string
  filePath?: string
  timestamp: Date
}

useI18n()

const url = ref('')
const loadingMetadata = ref(false)
const metadata = ref<any>(null)
const selectedFormat = ref('best')
const enableSubtitles = ref(false)
const selectedSubLang = ref('en')
const activeDownloads = ref<DownloadItem[]>([])
const localVideos = ref<any[]>([])
const error = ref('')

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

const loadLocalVideos = async () => {
  const videos = await window.api.listVideos()
  localVideos.value = videos
}

const fetchMetadata = async () => {
  if (!url.value) return
  loadingMetadata.value = true
  error.value = ''
  metadata.value = null
  
  try {
    const data = await window.api.getMetadata(url.value)
    metadata.value = data
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch metadata. Please check the URL.'
  } finally {
    loadingMetadata.value = false
  }
}

const startDownload = async () => {
  if (!metadata.value) return

  const exists = await window.api.checkVideoExists(metadata.value.title)
  if (exists) {
    const confirmDownload = window.confirm(`"${metadata.value.title}" already exists in your library. Do you want to download it again?`)
    if (!confirmDownload) return
  }

  const newDownload: DownloadItem = {
    url: url.value,
    title: metadata.value.title,
    thumbnail: metadata.value.thumbnail,
    progress: 0,
    status: 'downloading',
    timestamp: new Date()
  }

  activeDownloads.value.unshift(newDownload)
  const currentUrl = url.value
  
  const downloadOptions = {
    url: currentUrl,
    title: metadata.value.title,
    format: selectedFormat.value,
    subtitles: enableSubtitles.value,
    subtitleLang: selectedSubLang.value
  }

  url.value = ''
  metadata.value = null

  try {
    const result = await window.api.startDownload(downloadOptions) as any
    const item = activeDownloads.value.find(d => d.url === currentUrl)
    if (item) {
      item.status = 'completed'
      item.progress = 100
      item.filePath = result.filePath
    }
    await loadLocalVideos()
  } catch (e: any) {
    const item = activeDownloads.value.find(d => d.url === currentUrl)
    if (item) {
      item.status = 'error'
      item.error = e.message
    }
  }
}

const openFile = (filePath?: string) => {
  if (filePath) {
    window.api.openFile(filePath)
  }
}

onMounted(async () => {
  loadLocalVideos()
  
  // Load default preferences
  const defQuality = await window.api.getStoreValue('defaultQuality')
  if (defQuality) selectedFormat.value = defQuality
  
  const defSubtitles = await window.api.getStoreValue('defaultSubtitles')
  if (defSubtitles !== undefined) enableSubtitles.value = defSubtitles
  
  const defSubLang = await window.api.getStoreValue('defaultSubLang')
  if (defSubLang) selectedSubLang.value = defSubLang

  window.api.onDownloadProgress(({ url, progress }) => {
    const item = activeDownloads.value.find(d => d.url === url)
    if (item) {
      item.progress = progress
    }
  })
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- URL Input Section -->
    <Card class="border-none shadow-xl bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle class="text-xl flex items-center gap-2">
          <Youtube class="text-red-500 h-6 w-6" />
          {{ $t('downloader.paste_link') }}
        </CardTitle>
        <CardDescription>{{ $t('downloader.supported_sites') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="relative group">
          <Input 
            v-model="url" 
            placeholder="https://www.youtube.com/watch?v=..." 
            class="h-14 pl-12 text-lg rounded-xl transition-all border-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20"
            @keyup.enter="fetchMetadata" 
          />
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Button 
            @click="fetchMetadata" 
            :disabled="loadingMetadata || !url"
            class="absolute right-2 top-2 h-10 px-6 rounded-lg"
          >
            <Loader2 v-if="loadingMetadata" class="mr-2 h-4 w-4 animate-spin" />
            <span v-else>{{ $t('downloader.fetch_details') }}</span>
          </Button>
        </div>
        <p v-if="error" class="text-destructive text-sm mt-3 flex items-center gap-2 animate-in slide-in-from-top-1">
          <AlertCircle class="h-4 w-4" />
          {{ error }}
        </p>
      </CardContent>
    </Card>

    <!-- Preview & Configuration Section -->
    <div v-if="metadata" class="animate-in zoom-in-95 duration-300">
      <Card class="overflow-hidden border-2 border-primary/10 shadow-2xl">
        <div class="md:flex">
          <div class="md:w-1/3 relative group">
            <img :src="metadata.thumbnail" class="w-full h-full object-cover aspect-video md:aspect-auto" v-if="metadata.thumbnail" />
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div class="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                {{ metadata.duration_string }}
              </div>
            </div>
          </div>
          <div class="md:w-2/3 p-6 flex flex-col justify-between space-y-6">
            <div class="space-y-2">
              <h3 class="text-2xl font-bold leading-tight">{{ metadata.title }}</h3>
              <p class="text-muted-foreground font-medium">{{ metadata.uploader }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl border border-border/50">
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Settings2 class="h-3.5 w-3.5" /> {{ $t('downloader.quality') }}
                </div>
                <Select v-model="selectedFormat">
                  <SelectTrigger class="bg-background border-none shadow-sm">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best">{{ $t('downloader.highest_available') }}</SelectItem>
                    <SelectItem value="bestvideo+bestaudio">{{ $t('downloader.remux') }}</SelectItem>
                    <SelectItem value="mp4">{{ $t('downloader.mp4_format') }}</SelectItem>
                    <SelectItem value="bestaudio">{{ $t('downloader.audio_only') }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Languages class="h-3.5 w-3.5" /> {{ $t('downloader.subtitles') }}
                  </div>
                  <Switch v-model:checked="enableSubtitles" />
                </div>
                <Select v-model="selectedSubLang" :disabled="!enableSubtitles">
                  <SelectTrigger class="bg-background border-none shadow-sm disabled:opacity-40">
                    <SelectValue :placeholder="$t('downloader.language')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{{ $t('downloader.lang_en') }}</SelectItem>
                    <SelectItem value="de">{{ $t('downloader.lang_de') }}</SelectItem>
                    <SelectItem value="fr">{{ $t('downloader.lang_fr') }}</SelectItem>
                    <SelectItem value="es">{{ $t('downloader.lang_es') }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button @click="startDownload" size="lg" class="w-full h-14 text-lg font-bold shadow-lg hover:shadow-primary/20 transition-all">
              <Download class="mr-2 h-5 w-5" />
              {{ $t('downloader.start_download') }}
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Download Queue Section -->
    <div v-if="activeDownloads.length > 0" class="space-y-4 pt-4">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-lg font-bold tracking-tight">{{ $t('downloader.recent_activity') }}</h3>
        <span class="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {{ activeDownloads.length }} {{ $t('downloader.session', activeDownloads.length) }}
        </span>
      </div>
      
      <div class="grid gap-3">
        <Card v-for="download in activeDownloads" :key="download.url" class="overflow-hidden hover:border-primary/20 transition-colors border-transparent shadow-md">
          <CardContent class="p-3">
            <div class="flex items-center gap-4">
              <div class="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img :src="download.thumbnail" class="w-full h-full object-cover" v-if="download.thumbnail" />
                <div v-if="download.status === 'downloading'" class="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 class="h-5 w-5 text-white animate-spin" />
                </div>
              </div>
              
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="flex justify-between items-center mb-1">
                  <div class="min-w-0 pr-4">
                    <p class="text-sm font-semibold truncate text-card-foreground">{{ download.title }}</p>
                    <p class="text-[10px] text-muted-foreground font-medium">{{ formatDate(download.timestamp) }}</p>
                  </div>
                  <div class="flex-shrink-0 flex items-center gap-2">
                    <Button 
                      v-if="download.status === 'completed'" 
                      variant="outline" 
                      size="sm" 
                      class="h-7 px-2 text-[10px] font-bold uppercase gap-1"
                      @click="openFile(download.filePath)"
                    >
                      <PlayCircle class="h-3 w-3" /> {{ $t('downloader.open_video') }}
                    </Button>
                    <div v-if="download.status === 'completed'" class="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center uppercase">
                      <CheckCircle2 class="h-3 w-3 mr-1" /> {{ $t('downloader.success') }}
                    </div>
                    <div v-else-if="download.status === 'error'" class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center uppercase">
                      <AlertCircle class="h-3 w-3 mr-1" /> {{ $t('downloader.failed') }}
                    </div>
                    <div v-else class="text-[10px] font-bold tabular-nums text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                      {{ Math.round(download.progress) }}%
                    </div>
                  </div>
                </div>
                
                <div class="relative">
                  <Progress 
                    :model-value="download.progress" 
                    class="h-2 rounded-full bg-muted shadow-inner" 
                    :class="{ 'bg-green-500/20': download.status === 'completed', 'bg-red-500/20': download.status === 'error' }" 
                  />
                  <div 
                    v-if="download.status === 'downloading'"
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                  ></div>
                </div>
                
                <p v-if="download.error" class="text-[10px] text-destructive mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle class="h-2.5 w-2.5" /> {{ download.error }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Library Section -->
    <div v-if="localVideos.length > 0" class="space-y-4 pt-4 pb-8">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-lg font-bold tracking-tight">{{ $t('downloader.library') }}</h3>
        <span class="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {{ localVideos.length }} {{ $t('downloader.file', localVideos.length) }}
        </span>
      </div>
      
      <div class="grid gap-3">
        <Card v-for="video in localVideos" :key="video.path" class="overflow-hidden hover:border-primary/20 transition-colors border-transparent shadow-sm bg-muted/20">
          <CardContent class="p-4">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-4 min-w-0">
                <div class="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <PlayCircle class="h-6 w-6" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold truncate text-foreground">{{ video.name }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <p class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{{ formatFileSize(video.size) }}</p>
                    <span class="text-muted-foreground/30 text-[10px]">•</span>
                    <p class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{{ formatDate(video.mtime) }}</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                class="shrink-0 h-9 px-4 rounded-full font-bold text-xs gap-2 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                @click="openFile(video.path)"
              >
                {{ $t('downloader.view_video') }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite linear;
}
</style>
