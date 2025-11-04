// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {validateSchedule} from './validation';
import {MAX_FILE_COUNT, MAX_MESSAGE_BYTES} from '@/shared/constants/validation';
import type {FileInfo} from '@/entities/mattermost/model/types';

describe('validateSchedule', () => {
    const futureTimestamp = Date.now() + 60000; // 1분 후
    const pastTimestamp = Date.now() - 1000; // 1초 전

    const createMockFile = (id = '1'): FileInfo => ({
        id,
        name: 'test.txt',
        size: 100,
        extension: 'txt',
    });

    describe('Priority 1: Uploads in progress check', () => {
        test('should fail when uploads are in progress', () => {
            const result = validateSchedule('test message', [], futureTimestamp, true);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('Please wait for file uploads to complete before scheduling.');
        });

        test('should continue validation when no uploads in progress', () => {
            const result = validateSchedule('test message', [], futureTimestamp, false);

            expect(result.isValid).toBe(true);
        });
    });

    describe('Priority 2: Message/File required', () => {
        test('should fail when both message and files are empty', () => {
            const result = validateSchedule('', [], futureTimestamp);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('Please enter a message or attach a file.');
        });

        test('should fail when message is only whitespace and no files', () => {
            const result = validateSchedule('   \n\t  ', [], futureTimestamp);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('Please enter a message or attach a file.');
        });

        test('should pass with message only', () => {
            const result = validateSchedule('test message', [], futureTimestamp);

            expect(result.isValid).toBe(true);
        });

        test('should pass with files only', () => {
            const files = [createMockFile()];
            const result = validateSchedule('', files, futureTimestamp);

            expect(result.isValid).toBe(true);
        });

        test('should pass with both message and files', () => {
            const files = [createMockFile()];
            const result = validateSchedule('test', files, futureTimestamp);

            expect(result.isValid).toBe(true);
        });
    });

    describe('Priority 3: File count limit', () => {
        test('should pass with exactly MAX_FILE_COUNT files', () => {
            const files = Array.from({length: MAX_FILE_COUNT}, (_, i) => createMockFile(String(i)));
            const result = validateSchedule('', files, futureTimestamp);

            expect(result.isValid).toBe(true);
        });

        test('should fail with MAX_FILE_COUNT + 1 files', () => {
            const files = Array.from({length: MAX_FILE_COUNT + 1}, (_, i) => createMockFile(String(i)));
            const result = validateSchedule('', files, futureTimestamp);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toContain('10 files maximum');
            expect(result.errorMessage).toContain('Current count: 11');
        });

        test('should fail with many files (20)', () => {
            const files = Array.from({length: 20}, (_, i) => createMockFile(String(i)));
            const result = validateSchedule('', files, futureTimestamp);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toContain('Current count: 20');
        });
    });

    describe('Priority 4: Message size limit', () => {
        test('should pass with message under limit', () => {
            const message = 'a'.repeat(100); // 100 bytes
            const result = validateSchedule(message, [], futureTimestamp);

            expect(result.isValid).toBe(true);
        });

        test('should pass with message exactly at limit', () => {
            const message = 'a'.repeat(MAX_MESSAGE_BYTES);
            const result = validateSchedule(message, [], futureTimestamp);

            expect(result.isValid).toBe(true);
        });

        test('should fail with message over limit', () => {
            const message = 'a'.repeat(MAX_MESSAGE_BYTES + 1);
            const result = validateSchedule(message, [], futureTimestamp);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toContain('Message size is too large');
            expect(result.errorMessage).toContain('50KB');
        });

        test('should handle multi-byte characters correctly', () => {
            // Korean character (가) is 3 bytes in UTF-8
            const koreanChar = '가';
            const message = koreanChar.repeat(Math.floor(MAX_MESSAGE_BYTES / 3) + 1);
            const result = validateSchedule(message, [], futureTimestamp);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toContain('Message size is too large');
        });

        test('should trim whitespace before checking size', () => {
            const message = '  test  ';
            const result = validateSchedule(message, [], futureTimestamp);

            expect(result.isValid).toBe(true);
        });
    });

    describe('Priority 5: Time validation', () => {
        test('should fail when time is in the past', () => {
            const result = validateSchedule('test', [], pastTimestamp);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('The scheduled time must be in the future. Please select a later time.');
        });

        test('should fail when time is exactly now', () => {
            const now = Date.now();
            const result = validateSchedule('test', [], now);

            expect(result.isValid).toBe(false);
        });

        test('should pass when time is 1 second in future', () => {
            const timestamp = Date.now() + 1000;
            const result = validateSchedule('test', [], timestamp);

            expect(result.isValid).toBe(true);
        });

        test('should pass when time is far in future', () => {
            const timestamp = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year
            const result = validateSchedule('test', [], timestamp);

            expect(result.isValid).toBe(true);
        });
    });

    describe('Validation priority order', () => {
        test('should check uploads before message/files', () => {
            // Empty message & files, but uploads in progress
            const result = validateSchedule('', [], futureTimestamp, true);

            expect(result.errorMessage).toBe('Please wait for file uploads to complete before scheduling.');
        });

        test('should check message/files before file count', () => {
            // Many files but empty message
            const files = Array.from({length: 15}, (_, i) => createMockFile(String(i)));
            const result = validateSchedule('', files, futureTimestamp);

            // Should fail on file count, not on empty message (because we have files)
            expect(result.errorMessage).toContain('10 files maximum');
        });

        test('should check file count before message size', () => {
            // Too many files AND large message
            const files = Array.from({length: 15}, (_, i) => createMockFile(String(i)));
            const message = 'a'.repeat(MAX_MESSAGE_BYTES + 1);
            const result = validateSchedule(message, files, futureTimestamp);

            // Should fail on file count first
            expect(result.errorMessage).toContain('10 files maximum');
        });

        test('should check message size before time', () => {
            // Large message AND past time
            const message = 'a'.repeat(MAX_MESSAGE_BYTES + 1);
            const result = validateSchedule(message, [], pastTimestamp);

            // Should fail on message size first
            expect(result.errorMessage).toContain('Message size is too large');
        });
    });

    describe('Edge cases', () => {
        test('should handle empty fileInfos array', () => {
            const result = validateSchedule('test', [], futureTimestamp);

            expect(result.isValid).toBe(true);
        });

        test('should handle undefined hasUploadsInProgress (defaults to false)', () => {
            const result = validateSchedule('test', [], futureTimestamp);

            expect(result.isValid).toBe(true);
        });

        test('should return null errorMessage when valid', () => {
            const result = validateSchedule('test', [], futureTimestamp);

            expect(result.errorMessage).toBeNull();
        });
    });
});
