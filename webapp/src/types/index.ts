// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface SchedulePostButtonProps {
    onClick?: () => void;
}

export interface ScheduleModalProps {
    isOpen: boolean;
    message: string;
    fileInfos: FileInfo[];
    onClose: () => void;
    onSchedule: (timestamp: number) => void;
}

export interface ScheduleModalState {
    selectedDate: string;
    selectedTime: string;
}

export interface DateTimePickerProps {
    selectedDate: string;
    selectedTime: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
}

export interface FileInfo {
    id: string;
    name: string;
    size: number;
    extension: string;
}
