/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import * as _ from "lodash";
import { Duration } from "./duration";
import { Key } from "./key";
import { TimeRange } from "./timerange";
import { TimeAlignment } from "./types";

/**
 * Constructs a new `Time` object that can be used as a key for `Event`'s.
 *
 * A `Time` object represents a timestamp, and is stored as a Javascript `Date`
 * object. The difference with just a `Date` is that is conforms to the interface
 * required to be an `Event` key.
 */
export class Time extends Key {
    static isTime(t: Time) {
        return t instanceof Time;
    }

    private _d: Date;

    constructor(d?: number | string | Date) {
        super();
        if (_.isDate(d)) {
            this._d = d;
        } else if (_.isNumber(d)) {
            this._d = new Date(d);
        } else if (_.isString(d)) {
            this._d = new Date(d);
        } else {
            this._d = new Date();
        }
    }

    type() {
        return "time";
    }

    toJSON(): {} {
        return { time: +this._d };
    }

    toString(): string {
        return JSON.stringify(this.toJSON());
    }

    /**
     * Returns the native Date object for this `Time`
     */
    toDate(): Date {
        return this.timestamp();
    }

    /**
     * The timestamp of this data, in UTC time, as a string.
     */
    toUTCString(): string {
        return this.timestamp().toUTCString();
    }

    /**
     * The timestamp of this data, in Local time, as a string.
     */
    toLocalString(): string {
        return this.timestamp().toString();
    }

    /**
     * The timestamp of this data
     */
    timestamp() {
        return this._d;
    }

    valueOf() {
        return +this._d;
    }

    /**
     * The begin time of this `Event`, which will be just the timestamp
     */
    begin() {
        return this.timestamp();
    }

    /**
     * The end time of this `Event`, which will be just the timestamp
     */
    end() {
        return this.timestamp();
    }

    /**
     * Takes this Time and returns a TimeRange of given duration
     * which is either centrally located around the Time, or aligned
     * to either the Begin or End time.
     *
     * For example remapping keys, each one of the keys is a Time, but
     * we want to convert the timeseries to use TimeRanges instead:
     * ```
     * const remapped = series.mapKeys(t => t.toTimeRange(duration("5m"), TimeAlignment.Middle));
     * ```
     *
     * The alignment is either:
     *  * TimeAlignment.Begin
     *  * TimeAlignment.Middle
     *  * TimeAlignment.End
     *
     */
    toTimeRange(duration: Duration, align: TimeAlignment): TimeRange {
        const d = +duration;
        const timestamp = +this.timestamp();
        switch (align) {
            case TimeAlignment.Begin:
                return new TimeRange(timestamp, timestamp + d);
            case TimeAlignment.Middle:
                const half = Math.round(d / 2);
                return new TimeRange(timestamp - half, timestamp + d - half);
            case TimeAlignment.End:
                return new TimeRange(timestamp - d, timestamp);
        }
    }
}

/**
 * Constructs a new `Time` object. A `Time` object represents a timestamp,
 * and is stored as a Javascript `Date` object. The difference with just a Date is that
 * this conforms to the interface required to be an `Event` key.
 */
function timeFactory(d?: number | string | Date): Time {
    return new Time(d);
}

/**
 * Returns the the current time as a `Time` object
 */
function now(): Time {
    return new Time(new Date());
}

export { now, timeFactory as time };
