// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FILE_ICON_MAP, DEFAULT_FILE_ICON, FILE_SIZE_UNITS, FILE_SIZE_MULTIPLIER} from '../constants/fileIcons';

/**
 * 파일명에서 확장자 추출
 * @param fileName 파일명
 * @returns 확장자 (소문자)
 */
export function getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param bytes 바이트 크기
 * @returns 포맷된 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) {
        return '0 B';
    }

    const i = Math.floor(Math.log(bytes) / Math.log(FILE_SIZE_MULTIPLIER));
    const size = bytes / Math.pow(FILE_SIZE_MULTIPLIER, i);

    return `${size.toFixed(i === 0 ? 0 : 1)} ${FILE_SIZE_UNITS[i]}`;
}

/**
 * 파일 크기 문자열을 바이트로 변환
 * @param sizeStr 크기 문자열 (예: "1.5 MB")
 * @returns 바이트 크기
 */
export function parseSizeString(sizeStr: string): number {
    const match = sizeStr.match(/(\d+\.?\d*)\s*(B|KB|MB|GB)?/i);
    if (!match) {
        return 0;
    }

    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();

    const multipliers: Record<string, number> = {
        B: 1,
        KB: FILE_SIZE_MULTIPLIER,
        MB: FILE_SIZE_MULTIPLIER * FILE_SIZE_MULTIPLIER,
        GB: FILE_SIZE_MULTIPLIER * FILE_SIZE_MULTIPLIER * FILE_SIZE_MULTIPLIER,
    };

    return Math.round(value * (multipliers[unit] || 1));
}

/**
 * 확장자에 따른 파일 아이콘 클래스 반환
 * @param extension 파일 확장자
 * @returns Mattermost 아이콘 클래스명
 */
export function getFileIconClass(extension: string): string {
    return FILE_ICON_MAP[extension.toLowerCase()] || DEFAULT_FILE_ICON;
}
