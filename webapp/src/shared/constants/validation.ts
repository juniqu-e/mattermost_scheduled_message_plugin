// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * 검증 관련 상수
 * 서버 코드의 제약사항과 일치해야 함
 */

/**
 * 예약 메세지 파일 첨부 최대 개수
 * @see server/command/schedule_service.go:165
 */
export const MAX_FILE_COUNT = 10;

/**
 * 예약 메시지 텍스트 최대 크기 (바이트)
 * @see server/constants/constants.go:11
 */
export const MAX_MESSAGE_BYTES = 50 * 1024; // 50KB
