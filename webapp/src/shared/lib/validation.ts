// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MAX_FILE_COUNT, MAX_MESSAGE_BYTES} from '@/shared/constants/validation';
import type {FileInfo} from '@/entities/mattermost/model/types';

/**
 * 예약 메시지 검증 결과
 */
export interface ValidationResult {
    isValid: boolean;
    errorMessage: string | null;
}

/**
 * 예약 메시지 검증
 * @param message - 메시지 내용
 * @param fileInfos - 첨부 파일 정보
 * @returns 검증 결과
 */
export function validateScheduleMessage(message: string, fileInfos: FileInfo[]): ValidationResult {
    // 1. 메시지와 파일이 둘 다 비어있는지 확인
    const trimmedMessage = message.trim();
    if (!trimmedMessage && fileInfos.length === 0) {
        return {
            isValid: false,
            errorMessage: 'Please enter a message or attach a file.',
        };
    }

    // 2. 파일 개수 확인
    if (fileInfos.length > MAX_FILE_COUNT) {
        return {
            isValid: false,
            errorMessage: `Uploads limited to ${MAX_FILE_COUNT} files maximum. Please use additional posts for more files.(Current count: ${fileInfos.length})`,
        };
    }

    // 3. 메시지 크기 확인
    const messageBytes = new TextEncoder().encode(trimmedMessage).length;
    if (messageBytes > MAX_MESSAGE_BYTES) {
        const messageSizeKB = (messageBytes / 1024).toFixed(2);
        const maxSizeKB = (MAX_MESSAGE_BYTES / 1024).toFixed(0);
        return {
            isValid: false,
            errorMessage: `Message size is too large. (${messageSizeKB}KB / max ${maxSizeKB}KB)`,
        };
    }

    return {
        isValid: true,
        errorMessage: null,
    };
}
