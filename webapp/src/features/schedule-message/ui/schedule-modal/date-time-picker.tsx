// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {DateTimePickerProps} from '../../model/types';

import {getMinDate} from '@/shared/lib/datetime';

/**
 * DateTimePicker Component
 * 날짜와 시간을 선택하는 컴포넌트
 *
 * @component
 * @example
 * <DateTimePicker
 *     selectedDate="2025-10-30"
 *     selectedTime="14:30"
 *     onDateChange={handleDateChange}
 *     onTimeChange={handleTimeChange}
 * />
 */
const DateTimePicker: React.FC<DateTimePickerProps> = (props) => {
    const {selectedDate, selectedTime, onDateChange, onTimeChange} = props;

    /**
     * 날짜 입력 변경 핸들러
     */
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateChange(e.target.value);
    };

    /**
     * 시간 입력 변경 핸들러
     */
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTimeChange(e.target.value);
    };

    return (
        <div className='date-time-picker'>
            <div className='date-time-picker__field'>
                <label
                    htmlFor='schedule-date'
                    className='date-time-picker__label'
                >
                    {'Date'}
                </label>
                <input
                    id='schedule-date'
                    type='date'
                    value={selectedDate}
                    min={getMinDate()}
                    onChange={handleDateChange}
                    className='form-control'
                />
            </div>

            <div className='date-time-picker__field'>
                <label
                    htmlFor='schedule-time'
                    className='date-time-picker__label'
                >
                    {'Time'}
                </label>
                <input
                    id='schedule-time'
                    type='time'
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className='form-control'
                />
            </div>
        </div>
    );
};

export default DateTimePicker;
