// Copyright (c) 2015-2017 Robert Rypuła - https://audio-network.rypula.pl
'use strict';

var Segment = (function () { // <-- TODO this will be soon refactored when code will be moved to the main NPM package
    var Segment;

    Segment = function (synchronizeFlag, sequenceNumber, acknowledgementFlag, acknowledgementNumber, payload) {
        this.$$synchronizeFlag = !!synchronizeFlag;
        this.$$sequenceNumber = sequenceNumber & 0x7f;
        this.$$acknowledgementFlag = !!acknowledgementFlag;
        this.$$acknowledgementNumber = acknowledgementNumber & 0x7f;
        this.$$payload = payload.slice(0);

        this.$$rxFrameId = null;      // probably we can have only one property for frame ID
        this.$$txFrameId = null;
        this.$$txCompleted = false;
        this.$$txSymbolId = null;
    };

    Segment.HEADER_BYTE_LENGTH = 2;
    Segment.NOT_ENOUGH_BYTES_TO_CREATE_SEGMENT_EXCEPTION = 'Not enough bytes to create segment';

    Segment.prototype.txCompleted = function () {
        this.$$txCompleted = true;
    };
    Segment.prototype.setRxFrameId = function (rxFrameId) {
        this.$$rxFrameId = rxFrameId;
    };

    Segment.prototype.setTxFrameId = function (txFrameId) {
        this.$$txFrameId = txFrameId;
    };

    Segment.prototype.setTxSymbolId = function (txSymbolId) {
        this.$$txSymbolId = txSymbolId;
    };

    Segment.prototype.getPayload = function () {
        return this.$$payload;
    };

    Segment.prototype.getTxSymbolId = function () {
        return this.$$txSymbolId;
    };

    Segment.prototype.getTxConfirmed = function () {
        return this.$$txCompleted;
    };

    Segment.prototype.getTxFrameId = function () {
        return this.$$txFrameId;
    };

    Segment.prototype.getTxFramePayload = function () {
        var
            txFramePayload = [],
            headerByteA,
            headerByteB,
            i;

        headerByteA = (this.$$synchronizeFlag ? 0x80 : 0x00) | this.$$sequenceNumber;
        txFramePayload.push(headerByteA);
        headerByteB = (this.$$acknowledgementFlag ? 0x80 : 0x00) | this.$$acknowledgementNumber;
        txFramePayload.push(headerByteB);

        for (i = 0; i < this.$$payload.length; i++) {
            txFramePayload.push(this.$$payload[i]);
        }

        return txFramePayload;
    };

    Segment.fromRxFramePayload = function (rxFramePayload) {
        var
            synchronizeFlag,
            sequenceNumber,
            acknowledgementFlag,
            acknowledgementNumber,
            payload = [],
            i;

        if (rxFramePayload.length < Segment.HEADER_BYTE_LENGTH) {
            return null;
            // throw Segment.NOT_ENOUGH_BYTES_TO_CREATE_SEGMENT_EXCEPTION;
        }

        synchronizeFlag = !!(rxFramePayload[0] & 0x80);
        sequenceNumber = rxFramePayload[0] & 0x7f;
        acknowledgementFlag = !!(rxFramePayload[1] & 0x80);
        acknowledgementNumber = rxFramePayload[1] & 0x7f;

        for (i = 2; i < rxFramePayload.length; i++) {
            payload.push(rxFramePayload[i]);
        }

        return new Segment(
            synchronizeFlag,
            sequenceNumber,
            acknowledgementFlag,
            acknowledgementNumber,
            payload
        );
    };

    return Segment;
})();
