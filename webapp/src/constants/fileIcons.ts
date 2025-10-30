// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * 파일 확장자별 아이콘 매핑
 */
export const FILE_ICON_MAP: Record<string, string> = {
    // 이미지
    jpg: 'icon-file-image-outline',
    jpeg: 'icon-file-image-outline',
    png: 'icon-file-image-outline',
    gif: 'icon-file-image-outline',
    svg: 'icon-file-image-outline',
    webp: 'icon-file-image-outline',

    // 문서
    pdf: 'icon-file-pdf-outline',
    doc: 'icon-file-document-outline',
    docx: 'icon-file-document-outline',
    txt: 'icon-file-document-outline',
    md: 'icon-file-document-outline',

    // 스프레드시트
    xls: 'icon-file-excel-outline',
    xlsx: 'icon-file-excel-outline',
    csv: 'icon-file-excel-outline',

    // 프레젠테이션
    ppt: 'icon-file-powerpoint-outline',
    pptx: 'icon-file-powerpoint-outline',

    // 비디오
    mp4: 'icon-file-video-outline',
    avi: 'icon-file-video-outline',
    mov: 'icon-file-video-outline',
    mkv: 'icon-file-video-outline',

    // 오디오
    mp3: 'icon-file-music-outline',
    wav: 'icon-file-music-outline',
    flac: 'icon-file-music-outline',

    // 압축
    zip: 'icon-folder-zip-outline',
    rar: 'icon-folder-zip-outline',
    '7z': 'icon-folder-zip-outline',
    tar: 'icon-folder-zip-outline',
    gz: 'icon-folder-zip-outline',

    // 코드
    js: 'icon-code-braces',
    ts: 'icon-code-braces',
    jsx: 'icon-code-braces',
    tsx: 'icon-code-braces',
    py: 'icon-code-braces',
    java: 'icon-code-braces',
    go: 'icon-code-braces',
    cpp: 'icon-code-braces',
    c: 'icon-code-braces',
    html: 'icon-code-tags',
    css: 'icon-code-tags',
    json: 'icon-code-braces',
    xml: 'icon-code-tags',
};

// 기본 아이콘
export const DEFAULT_FILE_ICON = 'icon-file-outline';

// 파일 크기 단위
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;
export const FILE_SIZE_MULTIPLIER = 1024;
