// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * DOM 셀렉터 상수
 */

// 파일 프리뷰 컨테이너 셀렉터
export const FILE_CONTAINER_SELECTORS = [
    '.post-create__container .file-preview',
    '.AdvancedTextEditor__filePreview',
    '.file-preview',
    '[data-testid="file-preview"]',
    '.post-create .file-preview',
    '#advancedTextEditorCell .file-preview',
] as const;

// 파일 아이템 셀렉터
export const FILE_ITEM_SELECTORS = [
    '.file-preview__container',
    '.FilePreview',
    '.file-preview-item',
    '[data-testid="file-preview-item"]',
    '.post-image__thumbnail',
] as const;

// 파일명 셀렉터
export const FILE_NAME_SELECTORS = [
    '.post-image__name',
    '.file-preview__name',
    '.FilePreview__filename',
    '[data-testid="file-name"]',
    '.file-name',
    'span[title]',
] as const;

// 파일 크기 셀렉터
export const FILE_SIZE_SELECTORS = [
    '.post-image__size',
    '.file-preview__size',
    '.FilePreview__size',
    '[data-testid="file-size"]',
    '.file-size',
] as const;

// 메시지 입력창 ID
export const MESSAGE_INPUT_ID = 'post_textbox';
