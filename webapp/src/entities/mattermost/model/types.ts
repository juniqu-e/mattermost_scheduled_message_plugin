// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Mattermost Redux State 타입 정의
 */

/**
 * File Info
 */
export interface FileInfo {
    id: string;
    name: string;
    size: number;
    extension: string;
}

/**
 * Post Draft
 */
export interface PostDraft {
    message: string;
    fileInfos: FileInfo[];
    uploadsInProgress: string[];
}

/**
 * Storage Entry
 */
export interface StorageEntry<T = any> {
    value: T;
    timestamp?: number;
}

/**
 * Mattermost Global State (부분적으로 정의)
 */
export interface MattermostState {
    entities?: {
        channels?: {
            currentChannelId?: string;
        };
    };
    storage?: {
        storage?: Record<string, StorageEntry>;
    };
}
