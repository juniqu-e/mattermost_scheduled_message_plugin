// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as ActionTypes from './actionTypes';
import type {ScheduleData} from '../types/schedule';

/**
 * 스케줄 모달 열기
 */
export const openScheduleModal = (data: ScheduleData) => ({
    type: ActionTypes.OPEN_SCHEDULE_MODAL,
    data,
});

/**
 * 스케줄 모달 닫기
 */
export const closeScheduleModal = () => ({
    type: ActionTypes.CLOSE_SCHEDULE_MODAL,
});

/**
 * 스케줄 데이터 설정
 */
export const setScheduleData = (data: Partial<ScheduleData>) => ({
    type: ActionTypes.SET_SCHEDULE_DATA,
    data,
});
