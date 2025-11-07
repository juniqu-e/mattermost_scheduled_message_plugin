// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

import {ScheduleApiClient} from './schedule-api';

// Mock mattermost-redux
jest.mock('mattermost-redux/client');

describe('ScheduleApiClient', () => {
    let apiClient: ScheduleApiClient;

    // @ts-expect-error - doFetch is protected but we need to mock it for testing
    const mockDoFetch = Client4.doFetch as jest.MockedFunction<typeof Client4.doFetch>;

    beforeEach(() => {
        apiClient = new ScheduleApiClient();
        mockDoFetch.mockClear();
    });

    describe('createScheduledMessage', () => {
        const mockRequest = {
            channel_id: 'channel123',
            message: 'Test message',
            post_at_date: '2025-12-01',
            post_at_time: '14:30',
            file_ids: ['file1', 'file2'],
        };

        test('should call API with correct endpoint', async () => {
            mockDoFetch.mockResolvedValue({id: 'schedule123'});

            await apiClient.createScheduledMessage(mockRequest);

            expect(mockDoFetch).toHaveBeenCalledTimes(1);
            expect(mockDoFetch).toHaveBeenCalledWith(
                '/plugins/com.mattermost-plugin-schedule-message-gui/api/v1/schedule',
                expect.any(Object),
            );
        });

        test('should send POST request with JSON body', async () => {
            mockDoFetch.mockResolvedValue({id: 'schedule123'});

            await apiClient.createScheduledMessage(mockRequest);

            const callArgs = mockDoFetch.mock.calls[0];
            expect(callArgs[1].method).toBe('POST');
            expect(callArgs[1].body).toBe(JSON.stringify(mockRequest));
        });

        test('should return scheduled message from API', async () => {
            const mockResponse = {
                id: 'schedule123',
                channel_id: 'channel123',
                user_id: 'user123',
                message: 'Test message',
                post_at: 1735740600000,
            };
            mockDoFetch.mockResolvedValue(mockResponse);

            const result = await apiClient.createScheduledMessage(mockRequest);

            expect(result).toEqual(mockResponse);
        });

        test('should handle empty file_ids array', async () => {
            mockDoFetch.mockResolvedValue({id: 'schedule123'});

            const requestWithoutFiles = {
                ...mockRequest,
                file_ids: [],
            };

            await apiClient.createScheduledMessage(requestWithoutFiles);

            const callArgs = mockDoFetch.mock.calls[0];
            const body = JSON.parse(callArgs[1].body);
            expect(body.file_ids).toEqual([]);
        });

        test('should handle empty message', async () => {
            mockDoFetch.mockResolvedValue({id: 'schedule123'});

            const requestWithoutMessage = {
                ...mockRequest,
                message: '',
            };

            await apiClient.createScheduledMessage(requestWithoutMessage);

            const callArgs = mockDoFetch.mock.calls[0];
            const body = JSON.parse(callArgs[1].body);
            expect(body.message).toBe('');
        });

        test('should propagate API errors', async () => {
            const mockError = new Error('API Error: Invalid channel');
            mockDoFetch.mockRejectedValue(mockError);

            await expect(
                apiClient.createScheduledMessage(mockRequest),
            ).rejects.toThrow('API Error: Invalid channel');
        });

        test('should handle network errors', async () => {
            const networkError = new Error('Network request failed');
            mockDoFetch.mockRejectedValue(networkError);

            await expect(
                apiClient.createScheduledMessage(mockRequest),
            ).rejects.toThrow('Network request failed');
        });
    });

    describe('getSchedules', () => {
        const channelId = 'channel123';

        test('should call API with correct endpoint', async () => {
            mockDoFetch.mockResolvedValue(undefined);

            await apiClient.getSchedules(channelId);

            expect(mockDoFetch).toHaveBeenCalledTimes(1);
            expect(mockDoFetch).toHaveBeenCalledWith(
                '/plugins/com.mattermost-plugin-schedule-message-gui/api/v1/schedule/channel123',
                expect.any(Object),
            );
        });

        test('should send GET request', async () => {
            mockDoFetch.mockResolvedValue(undefined);

            await apiClient.getSchedules(channelId);

            const callArgs = mockDoFetch.mock.calls[0];
            expect(callArgs[1].method).toBe('GET');
        });

        test('should handle successful response', async () => {
            mockDoFetch.mockResolvedValue(undefined);

            // Server responds with ephemeral post, returns void
            const result = await apiClient.getSchedules(channelId);

            expect(result).toBeUndefined();
        });

        test('should handle different channel IDs', async () => {
            mockDoFetch.mockResolvedValue(undefined);

            await apiClient.getSchedules('another-channel-id');

            expect(mockDoFetch).toHaveBeenCalledWith(
                '/plugins/com.mattermost-plugin-schedule-message-gui/api/v1/schedule/another-channel-id',
                expect.any(Object),
            );
        });

        test('should handle special characters in channel ID', async () => {
            mockDoFetch.mockResolvedValue(undefined);

            const specialChannelId = 'channel-with-dashes_and_underscores';
            await apiClient.getSchedules(specialChannelId);

            expect(mockDoFetch).toHaveBeenCalledWith(
                `/plugins/com.mattermost-plugin-schedule-message-gui/api/v1/schedule/${specialChannelId}`,
                expect.any(Object),
            );
        });

        test('should propagate API errors', async () => {
            const mockError = new Error('Channel not found');
            mockDoFetch.mockRejectedValue(mockError);

            await expect(
                apiClient.getSchedules(channelId),
            ).rejects.toThrow('Channel not found');
        });

        test('should handle 403 Forbidden error', async () => {
            const forbiddenError = new Error('User does not have permission');
            mockDoFetch.mockRejectedValue(forbiddenError);

            await expect(
                apiClient.getSchedules(channelId),
            ).rejects.toThrow('User does not have permission');
        });
    });

    describe('singleton instance', () => {
        test('should export scheduleApiClient instance', () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const {scheduleApiClient} = require('./schedule-api');

            expect(scheduleApiClient).toBeInstanceOf(ScheduleApiClient);
        });
    });
});
