// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

import type {DateTimePickerProps} from '../../types';

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
export default class DateTimePicker extends PureComponent<DateTimePickerProps> {
    /**
     * 날짜 입력 변경 핸들러
     */
    handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onDateChange(e.target.value);
    };

    /**
     * 시간 입력 변경 핸들러
     */
    handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onTimeChange(e.target.value);
    };

    /**
     * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
     */
    getMinDate = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    render() {
        const {selectedDate, selectedTime} = this.props;

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
                        min={this.getMinDate()}
                        onChange={this.handleDateChange}
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
                        onChange={this.handleTimeChange}
                        className='form-control'
                    />
                </div>
            </div>
        );
    }
}
