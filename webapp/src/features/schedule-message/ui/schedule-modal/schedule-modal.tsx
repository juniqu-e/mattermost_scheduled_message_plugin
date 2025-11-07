// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DateTimePicker from './date-time-picker';

import type {ScheduleModalProps} from '../../model/types';

import {SendIcon, FormatListBulletedIcon} from '@/shared/components';
import {combineDateAndTime, getDefaultScheduleDateTime, validateSchedule} from '@/shared/lib';

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
    const {isOpen, message, fileInfos, hasUploadsInProgress, onClose, onSchedule, onViewList} = props;

    const defaultDateTime = getDefaultScheduleDateTime();
    const [selectedDate, setSelectedDate] = React.useState(defaultDateTime.date);
    const [selectedTime, setSelectedTime] = React.useState(defaultDateTime.time);

    /**
     * 모달이 열릴 때마다 기본 시간을 현재 + 5분으로 리셋
     */
    React.useEffect(() => {
        if (isOpen) {
            const newDefaultDateTime = getDefaultScheduleDateTime();
            setSelectedDate(newDefaultDateTime.date);
            setSelectedTime(newDefaultDateTime.time);
        }
    }, [isOpen]);

    /**
     * 검증 로직
     */
    const timestamp = combineDateAndTime(selectedDate, selectedTime);
    const validationResult = validateSchedule(message, fileInfos, timestamp, hasUploadsInProgress);
    const validationError = validationResult.errorMessage;

    /**
     * 예약 버튼 클릭 핸들러
     */
    const handleSchedule = () => {
        if (!selectedDate || !selectedTime || validationError) {
            return;
        }

        // 날짜와 시간을 결합하여 Unix timestamp 생성
        const timestamp = combineDateAndTime(selectedDate, selectedTime);

        // 부모 컴포넌트로 timestamp 전달
        onSchedule(timestamp);

        // 모달 닫기
        onClose();
    };

    const isScheduleDisabled = !selectedDate || !selectedTime || Boolean(validationError);

    return (
        <Modal
            show={isOpen}
            onHide={onClose}
            dialogClassName='schedule-modal'
            backdrop='static'
        >
            <Modal.Header closeButton={true}>
                <div className='schedule-modal-header'>
                    <Modal.Title>
                        {'예약 메세지'}
                    </Modal.Title>
                    <p className='schedule-modal-header__description'>
                        {'지정한 날짜와 시간에 메시지가 자동으로 전송됩니다.'}
                    </p>
                </div>
            </Modal.Header>

            <Modal.Body>
                {/* 날짜/시간 선택 */}
                <DateTimePicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateChange={setSelectedDate}
                    onTimeChange={setSelectedTime}
                />

                {/* 검증 에러 메시지 */}
                {validationError && (
                    <div className='schedule-modal-validation-error'>
                        {validationError}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <div className='schedule-modal-footer__left'>
                    <button
                        type='button'
                        className='btn btn-link schedule-modal-footer__list'
                        onClick={onViewList}
                    >
                        <FormatListBulletedIcon
                            size={12}
                            color='currentColor'
                        />
                        <span>{'예약 메세지 목록'}</span>
                    </button>
                </div>
                <div className='schedule-modal-footer__right'>
                    <button
                        type='button'
                        className='btn schedule-modal-footer__cancel'
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
                        <SendIcon
                            size={18}
                            color='currentColor'
                        />
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleModal;
