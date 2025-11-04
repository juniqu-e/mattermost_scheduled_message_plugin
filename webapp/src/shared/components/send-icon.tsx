// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

interface IconProps {
    size?: number | string;
    color?: string;
    className?: string;
}

/**
 * SendIcon Component
 * Mattermost의 @mattermost/compass-icons/components의 SendIcon과 동일한 SVG
 */
export const SendIcon: React.FC<IconProps> = ({size = '1em', color = 'currentColor', className, ...rest}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            width={size}
            height={size}
            fill={color}
            viewBox="0 0 24 24"
            className={className}
            {...rest}
        >
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
        </svg>
    );
};

export default SendIcon;
