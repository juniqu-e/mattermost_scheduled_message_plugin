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
 */
export const REDUX_ACTIONS = {
    UPDATE_DRAFT: 'UPDATE_DRAFT',
} as const;

/**
 * Draft Key Format
 */
export const DRAFT_KEY_PREFIX = 'draft_';

/**
 * Draft key 생성
 */
export function getDraftKey(channelId: string): string {
    return `${DRAFT_KEY_PREFIX}${channelId}`;
}
