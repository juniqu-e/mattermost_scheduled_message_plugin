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
 * 예약 메시지 전체 검증
 * @param message - 메시지 내용
 * @param fileInfos - 첨부 파일 정보
 * @param timestamp - 예약 시간 (Unix timestamp, milliseconds)
 * @param hasUploadsInProgress - 업로드 중인 파일이 있는지 여부
 * @returns 검증 결과
 *
 * 검증 우선순위:
 * 1. 파일 업로드 진행 중 확인
 * 2. 메시지/파일 필수 (최소 1개 필요)
 * 3. 파일 개수 제한
 * 4. 메시지 크기 제한
 * 5. 시간 (미래 시간인지)
 */
export function validateSchedule(message: string, fileInfos: FileInfo[], timestamp: number, hasUploadsInProgress = false): ValidationResult {
    const trimmedMessage = message.trim();

    // 1. 파일 업로드 진행 중 확인
    if (hasUploadsInProgress) {
        return {
            isValid: false,
            errorMessage: 'Please wait for file uploads to complete before scheduling.',
        };
    }

    // 2. 메시지와 파일이 둘 다 비어있는지 확인
    if (!trimmedMessage && fileInfos.length === 0) {
        return {
            isValid: false,
            errorMessage: 'Please enter a message or attach a file.',
        };
    }

    // 3. 파일 개수 확인
    if (fileInfos.length > MAX_FILE_COUNT) {
        return {
            isValid: false,
            errorMessage: `Uploads limited to ${MAX_FILE_COUNT} files maximum. Please use additional posts for more files.(Current count: ${fileInfos.length})`,
        };
    }

    // 4. 메시지 크기 확인
    const messageBytes = new TextEncoder().encode(trimmedMessage).length;
    if (messageBytes > MAX_MESSAGE_BYTES) {
        const messageSizeKB = (messageBytes / 1024).toFixed(2);
        const maxSizeKB = (MAX_MESSAGE_BYTES / 1024).toFixed(0);
        return {
            isValid: false,
            errorMessage: `Message size is too large. (${messageSizeKB}KB / max ${maxSizeKB}KB)`,
        };
    }

    // 5. 시간 검증 (마지막)
    const now = Date.now();
    if (timestamp <= now) {
        return {
            isValid: false,
            errorMessage: 'The scheduled time must be in the future. Please select a later time.',
        };
    }

    // 모든 검증 통과
    return {
        isValid: true,
        errorMessage: null,
    };
}
