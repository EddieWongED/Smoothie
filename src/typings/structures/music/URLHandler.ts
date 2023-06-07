/* eslint-disable @typescript-eslint/naming-convention */
export enum URLType {
    invalid,
    single,
    playlist,
}

export interface YouTubeThumbnail {
    url: string;
    height: number;
    width: number;
    id: string;
    resolution: string;
}

export interface YouTubeVideo {
    _type: string;
    ie_key: string;
    id: string;
    url: string;
    title: string;
    description: string | null;
    duration: number | null;
    channel_id: string | null;
    channel: string | null;
    channel_url: string | null;
    thumbnails: YouTubeThumbnail[];
    timestamp: number | null;
    release_timestamp: number | null;
    availability: string | null;
    view_count: number | null;
    live_status: string | null;
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
    uploader: string;
    uploader_id: string;
    uploader_url: string;
    channel: string;
    channel_id: string;
    channel_url: string;
    _type: string;
    entries: YouTubeVideo[];
    extractor_key: string;
    extractor: string;
    webpage_url: string;
    original_url: string;
    webpage_url_basename: string;
    webpage_url_domain: string;
    epoch: number;
}
