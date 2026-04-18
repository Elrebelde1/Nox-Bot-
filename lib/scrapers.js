import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';
import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export async function downloadMedia(query, isAudio = true) {
    try {
        const search = await yts(query);
        const video = search.videos[0];
        if (!video) return null;

        const ext = isAudio ? '.mp3' : '.mp4';
        const outputPath = join(tmpdir(), `${video.videoId}_${Date.now()}${ext}`);
        
        // Configuramos la descarga: Audio o Video
        const options = isAudio 
            ? { quality: 'highestaudio', filter: 'audioonly' } 
            : { quality: 'highest', format: 'mp4' };

        const stream = ytdl(video.url, options);
        
        await new Promise((resolve, reject) => {
            const writer = createWriteStream(outputPath);
            stream.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        return { 
            title: video.title, 
            path: outputPath, 
            thumbnail: video.thumbnail,
            timestamp: video.timestamp 
        };
    } catch (e) {
        console.error("Error en scraper:", e);
        return null;
    }
}