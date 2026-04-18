import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';
import { createWriteStream, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export async function downloadAudio(query) {
    try {
        const search = await yts(query);
        const video = search.videos[0];
        if (!video) return null;

        const outputPath = join(tmpdir(), `${video.videoId}.mp3`);
        
        // Descargar el audio
        const stream = ytdl(video.url, { quality: 'highestaudio', filter: 'audioonly' });
        const file = createWriteStream(outputPath);
        
        await new Promise((resolve, reject) => {
            stream.pipe(file);
            file.on('finish', resolve);
            file.on('error', reject);
        });

        return { title: video.title, path: outputPath, thumb: video.thumbnail };
    } catch (e) {
        console.error(e);
        return null;
    }
}