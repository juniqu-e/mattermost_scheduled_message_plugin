// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import * as ActionTypes from './actionTypes';
import type {ScheduleData, PluginState} from '../types/schedule';

/**
 * 모달 열림 상태 reducer
 */
const isModalOpen = (state = false, action: any): boolean => {
    switch (action.type) {
    case ActionTypes.OPEN_SCHEDULE_MODAL:
        return true;
    case ActionTypes.CLOSE_SCHEDULE_MODAL:
        return false;
    default:
        return state;
    }
};

/**
 * 스케줄 데이터 reducer
 */
const scheduleData = (state: ScheduleData | null = null, action: any): ScheduleData | null => {
    switch (action.type) {
    case ActionTypes.OPEN_SCHEDULE_MODAL:
        return action.data;
    case ActionTypes.SET_SCHEDULE_DATA:
        return state ? {...state, ...action.data} : action.data;
    case ActionTypes.CLOSE_SCHEDULE_MODAL:
        return null;
    default:
        return state;
    }
};

/**
 * Root reducer
 */
export default combineReducers<PluginState>({
    isModalOpen,
    scheduleData,
});
