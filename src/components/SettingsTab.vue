<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FolderOpen, Moon, Sun, Monitor, HardDrive, Palette, Info, ExternalLink, User, Settings2 } from 'lucide-vue-next'
import { version } from '../../package.json'

const downloadDir = ref('')
const theme = ref('system')
const defaultQuality = ref('best')
const defaultSubtitles = ref(false)
const defaultSubLang = ref('en')

const loadSettings = async () => {
  downloadDir.value = await window.api.getStoreValue('downloadDir') || ''
  theme.value = await window.api.getStoreValue('theme') || 'system'
  defaultQuality.value = await window.api.getStoreValue('defaultQuality') || 'best'
  defaultSubtitles.value = await window.api.getStoreValue('defaultSubtitles') || false
  defaultSubLang.value = await window.api.getStoreValue('defaultSubLang') || 'en'
  applyTheme(theme.value)
}

const selectDirectory = async () => {
  const path = await window.api.selectDirectory()
  if (path) {
    downloadDir.value = path
    await window.api.setStoreValue('downloadDir', path)
  }
}

const applyTheme = (t: string) => {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (t === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
  } else {
    root.classList.add(t)
  }
}

watch(theme, async (newTheme) => {
  await window.api.setStoreValue('theme', newTheme)
  applyTheme(newTheme)
})

watch(defaultQuality, async (val) => {
  await window.api.setStoreValue('defaultQuality', val)
})

watch(defaultSubtitles, async (val) => {
  await window.api.setStoreValue('defaultSubtitles', val)
})

watch(defaultSubLang, async (val) => {
  await window.api.setStoreValue('defaultSubLang', val)
})

const openExternal = (url: string) => {
  window.api.openExternal(url)
}

onMounted(loadSettings)
</script>

<template>
  <div class="space-y-12">
    <!-- Storage Section -->
    <section class="space-y-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="bg-blue-500/10 p-2 rounded-lg text-blue-500">
          <HardDrive class="h-5 w-5" />
        </div>
        <h3 class="text-lg font-bold">Storage</h3>
      </div>
      <div class="pl-11 space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Default Download Directory</label>
          <div class="flex gap-2">
            <Input v-model="downloadDir" readonly placeholder="Default System Downloads Folder" class="bg-muted/50 border-none shadow-inner h-11" />
            <Button variant="secondary" size="icon" @click="selectDirectory" class="h-11 w-11 shrink-0">
              <FolderOpen class="h-5 w-5" />
            </Button>
          </div>
          <p class="text-[11px] text-muted-foreground italic">Videos will be saved directly to this path.</p>
        </div>
      </div>
    </section>

    <!-- Appearance Section -->
    <section class="space-y-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="bg-purple-500/10 p-2 rounded-lg text-purple-500">
          <Palette class="h-5 w-5" />
        </div>
        <h3 class="text-lg font-bold">Appearance</h3>
      </div>
      <div class="pl-11 space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Theme Mode</label>
          <Select v-model="theme">
            <SelectTrigger class="bg-muted/50 border-none shadow-inner h-11">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div class="flex items-center gap-2 py-1">
                  <Sun class="h-4 w-4 text-orange-500" /> Light Mode
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div class="flex items-center gap-2 py-1">
                  <Moon class="h-4 w-4 text-indigo-400" /> Dark Mode
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div class="flex items-center gap-2 py-1">
                  <Monitor class="h-4 w-4 text-slate-400" /> System Default
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>

    <!-- Download Preferences Section -->
    <section class="space-y-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="bg-green-500/10 p-2 rounded-lg text-green-500">
          <Settings2 class="h-5 w-5" />
        </div>
        <h3 class="text-lg font-bold">Download Preferences</h3>
      </div>
      <div class="pl-11 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Default Quality</label>
            <Select v-model="defaultQuality">
              <SelectTrigger class="bg-muted/50 border-none shadow-inner h-11">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Highest Available</SelectItem>
                <SelectItem value="bestvideo+bestaudio">Remux (Best Video+Audio)</SelectItem>
                <SelectItem value="mp4">MP4 Format</SelectItem>
                <SelectItem value="bestaudio">Audio Only (MP3/M4A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Enable Subtitles</label>
              <Switch v-model:checked="defaultSubtitles" />
            </div>
            <Select v-model="defaultSubLang" :disabled="!defaultSubtitles">
              <SelectTrigger class="bg-muted/50 border-none shadow-inner h-11 disabled:opacity-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="space-y-4 pt-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="bg-orange-500/10 p-2 rounded-lg text-orange-500">
          <Info class="h-5 w-5" />
        </div>
        <h3 class="text-lg font-bold">About Application</h3>
      </div>
      <div class="pl-11 space-y-6">
        <div class="p-4 bg-muted/30 rounded-2xl border border-border/50">
          <p class="text-sm font-medium text-foreground">yt-dlp Electron Frontend</p>
          <p class="text-xs text-muted-foreground mt-1">Version {{ version }} Stable</p>
          <p class="text-xs text-muted-foreground mt-3 leading-relaxed">
            A cross-platform UI for the yt-dlp CLI. Built with Vue 3, Electron, and Tailwind CSS.
          </p>
        </div>

        <div class="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 group hover:bg-primary/10 transition-colors">
          <div class="flex items-center gap-3">
            <div class="bg-background p-2 rounded-full shadow-sm">
              <User class="h-4 w-4 text-primary" />
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-tight text-primary/70">Developer</p>
              <p class="text-sm font-bold">Nick Weschkalnies</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            class="rounded-full gap-2 text-xs h-8"
            @click="openExternal('https://www.weschkalnies.de')"
          >
            Visit Website <ExternalLink class="h-3 w-3" />
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>
