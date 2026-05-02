<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import DownloaderTab from '@/components/DownloaderTab.vue'
import SettingsTab from '@/components/SettingsTab.vue'
import { AlertCircle, Download, X } from 'lucide-vue-next'
import { version } from '../package.json'
import { TooltipProvider } from '@/components/ui/tooltip'

const binariesReady = ref(false)
const checkingBinaries = ref(true)
const binaryStatus = ref({ ytDlp: false, ffmpeg: false, ffprobe: false })
const downloadingBinary = ref<string | null>(null)
const downloadProgress = ref(0)

const activeTab = ref('downloader')

const { locale } = useI18n()

const applyTheme = (tTheme: string) => {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (tTheme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
  } else {
    root.classList.add(tTheme)
  }
}

const checkBinaries = async () => {
  checkingBinaries.value = true
  binaryStatus.value = await window.api.checkBinaries()
  binariesReady.value = binaryStatus.value.ytDlp && binaryStatus.value.ffmpeg && binaryStatus.value.ffprobe
  checkingBinaries.value = false
}

const installBinaries = async () => {
  if (!binaryStatus.value.ytDlp) {
    downloadingBinary.value = 'yt-dlp'
    await window.api.downloadYTIDlp()
  }
  if (!binaryStatus.value.ffmpeg || !binaryStatus.value.ffprobe) {
    downloadingBinary.value = 'ffmpeg & ffprobe'
    await window.api.downloadFFmpeg()
  }
  downloadingBinary.value = null
  await checkBinaries()
}

onMounted(async () => {
  const lang = await window.api.getStoreValue('language') || 'en'
  locale.value = lang

  const theme = await window.api.getStoreValue('theme') || 'system'
  applyTheme(theme)

  checkBinaries()
  window.api.onBinaryProgress(({ progress }) => {
    downloadProgress.value = progress
  })
})
</script>

<template>
  <TooltipProvider>
    <div class="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <div v-if="checkingBinaries" class="flex items-center justify-center flex-1">
        <p>{{ $t('app.checking_deps') }}</p>
      </div>

      <div v-else-if="!binariesReady" class="flex items-center justify-center flex-1">
        <Card class="w-[450px]">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <AlertCircle class="text-destructive" />
              {{ $t('app.missing_deps') }}
            </CardTitle>
            <CardDescription>
              {{ $t('app.deps_required') }}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="downloadingBinary" class="space-y-2">
              <p class="text-sm">{{ $t('app.downloading', { binary: downloadingBinary }) }}</p>
              <Progress :model-value="downloadProgress" />
            </div>
            <Button v-else @click="installBinaries" class="w-full">
              <Download class="mr-2 h-4 w-4" />
              {{ $t('app.download_install') }}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div v-else class="max-w-5xl w-full mx-auto px-6 py-4 flex flex-col flex-1 overflow-hidden">
        <Tabs v-model="activeTab" class="flex flex-col flex-1 overflow-hidden">
          <header class="flex items-center justify-between mb-6 flex-shrink-0">
            <div class="flex items-center gap-4">
              <div class="bg-primary/15 p-2.5 rounded-2xl shadow-sm border border-primary/10">
                <Download class="h-6 w-6 text-primary" />
              </div>
              <div>
                <div class="flex items-center gap-2.5 leading-none">
                  <h1 class="text-2xl font-black tracking-tighter">ClipVault</h1>
                  <span class="text-[10px] text-muted-foreground/50 font-bold bg-muted px-1.5 py-0.5 rounded uppercase tracking-widest">v{{ version }}</span>
                </div>
                <p class="text-[11px] text-muted-foreground/80 mt-1 font-medium">{{ $t('app.subtitle') }}</p>
              </div>
            </div>
            
            <TabsList class="h-10 p-1 bg-muted/30 border-none shadow-inner rounded-xl">
              <TabsTrigger value="downloader" class="h-8 px-5 text-xs font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg">{{ $t('app.tab_downloader') }}</TabsTrigger>
              <TabsTrigger 
                value="settings" 
                class="h-8 px-5 text-xs font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg"
                @pointerdown="activeTab === 'settings' ? (activeTab = 'downloader', $event.preventDefault()) : null"
              >
                {{ $t('app.tab_settings') }}
              </TabsTrigger>
            </TabsList>
          </header>
          
          <div class="flex-1 flex flex-col overflow-hidden px-1 pt-1">
            <TabsContent value="downloader" class="flex-1 outline-none m-0 overflow-hidden h-full">
              <DownloaderTab />
            </TabsContent>
            
            <TabsContent value="settings" class="flex-1 overflow-y-auto outline-none animate-in fade-in slide-in-from-right-4 duration-300 m-0 pb-4 h-full">
              <div class="relative bg-card rounded-2xl border shadow-xl overflow-hidden flex flex-col">
                <div class="flex items-center justify-between p-4 border-b bg-muted/30 flex-shrink-0">
                  <div>
                    <h2 class="text-lg font-bold tracking-tight">{{ $t('app.settings_title') }}</h2>
                    <p class="text-xs text-muted-foreground">{{ $t('app.settings_desc') }}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    class="hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors h-8 w-8"
                    @click="activeTab = 'downloader'"
                  >
                    <X class="h-5 w-5" />
                  </Button>
                </div>
                <div class="p-6">
                  <SettingsTab />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  </TooltipProvider>
</template>

<style>
/* Base shadcn variables are already in style.css */
</style>
