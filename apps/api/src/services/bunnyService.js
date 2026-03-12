import axios from 'axios';
import crypto from 'crypto';
import querystring from 'querystring';
import env from '../config/env.js';

const BASE = `https://video.bunnycdn.com/library/${env.bunny.libraryId}`;
const KEY = env.bunny.apiKey;
const CDN = env.bunny.cdnHostname;
const TOKEN_AUTH_KEY = env.bunny.tokenAuthKey;

function toBase64Url(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function normalizePath(path) {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

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
  getPlaybackUrl(videoId, { signed = false, expiresInSec = env.bunny.playbackTokenTtl } = {}) {
    const filePath = `/${videoId}/playlist.m3u8`;
    if (!signed || !TOKEN_AUTH_KEY) {
      return `https://${CDN}${filePath}`;
    }
    return this.generateSignedPathUrl(filePath, {
      expiresInSec,
      tokenPath: `/${videoId}/`,
    });
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
    const secret = env.bunny.webhookSecret || KEY;
    const hash = crypto
      .createHash('sha256')
      .update(rawBody + secret)
      .digest('hex');
    return hash === receivedHash;
  },

  // Generate signed URL for secure playback
  generateSignedPathUrl(filePath, {
    expiresInSec = env.bunny.playbackTokenTtl,
    tokenPath,
    tokenIp,
    tokenCountries,
    tokenBlockedCountries,
  } = {}) {
    const normalizedFilePath = normalizePath(filePath);
    if (!TOKEN_AUTH_KEY) {
      return `https://${CDN}${normalizedFilePath}`;
    }

    const expires = Math.floor(Date.now() / 1000) + Number(expiresInSec || 0);
    const signaturePath = tokenPath
      ? `${normalizePath(tokenPath).replace(/\/+$/, '')}/`
      : normalizedFilePath;

    const params = new URLSearchParams();
    if (tokenPath) params.set('token_path', signaturePath);
    if (tokenIp) params.set('token_ip', tokenIp);
    if (tokenCountries) params.set('token_countries', tokenCountries);
    if (tokenBlockedCountries) params.set('token_countries_blocked', tokenBlockedCountries);
    params.sort();

    let parameterData = '';
    let parameterDataUrl = '';
    for (const [key, value] of params.entries()) {
      parameterData += `${key}=${value}`;
      parameterDataUrl += `&${key}=${querystring.escape(value)}`;
    }

    const hashable = `${TOKEN_AUTH_KEY}${signaturePath}${expires}${tokenIp || ''}${parameterData}`;
    const token = toBase64Url(crypto.createHash('sha256').update(hashable).digest());

    return `https://${CDN}/bcdn_token=${token}${parameterDataUrl}&expires=${expires}${normalizedFilePath}`;
  },

  // Get TUS upload URL for direct browser upload
  getUploadUrl(videoId) {
    return `https://video.bunnycdn.com/tusupload`;
  },

  // Generate Bunny TUS auth headers for browser direct upload
  getTusAuth(videoId, expiresInSec = 3600) {
    const expires = Math.floor(Date.now() / 1000) + expiresInSec;
    const signature = crypto
      .createHash('sha256')
      .update(`${env.bunny.libraryId}${KEY}${expires}${videoId}`)
      .digest('hex');

    return {
      AuthorizationSignature: signature,
      AuthorizationExpire: String(expires),
      VideoId: videoId,
      LibraryId: String(env.bunny.libraryId),
    };
  },
};
