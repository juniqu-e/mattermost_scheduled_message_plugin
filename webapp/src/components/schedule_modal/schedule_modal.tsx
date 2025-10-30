// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

import type {ScheduleModalProps, ScheduleModalState} from '../../types';

import DateTimePicker from './date_time_picker';

import './schedule_modal.css';

// Mattermost에서 제공하는 react-bootstrap 사용
const {Modal} = window.ReactBootstrap;

/**
 * ScheduleModal Component
 * 예약 메시지 스케줄링을 위한 모달 컴포넌트
 *
 * @component
 */
export default class ScheduleModal extends PureComponent<ScheduleModalProps, ScheduleModalState> {
    constructor(props: ScheduleModalProps) {
        super(props);

        // 기본값: 오늘 날짜, 현재 시간
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        this.state = {
            selectedDate: `${year}-${month}-${day}`,
            selectedTime: `${hours}:${minutes}`,
        };
    }

    /**
     * 날짜 변경 핸들러
     */
    handleDateChange = (date: string) => {
        this.setState({selectedDate: date});
    };

    /**
     * 시간 변경 핸들러
     */
    handleTimeChange = (time: string) => {
        this.setState({selectedTime: time});
    };

    /**
     * 예약 버튼 클릭 핸들러
     */
    handleSchedule = () => {
        const {selectedDate, selectedTime} = this.state;

        if (!selectedDate || !selectedTime) {
            return;
        }

        // 날짜와 시간을 결합하여 Unix timestamp 생성
        const timestamp = this.combineDateAndTime(selectedDate, selectedTime);

        // 부모 컴포넌트로 timestamp 전달
        this.props.onSchedule(timestamp);

        // 모달 닫기
        this.props.onClose();
    };

    /**
     * 날짜와 시간을 결합하여 Unix timestamp 반환
     */
    combineDateAndTime = (date: string, time: string): number => {
        const [hours, minutes] = time.split(':');
        const dateTime = new Date(date);
        dateTime.setHours(parseInt(hours, 10));
        dateTime.setMinutes(parseInt(minutes, 10));
        dateTime.setSeconds(0);
        return dateTime.getTime();
    };

    render() {
        const {isOpen, onClose, message, fileInfos} = this.props;
        const {selectedDate, selectedTime} = this.state;

        const isScheduleDisabled = !selectedDate || !selectedTime;

        return (
            <Modal
                show={isOpen}
                onHide={onClose}
                dialogClassName='schedule-modal'
                backdrop='static'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {'Schedule Message'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* 날짜/시간 선택 */}
                    <DateTimePicker
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onDateChange={this.handleDateChange}
                        onTimeChange={this.handleTimeChange}
                    />
                </Modal.Body>

                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link'
                        onClick={onClose}
                    >
                        {'Cancel'}
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        onClick={this.handleSchedule}
                        disabled={isScheduleDisabled}
                    >
                        {'Schedule'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
