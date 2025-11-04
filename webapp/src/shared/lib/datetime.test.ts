// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {formatDateTime, combineDateAndTime, getMinDate, getDefaultScheduleDateTime} from './datetime';

describe('formatDateTime', () => {
    test('should format timestamp to date and time', () => {
        // 2025-12-01 14:30:00
        const timestamp = new Date(2025, 11, 1, 14, 30, 0).getTime();
        const result = formatDateTime(timestamp);

        expect(result.date).toBe('2025-12-01');
        expect(result.time).toBe('14:30');
    });

    test('should pad single digit month and day with zeros', () => {
        // 2025-01-05 09:05:00
        const timestamp = new Date(2025, 0, 5, 9, 5, 0).getTime();
        const result = formatDateTime(timestamp);

        expect(result.date).toBe('2025-01-05');
        expect(result.time).toBe('09:05');
    });

    test('should handle midnight', () => {
        const timestamp = new Date(2025, 6, 15, 0, 0, 0).getTime();
        const result = formatDateTime(timestamp);

        expect(result.time).toBe('00:00');
    });

    test('should handle 23:59', () => {
        const timestamp = new Date(2025, 6, 15, 23, 59, 0).getTime();
        const result = formatDateTime(timestamp);

        expect(result.time).toBe('23:59');
    });
});

describe('combineDateAndTime', () => {
    test('should combine date and time to timestamp', () => {
        const timestamp = combineDateAndTime('2025-12-01', '14:30');
        const date = new Date(timestamp);

        expect(date.getFullYear()).toBe(2025);
        expect(date.getMonth()).toBe(11); // 0-indexed
        expect(date.getDate()).toBe(1);
        expect(date.getHours()).toBe(14);
        expect(date.getMinutes()).toBe(30);
        expect(date.getSeconds()).toBe(0);
    });

    test('should handle midnight', () => {
        const timestamp = combineDateAndTime('2025-06-15', '00:00');
        const date = new Date(timestamp);

        expect(date.getHours()).toBe(0);
        expect(date.getMinutes()).toBe(0);
    });

    test('should handle 23:59', () => {
        const timestamp = combineDateAndTime('2025-06-15', '23:59');
        const date = new Date(timestamp);

        expect(date.getHours()).toBe(23);
        expect(date.getMinutes()).toBe(59);
    });

    test('should set seconds to 0', () => {
        const timestamp = combineDateAndTime('2025-12-01', '14:30');
        const date = new Date(timestamp);

        expect(date.getSeconds()).toBe(0);
    });
});

describe('formatDateTime and combineDateAndTime round-trip', () => {
    test('should be reversible', () => {
        const originalTimestamp = new Date(2025, 5, 15, 10, 25, 0).getTime();

        const {date, time} = formatDateTime(originalTimestamp);
        const reconstructedTimestamp = combineDateAndTime(date, time);

        expect(reconstructedTimestamp).toBe(originalTimestamp);
    });

    test('should handle various dates and times', () => {
        const testCases = [
            new Date(2025, 0, 1, 0, 0, 0),      // New Year midnight
            new Date(2025, 11, 31, 23, 59, 0),  // New Year's Eve 23:59
            new Date(2025, 6, 15, 12, 30, 0),   // Mid-year noon-ish
        ];

        testCases.forEach((originalDate) => {
            const originalTimestamp = originalDate.getTime();
            const {date, time} = formatDateTime(originalTimestamp);
            const reconstructedTimestamp = combineDateAndTime(date, time);

            expect(reconstructedTimestamp).toBe(originalTimestamp);
        });
    });
});

describe('getMinDate', () => {
    test('should return today\'s date in YYYY-MM-DD format', () => {
        const result = getMinDate();
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const expectedDate = `${year}-${month}-${day}`;

        expect(result).toBe(expectedDate);
    });

    test('should pad single digit months and days', () => {
        const result = getMinDate();

        // Format should be YYYY-MM-DD with proper padding
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('getDefaultScheduleDateTime', () => {
    test('should return time approximately 5 minutes in future', () => {
        const mockNow = new Date(2025, 5, 15, 14, 30, 0);
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const result = getDefaultScheduleDateTime();
        const timestamp = combineDateAndTime(result.date, result.time);

        // Should be approximately 5 minutes from mocked time
        const diff = timestamp - mockNow.getTime();
        const fiveMinutes = 5 * 60 * 1000;

        // Should be exactly 5 minutes (300000ms)
        expect(diff).toBe(fiveMinutes);

        jest.useRealTimers();
    });

    test('should return date in YYYY-MM-DD format', () => {
        const result = getDefaultScheduleDateTime();

        expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should return time in HH:mm format', () => {
        const result = getDefaultScheduleDateTime();

        expect(result.time).toMatch(/^\d{2}:\d{2}$/);
    });

    test('should handle crossing hour boundary', () => {
        // Mock Date constructor to return a specific time
        const mockNow = new Date(2025, 5, 15, 14, 58, 0);
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const result = getDefaultScheduleDateTime();

        // 5 minutes later should be 15:03
        expect(result.time).toBe('15:03');

        jest.useRealTimers();
    });

    test('should handle crossing day boundary', () => {
        // Mock current time as 23:58 on June 15
        const mockNow = new Date(2025, 5, 15, 23, 58, 0);
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const result = getDefaultScheduleDateTime();

        // 5 minutes later should be June 16, 00:03
        expect(result.date).toBe('2025-06-16');
        expect(result.time).toBe('00:03');

        jest.useRealTimers();
    });

    test('should handle crossing month boundary', () => {
        // Mock current time as 23:58 on June 30
        const mockNow = new Date(2025, 5, 30, 23, 58, 0);
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const result = getDefaultScheduleDateTime();

        // 5 minutes later should be July 1, 00:03
        expect(result.date).toBe('2025-07-01');
        expect(result.time).toBe('00:03');

        jest.useRealTimers();
    });

    test('should handle crossing year boundary', () => {
        // Mock current time as 23:58 on December 31
        const mockNow = new Date(2025, 11, 31, 23, 58, 0);
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);

        const result = getDefaultScheduleDateTime();

        // 5 minutes later should be January 1, 2026, 00:03
        expect(result.date).toBe('2026-01-01');
        expect(result.time).toBe('00:03');

        jest.useRealTimers();
    });
});
