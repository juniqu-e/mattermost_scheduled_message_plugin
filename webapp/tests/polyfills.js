// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Polyfill for Web APIs (required by undici/fetch and jest-dom)
// This must be loaded before any modules that use these APIs

const {TextEncoder, TextDecoder} = require('util');

// TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

// Streams API
if (typeof global.ReadableStream === 'undefined') {
    global.ReadableStream = class ReadableStream {};
}

if (typeof global.WritableStream === 'undefined') {
    global.WritableStream = class WritableStream {};
}

if (typeof global.TransformStream === 'undefined') {
    global.TransformStream = class TransformStream {};
}
