// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Mattermost 관련 상수
 */

/**
 * DOM Selectors
 */
export const DOM_SELECTORS = {
    POST_TEXTBOX: '#post_textbox',
    FILE_PREVIEW: '.file-preview, .post-image__column',
    FILE_NAME: '.post-image__name',
    FILE_SIZE: '.post-image__size',
    FILE_REMOVE_BUTTON: '.post-image__remove, .file-preview__remove',
} as const;

/**
 * Redux Action Types
 * Mattermost가 사용하는 실제 액션 타입
 */
export const STORAGE_TYPES = {
    SET_GLOBAL_ITEM: 'SET_GLOBAL_ITEM',
    REMOVE_GLOBAL_ITEM: 'REMOVE_GLOBAL_ITEM',
} as const;

/**
 * Draft Key Format
 * Mattermost가 사용하는 Storage Prefix
 */
export const STORAGE_PREFIXES = {
    DRAFT: 'draft_',
    COMMENT_DRAFT: 'comment_draft_',
} as const;

/**
 * Draft key 생성
 */
export function getDraftKey(channelId: string, rootId = ''): string {
    if (rootId) {
        return `${STORAGE_PREFIXES.COMMENT_DRAFT}${rootId}`;
    }
    return `${STORAGE_PREFIXES.DRAFT}${channelId}`;
}
