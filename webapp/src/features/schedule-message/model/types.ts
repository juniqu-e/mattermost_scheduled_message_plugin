// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {FileInfo} from '@/entities/mattermost/model/types';

/**
 * Schedule Message Feature Types
 */

export interface SchedulePostButtonProps {
    onClick?: () => void;
}

export interface ScheduleModalProps {
    isOpen: boolean;
    message: string;
    fileInfos: FileInfo[];
    onClose: () => void;
    onSchedule: (timestamp: number) => void;
    onViewList: () => void;
}

export interface DateTimePickerProps {
    selectedDate: string;
    selectedTime: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
}

// Re-export for convenience
export type {FileInfo};
