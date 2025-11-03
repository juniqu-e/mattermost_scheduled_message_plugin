// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DateTimePicker from './date-time-picker';

import type {ScheduleModalProps} from '../../model/types';

import {combineDateAndTime, getCurrentDate, getCurrentTime} from '@/shared/lib/datetime';

import './schedule-modal.css';

// Mattermost에서 제공하는 react-bootstrap 사용
const {Modal} = window.ReactBootstrap;

/**
 * ScheduleModal Component
 * 예약 메시지 스케줄링을 위한 모달 컴포넌트
 *
 * @component
 */
const ScheduleModal: React.FC<ScheduleModalProps> = (props) => {
    const {isOpen, onClose, onSchedule} = props;

    const [selectedDate, setSelectedDate] = React.useState(getCurrentDate());
    const [selectedTime, setSelectedTime] = React.useState(getCurrentTime());

    /**
     * 예약 버튼 클릭 핸들러
     */
    const handleSchedule = () => {
        if (!selectedDate || !selectedTime) {
            return;
        }

        // 날짜와 시간을 결합하여 Unix timestamp 생성
        const timestamp = combineDateAndTime(selectedDate, selectedTime);

        // 부모 컴포넌트로 timestamp 전달
        onSchedule(timestamp);

        // 모달 닫기
        onClose();
    };

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
                    onDateChange={setSelectedDate}
                    onTimeChange={setSelectedTime}
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
                    onClick={handleSchedule}
                    disabled={isScheduleDisabled}
                >
                    {'Schedule'}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleModal;
