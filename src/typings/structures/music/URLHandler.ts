/* eslint-disable @typescript-eslint/naming-convention */
export enum URLHandlerError {
    success,
    unknown,
    invalidURL,
    alreadyExists,
}

export enum URLType {
    invalid,
    single,
    playlist,
}

export interface YoutubeBasicInfo {
    url: string;
    title: string;
    uploader: string | null;
    uploaderURL: string | null;
    thumbnailURL: string | null;
    duration: number;
}

export interface YoutubeFormat {
    asr: number;
    filesize: number;
    format_id: string;
    format_note: string;
    fps: number;
    height: number;
    quality: number;
    tbr: number;
    vbr?: number;
    url: string;
    manifest_url: string;
    width: number;
    ext: string;
    vcodec: string;
    acodec: string;
    abr: number;
    downloader_options: unknown;
    container: string;
    format: string;
    protocol: string;
    http_headers: unknown;
}

export interface YouTubeThumbnail {
    url: string;
    height: number;
    width: number;
    id: string;
    resolution: string;
}

export interface YouTubeVideo {
    id: string;
    title: string;
    formats: YoutubeFormat[];
    thumbnails: YouTubeThumbnail[];
    thumbnail: string;
    description: string;
    channel_id: string;
    channel_url: string;
    duration: number | null;
    view_count: number;
    average_rating: number;
    age_limit: number;
    webpage_url: string;
    categories: string[];
    tags: string[];
    playable_in_embed: boolean;
    live_status: string | null;
    release_timestamp: null;
    _format_sort_fields: string[];
    subtitles: Record<string, { ext: string; url: string; name: string }>;
    comment_count: number;
    chapters: string | null;
    heatmap: string | null;
    channel: string;
    channel_follower_count: number;
    channel_is_verified: boolean;
    uploader: string;
    uploader_id: string;
    uploader_url: string;
    upload_date: string;
    availability: string;
    original_url: string;
    webpage_url_basename: string;
    webpage_url_domain: string;
    extractor: string;
    extractor_key: string;
    playlist: string | null;
    playlist_index: number | null;
    display_id: string | null;
    fulltitle: string;
    duration_string: string | null;
    is_live: boolean;
    was_live: boolean;
    epoch: number;
    format: string;
    format_id: string;
    ext: string;
    protocol: string;
    language: string | null;
    format_note: string;
    filesize_approx: number;
    tbr: number;
    width: number;
    height: number;
    resolution: string;
    fps: number;
    dynamic_range: string;
    vcodec: string;
    vbr: number;
    stretched_ratio: number | null;
    aspect_ratio: number | null;
    acodec: string;
    abr: number;
    asr: number;
    audio_channels: 2;
    _type: "video";
}

export interface YouTubePlaylistEntry {
    _type: "url";
    ie_key: string;
    id: string;
    url: string;
    title: string;
    description: string | null;
    duration: number | null;
    channel_id: string | null;
    channel: string | null;
    channel_url: string | null;
    uploader: string | null;
    uploader_id: string | null;
    uploader_url: string | null;
    thumbnails: YouTubeThumbnail[];
    timestamp: string | null;
    release_timestamp: string | null;
    availability: string | null;
    view_count: number | null;
    live_status: string | null;
    channel_is_verified: string | null;
    __x_forwarded_for_ip: string | null;
}

export interface YouTubePlaylist {
    id: string;
    title: string;
    availability: string;
    channel_follower_count: number | null;
    description: string | null;
    tag: string[];
    thumbnails: YouTubeThumbnail[];
    modified_date: string;
    view_count: number;
    playlist_count: number;
    channel: string;
    channel_id: string;
    uploader_id: string;
    uploader: string;
    channel_url: string;
    uploader_url: string;
    _type: "playlist";
    entries: YouTubePlaylistEntry[];
    extractor_key: string;
    extractor: string;
    webpage_url: string;
    original_url: string;
    webpage_url_basename: string;
    webpage_url_domain: string;
    epoch: number;
}

export type ParseResult =
    | {
          type: URLType.invalid;
          data: null;
      }
    | {
          type: URLType.playlist;
          data: YoutubeBasicInfo[];
      }
    | {
          type: URLType.single;
          data: YoutubeBasicInfo;
      };
