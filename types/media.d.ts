declare module 'ffmpeg-static' {
    const path: string;
    export default path;
}

declare module 'ffprobe-static' {
    const content: {
        path: string;
    };
    export default content;
}
