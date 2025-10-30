// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {GlobalState} from '@mattermost/types/store';

import manifest from '../../manifest';
import {closeScheduleModal} from '../../store/actions';
import type {PluginState} from '../../types/schedule';
import {formatFileSize, getFileIconClass} from '../../utils/fileFormatter';

import './style.css';

const pluginId = manifest.id;

/**
 * 스케줄 메시지 모달 컴포넌트
 */
const ScheduleModal: React.FC = () => {
    const dispatch = useDispatch();

    // Redux store에서 상태 가져오기
    const isOpen = useSelector((state: GlobalState) => {
        const pluginState = (state as any)[`plugins-${pluginId}`] as PluginState;
        return pluginState?.isModalOpen || false;
    });

    const scheduleData = useSelector((state: GlobalState) => {
        const pluginState = (state as any)[`plugins-${pluginId}`] as PluginState;
        return pluginState?.scheduleData;
    });

    // 날짜와 시간 상태
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [error, setError] = useState<string>('');

    // 모달이 열릴 때 현재 날짜/시간으로 초기화
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            setSelectedDate(dateStr);
            setSelectedTime(timeStr);
            setError('');
        }
    }, [isOpen]);

    /**
     * 모달 닫기
     */
    const handleClose = () => {
        dispatch(closeScheduleModal());
    };

    /**
     * 예약 전송 처리
     */
    const handleSchedule = () => {
        // 입력 검증
        if (!selectedDate || !selectedTime) {
            setError('날짜와 시간을 모두 선택해주세요.');
            return;
        }

        // 선택한 날짜/시간이 현재보다 미래인지 확인
        const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
        const now = new Date();

        if (scheduledDateTime <= now) {
            setError('미래의 날짜와 시간을 선택해주세요.');
            return;
        }

        // 콘솔에 출력 (GUI만 구현, API 호출 없음)
        // eslint-disable-next-line no-console
        console.log('Schedule message:', {
            message: scheduleData?.message,
            fileAttachments: scheduleData?.fileAttachments,
            channelId: scheduleData?.channelId,
            rootId: scheduleData?.rootId,
            scheduledTime: scheduledDateTime.toISOString(),
        });

        // 모달 닫기
        handleClose();
    };

    /**
     * 백드롭 클릭 시 모달 닫기
     */
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // 모달이 닫혀있으면 렌더링하지 않음
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className='schedule-modal-backdrop'
            onClick={handleBackdropClick}
        >
            <div className='schedule-modal'>
                {/* 헤더 */}
                <div className='schedule-modal-header'>
                    <h2>메시지 예약 전송</h2>
                    <button
                        className='schedule-modal-close'
                        onClick={handleClose}
                        aria-label='Close'
                    >
                        <i className='icon icon-close'/>
                    </button>
                </div>

                {/* 본문 */}
                <div className='schedule-modal-body'>
                    {/* 메시지 미리보기 */}
                    {scheduleData?.message && (
                        <div className='schedule-modal-message-preview'>
                            <label>전송할 메시지:</label>
                            <div className='message-preview-content'>
                                {scheduleData.message}
                            </div>
                        </div>
                    )}

                    {/* 파일 첨부 목록 */}
                    {scheduleData?.fileAttachments && scheduleData.fileAttachments.length > 0 && (
                        <div className='schedule-modal-files-preview'>
                            <label>첨부 파일 ({scheduleData.fileAttachments.length}개):</label>
                            <div className='files-preview-list'>
                                {scheduleData.fileAttachments.map((file) => (
                                    <div
                                        key={file.id}
                                        className='file-preview-item'
                                    >
                                        <div className='file-icon'>
                                            <i className={`icon ${getFileIconClass(file.extension)}`}/>
                                        </div>
                                        <div className='file-info'>
                                            <div className='file-name'>{file.name}</div>
                                            <div className='file-size'>{formatFileSize(file.size)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 날짜/시간 선택 */}
                    <div className='schedule-modal-datetime-picker'>
                        <div className='datetime-picker-section'>
                            <label htmlFor='schedule-date'>날짜 선택</label>
                            <input
                                id='schedule-date'
                                type='date'
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className='schedule-date-input'
                            />
                        </div>

                        <div className='datetime-picker-section'>
                            <label htmlFor='schedule-time'>시간 선택</label>
                            <input
                                id='schedule-time'
                                type='time'
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className='schedule-time-input'
                            />
                        </div>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className='schedule-modal-error'>
                            <i className='icon icon-alert-outline'/>
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className='schedule-modal-footer'>
                    <button
                        className='btn btn-tertiary'
                        onClick={handleClose}
                    >
                        취소
                    </button>
                    <button
                        className='btn btn-primary'
                        onClick={handleSchedule}
                    >
                        <i className='icon icon-clock-outline'/>
                        예약 전송
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleModal;
