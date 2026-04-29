<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import DownloaderTab from '@/components/DownloaderTab.vue'
import SettingsTab from '@/components/SettingsTab.vue'
import { AlertCircle, Download, X } from 'lucide-vue-next'
import { version } from '../package.json'

const binariesReady = ref(false)
const checkingBinaries = ref(true)
const binaryStatus = ref({ ytDlp: false, ffmpeg: false })
const downloadingBinary = ref<string | null>(null)
const downloadProgress = ref(0)

const activeTab = ref('downloader')

const checkBinaries = async () => {
  checkingBinaries.value = true
  binaryStatus.value = await window.api.checkBinaries()
  binariesReady.value = binaryStatus.value.ytDlp && binaryStatus.value.ffmpeg
  checkingBinaries.value = false
}

const installBinaries = async () => {
  if (!binaryStatus.value.ytDlp) {
    downloadingBinary.value = 'yt-dlp'
    await window.api.downloadYTIDlp()
  }
  if (!binaryStatus.value.ffmpeg) {
    downloadingBinary.value = 'ffmpeg'
    await window.api.downloadFFmpeg()
  }
  downloadingBinary.value = null
  await checkBinaries()
}

onMounted(() => {
  checkBinaries()
  window.api.onBinaryProgress(({ progress }) => {
    downloadProgress.value = progress
  })
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-4">
    <div v-if="checkingBinaries" class="flex items-center justify-center h-[80vh]">
      <p>Checking dependencies...</p>
    </div>

    <div v-else-if="!binariesReady" class="flex items-center justify-center h-[80vh]">
      <Card class="w-[450px]">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <AlertCircle class="text-destructive" />
            Missing Dependencies
          </CardTitle>
          <CardDescription>
            yt-dlp and FFmpeg are required to download and process videos.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="downloadingBinary" class="space-y-2">
            <p class="text-sm">Downloading {{ downloadingBinary }}...</p>
            <Progress :model-value="downloadProgress" />
          </div>
          <Button v-else @click="installBinaries" class="w-full">
            <Download class="mr-2 h-4 w-4" />
            Download and Install
          </Button>
        </CardContent>
      </Card>
    </div>

    <div v-else class="max-w-3xl mx-auto py-10 px-4">
      <div class="flex flex-col items-center mb-10">
        <div class="bg-primary/10 p-4 rounded-2xl mb-4">
          <Download class="h-10 w-10 text-primary" />
        </div>
        <h1 class="text-4xl font-extrabold tracking-tight">yt-dlp Downloader</h1>
        <p class="text-muted-foreground mt-2">Fast, modern, and cross-platform video downloader.</p>
        <p class="text-xs text-muted-foreground/60 mt-1 font-medium">v{{ version }}</p>
      </div>
      
      <Tabs v-model="activeTab" class="w-full flex flex-col items-center">
        <TabsList class="mb-8">
          <TabsTrigger value="downloader" class="px-10 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">Downloader</TabsTrigger>
          <TabsTrigger 
            value="settings" 
            class="px-10 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
            @pointerdown="activeTab === 'settings' ? (activeTab = 'downloader', $event.preventDefault()) : null"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="downloader" class="w-full outline-none">
          <DownloaderTab />
        </TabsContent>
        
        <TabsContent value="settings" class="w-full outline-none animate-in fade-in slide-in-from-right-4 duration-300">
          <div class="relative bg-card rounded-3xl border shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b bg-muted/30">
              <div>
                <h2 class="text-2xl font-bold tracking-tight">Application Settings</h2>
                <p class="text-sm text-muted-foreground">Manage your preferences and app configuration.</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                class="hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors h-10 w-10"
                @click="activeTab = 'downloader'"
              >
                <X class="h-6 w-6" />
              </Button>
            </div>
            <div class="p-8">
              <SettingsTab />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<style>
/* Base shadcn variables are already in style.css */
</style>
