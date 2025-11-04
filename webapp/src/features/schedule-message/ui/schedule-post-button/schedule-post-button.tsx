// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ScheduleIcon from './schedule-icon';

import {useMessageData} from '../../hooks/use-message-data';
import {useScheduleMessage} from '../../hooks/use-schedule-message';
import type {SchedulePostButtonProps, FileInfo} from '../../model/types';
import ScheduleModal from '../schedule-modal';
import {scheduleApiClient} from '../../api/schedule-api';
import {mattermostService} from '@/entities/mattermost';

import './schedule-post-button.css';

// Mattermost에서 제공하는 react-bootstrap 사용
const {OverlayTrigger, Tooltip} = window.ReactBootstrap;

/**
 * SchedulePostButton Component
 * 포매팅바에 표시되는 예약 메시지 버튼 컴포넌트
 *
 * OverlayTrigger와 Tooltip으로 hover 시 "Schedule message" 표시
 *
 * @component
 * @example
 * <SchedulePostButton onClick={handleScheduleClick} />
 */
const SchedulePostButton: React.FC<SchedulePostButtonProps> = (props) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [fileInfos, setFileInfos] = React.useState<FileInfo[]>([]);
    const [hasUploads, setHasUploads] = React.useState(false);

    const {getCurrentMessage, getCurrentFiles, clearDraft, hasUploadsInProgress} = useMessageData();
    const {scheduleMessage: scheduleMessageApi} = useScheduleMessage();

    /**
     * 버튼 클릭 이벤트 핸들러
     */
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // 현재 메시지와 파일 가져오기
        const currentMessage = getCurrentMessage();
        const currentFiles = getCurrentFiles();

        // 메시지나 파일이 없으면 예약 목록 조회
        if (!currentMessage && currentFiles.length === 0) {
            console.log('No message or files, showing scheduled messages list');

            try {
                // 현재 채널 ID 가져오기
                const channelId = mattermostService.getCurrentChannelId();
                if (!channelId) {
                    throw new Error('Could not determine current channel');
                }

                // API 호출 (서버가 ephemeral post로 리스트를 보여줌)
                await scheduleApiClient.getSchedules(channelId);

                console.log('Scheduled messages list requested successfully');
            } catch (error) {
                console.error('Failed to get scheduled messages:', error);
                alert(`Failed to get scheduled messages: ${error instanceof Error ? error.message : String(error)}`);
            }

            if (props.onClick) {
                props.onClick();
            }
            return;
        }

        // 메시지와 파일 정보 출력
        console.log('Message:', currentMessage);
        console.log('Files:', currentFiles);

        // 업로드 중인 파일 확인
        const uploadsInProgress = hasUploadsInProgress();
        console.log('Uploads in progress:', uploadsInProgress);

        // 상태 업데이트 및 모달 열기
        setMessage(currentMessage);
        setFileInfos(currentFiles);
        setHasUploads(uploadsInProgress);
        setIsModalOpen(true);

        if (props.onClick) {
            props.onClick();
        }
    };

    /**
     * 모달 닫기 핸들러
     */
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setMessage('');
        setFileInfos([]);
    };

    /**
     * 예약 핸들러
     */
    const handleSchedule = async (timestamp: number) => {
        console.log('Scheduling message:', {
            timestamp,
            message,
            fileInfos,
            scheduledDate: new Date(timestamp),
        });

        try {
            // API 호출
            await scheduleMessageApi(timestamp, message, fileInfos);

            console.log('Message scheduled successfully');

            // Draft 초기화 (메시지 및 파일 삭제)
            clearDraft();
        } catch (error) {
            console.error('Failed to schedule message:', error);
            alert(`Failed to schedule message: ${error instanceof Error ? error.message : String(error)}`);
        }

        // 모달 닫기
        handleCloseModal();
    };

    /**
     * 리스트 보기 핸들러
     */
    const handleViewList = async () => {
        console.log('Viewing scheduled messages list');

        try {
            // 현재 채널 ID 가져오기
            const channelId = mattermostService.getCurrentChannelId();
            if (!channelId) {
                throw new Error('Could not determine current channel');
            }

            // API 호출 (서버가 ephemeral post로 리스트를 보여줌)
            await scheduleApiClient.getSchedules(channelId);

            console.log('Scheduled messages list requested successfully');
        } catch (error) {
            console.error('Failed to get scheduled messages:', error);
            alert(`Failed to get scheduled messages: ${error instanceof Error ? error.message : String(error)}`);
        }

        // 모달 닫기 (draft는 유지됨)
        setIsModalOpen(false);
    };

    const tooltip = (
        <Tooltip id='schedule-post-button-tooltip'>
            {'Schedule message'}
        </Tooltip>
    );

    return (
        <>
            <div className='schedule-post-wrapper'>
                {/* 구분선 */}
                <div className='separator'/>

                <OverlayTrigger
                    placement='top'
                    overlay={tooltip}
                >
                    {/* ============================================
                        바리에이션 선택:
                        아래 3가지 버튼 중 하나의 주석을 해제하세요
                        ============================================ */}

                    {/* 바리에이션 1: 아이콘만 (기본) */}
                    {/* <button
                        type='button'
                        className='schedule-post-button'
                        onClick={handleClick}
                        aria-label='Schedule message'
                    >
                        <span className='schedule-post-button__icon'>
                            <ScheduleIcon/>
                        </span>
                    </button> */}

                    {/* 바리에이션 2: 아이콘 + 텍스트 */}
                    <button
                        type='button'
                        className='schedule-post-button schedule-post-button--with-text'
                        onClick={handleClick}
                        aria-label='Schedule message'
                    >
                        <span className='schedule-post-button__icon'>
                            <ScheduleIcon/>
                        </span>
                        <span className='schedule-post-button__text'>
                            {'예약'}
                        </span>
                    </button>

                    {/* 바리에이션 3: 아이콘 + 텍스트 + 보더 */}
                    {/* <button
                        type='button'
                        className='schedule-post-button schedule-post-button--with-text schedule-post-button--bordered'
                        onClick={handleClick}
                        aria-label='Schedule message'
                    >
                        <span className='schedule-post-button__icon'>
                            <ScheduleIcon/>
                        </span>
                        <span className='schedule-post-button__text'>
                            {'예약'}
                        </span>
                    </button> */}
                </OverlayTrigger>
            </div>

            {/* 모달 */}
            <ScheduleModal
                isOpen={isModalOpen}
                message={message}
                fileInfos={fileInfos}
                hasUploadsInProgress={hasUploads}
                onClose={handleCloseModal}
                onSchedule={handleSchedule}
                onViewList={handleViewList}
            />
        </>
    );
};

export default SchedulePostButton;
