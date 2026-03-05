import axios from 'axios';
import crypto from 'crypto';
import env from '../config/env.js';

const BASE = `https://video.bunnycdn.com/library/${env.bunny.libraryId}`;
const KEY = env.bunny.apiKey;
const CDN = env.bunny.cdnHostname;

export const bunnyService = {
  // Create a new video on Bunny
  async createVideo(title) {
    try {
      const { data } = await axios.post(
        `${BASE}/videos`,
        { title },
        { headers: { AccessKey: KEY } }
      );
      return { videoId: data.guid };
    } catch (error) {
      console.error('Bunny create video error:', error.response?.data || error.message);
      throw new Error('فشل إنشاء الفيديو على Bunny Stream');
    }
  },

  // Get playback URL (HLS)
  getPlaybackUrl(videoId) {
    return `https://${CDN}/${videoId}/playlist.m3u8`;
  },

  // Get thumbnail URL
  getThumbnailUrl(videoId) {
    return `https://${CDN}/${videoId}/thumbnail.jpg`;
  },

  // Get video status
  async getVideoStatus(videoId) {
    try {
      const { data } = await axios.get(
        `${BASE}/videos/${videoId}`,
        { headers: { AccessKey: KEY } }
      );
      // status: 0=Created 1=Uploaded 2=Processing 3=Transcoding 4=Finished 5=Error
      return data.status;
    } catch (error) {
      console.error('Bunny get status error:', error.response?.data || error.message);
      return null;
    }
  },

  // Delete video
  async deleteVideo(videoId) {
    try {
      await axios.delete(
        `${BASE}/videos/${videoId}`,
        { headers: { AccessKey: KEY } }
      );
    } catch (error) {
      console.error('Bunny delete video error:', error.response?.data || error.message);
      throw new Error('فشل حذف الفيديو من Bunny Stream');
    }
  },

  // Verify webhook signature
  verifyWebhook(rawBody, receivedHash) {
    const hash = crypto
      .createHash('sha256')
      .update(rawBody + KEY)
      .digest('hex');
    return hash === receivedHash;
  },

  // Generate signed URL for secure playback
  generateSignedUrl(videoId, expiresInSec = 3600) {
    const exp = Math.floor(Date.now() / 1000) + expiresInSec;
    const token = crypto
      .createHash('sha256')
      .update(KEY + videoId + exp)
      .digest('hex');
    return `https://${CDN}/${videoId}/playlist.m3u8?token=${token}&expires=${exp}`;
  },
};
