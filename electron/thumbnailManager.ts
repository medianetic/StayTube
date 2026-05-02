import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { BinaryManager } from './binaryManager'
import crypto from 'node:crypto'

export class ThumbnailManager {
  private thumbPath: string
  private binaryManager: BinaryManager

  constructor(binaryManager: BinaryManager) {
    this.binaryManager = binaryManager
    this.thumbPath = path.join(app.getPath('userData'), 'thumbnails')
    if (!fs.existsSync(this.thumbPath)) {
      fs.mkdirSync(this.thumbPath, { recursive: true })
    }
  }

  private getThumbName(videoPath: string): string {
    const hash = crypto.createHash('md5').update(videoPath).digest('hex')
    return `${hash}.jpg`
  }

  async getThumbnail(videoPath: string): Promise<string | null> {
    const thumbName = this.getThumbName(videoPath)
    const fullThumbPath = path.join(this.thumbPath, thumbName)

    if (fs.existsSync(fullThumbPath)) {
      return fullThumbPath
    }

    try {
      await this.generateThumbnail(videoPath, fullThumbPath)
      return fullThumbPath
    } catch (e) {
      console.error('Failed to generate thumbnail for:', videoPath, e)
      return null
    }
  }

  private generateThumbnail(videoPath: string, outputThumbPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpegPath = this.binaryManager.getFFmpegPath()
      
      // Extract a frame at 5 seconds, or 0 if shorter
      // -ss 00:00:05 -i input -vframes 1 -q:v 2 output
      const args = [
        '-ss', '00:00:05',
        '-i', videoPath,
        '-vframes', '1',
        '-q:v', '2',
        '-y', // Overwrite
        outputThumbPath
      ]

      const ffmpeg = spawn(ffmpegPath, args)

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          // If 5s failed, try at 0s
          const retryArgs = [
            '-i', videoPath,
            '-vframes', '1',
            '-q:v', '2',
            '-y',
            outputThumbPath
          ]
          const retryFfmpeg = spawn(ffmpegPath, retryArgs)
          retryFfmpeg.on('close', (retryCode) => {
            if (retryCode === 0) resolve()
            else reject(new Error(`ffmpeg exited with code ${retryCode}`))
          })
        }
      })

      ffmpeg.on('error', reject)
    })
  }

  async getVideoMetadata(videoPath: string): Promise<{ duration: number } | null> {
    return new Promise((resolve) => {
      const ffprobePath = this.binaryManager.getFFprobePath()
      const args = [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        videoPath
      ]

      const ffprobe = spawn(ffprobePath, args)
      let output = ''

      ffprobe.stdout.on('data', (data) => {
        output += data.toString()
      })

      ffprobe.on('close', (code) => {
        if (code === 0) {
          const duration = parseFloat(output.trim())
          resolve({ duration })
        } else {
          resolve(null)
        }
      })

      ffprobe.on('error', () => resolve(null))
    })
  }
}
