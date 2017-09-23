// tslint:disable:interface-name
// tslint:disable:quotemark
// tslint:disable:no-empty-interface
// tslint:disable:no-namespace
// Type definitions for RethinkDB 2.3
// Project: http://rethinkdb.com/
// Definitions by: Alex Gorbatchev <https://github.com/alexgorbatchev>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
//
// Reference: https://rethinkdb.com/api/javascript/
//
// Notes:
//   - Currently missing control structures and geospatial commands. Please help out!
//
// Testing:
//   $ tsc --noImplicitAny --module commonjs -p rethinkdb/

/// <reference types="node"/>

import { Socket as NetSocket } from "net";
import { ConnectionOptions as TLSConnectionOptions, TLSSocket } from "tls";

/**
 * https://rethinkdb.com/api/javascript/
 */
declare namespace RethinkDBDash {

    /**
     * Create a new connection to the database server.
     *
     * See: https://rethinkdb.com/api/javascript/connect/
     */
    export function connect(
      opts: ConnectionOptions, cb: (err: ReqlDriverError, conn: Connection) => void,
    ): void;
    export function connect(cb: (err: ReqlDriverError, conn: Connection) => void): void;
    export function connect(opts: ConnectionOptions): Promise<Connection>;

    export function dbCreate(name: string): Operation<CreateResult>;
    export function dbDrop(name: string): Operation<DropResult>;
    export function dbList(): Operation<string[]>;

    export function db(name: string): Db;
    export function table(name: string, options?: { useOutdated: boolean }): Table;

    export function asc(property: string): Sort;
    export function desc(property: string): Sort;

    export let count: Aggregator;
    export function sum(prop: string): Aggregator;
    export function avg(prop: string): Aggregator;

    export const row: Row;
    export function expr(stuff: any): Expression<any>;

    export function now(): Expression<Time>;

    // Control Structures
    export function branch(
      test: Expression<boolean>, trueBranch: Expression<any>, falseBranch: Expression<any>,
    ): Expression<any>;

    /**
     * Create a javascript expression.
     *
     * @param {Number} timeout - The number of seconds before `r.js` times out. The default value is `5` seconds.
     */
    export function js(jsString: string, opts?: { timeout: number }): Operation<any>;

    /**
     * Return a UUID (universally unique identifier), a string that can be used as a unique ID.
     * If a string is passed to uuid as an argument, the UUID will be deterministic, derived from the
     * string’s SHA-1 hash.
     *
     * RethinkDB’s UUIDs are standards-compliant. Without the optional argument, a version 4 random UUID
     * will be generated; with that argument, a version 5 UUID will be generated, using a fixed namespace
     * UUID of 91461c99-f89d-49d2-af96-d8e2e14e9b58.
     */
    export function uuid(input?: string): Operation<string>;

    export class Cursor {
        public hasNext(): boolean;
        public each(
          cb: (err: Error, row: any) => void | boolean, done?: () => void,
        ): void; // returning false stops iteration
        public each<T>(
          cb: (err: Error, row: T) => void | boolean, done?: () => void,
        ): void; // returning false stops iteration
        public next(cb: (err: Error, row: any) => void): void;
        public next<T>(cb: (err: Error, row: T) => void): void;
        public toArray(cb: (err: Error, rows: any[]) => void): void;
        public toArray<T>(cb: (err: Error, rows: T[]) => void): void;
        public toArray(): Promise<any[]>;
        public toArray<T>(): Promise<T[]>;
        public close(cb: (err: Error) => void): void;
        public close(): Promise<void>;
    }

    interface Row extends Expression<any> {
        (name: string): Expression<any>;
    }

    /**
     * Connection options.
     *
     * See: https://rethinkdb.com/api/javascript/connect/
     */
    interface ConnectionOptions {
        /** The host to connect to (default `localhost`) */
        host?: string;

        /** The port to connect on (default `28015`) */
        port?: number;

        /** The default database (default `test`) */
        db?: string;

        /** The user account to connect as (default `admin`) */
        user?: string;

        /** The password for the user account to connect as (default `''`, empty) */
        password?: string;

        /** An auth key */
        authKey?: string;

        /** Timeout period in seconds for the connection to be opened (default `20`) */
        timeout?: number;

        /** Period in seconds for the connection to be pinged */
        pingInterval?: number;

        /** An optional connection to use instead */
        connection?: TLSSocket | NetSocket;

        /**
         * A hash of options to support SSL connections (default `null`). Currently,
         * there is only one option available, and if the `ssl` option is specified,
         * this key is required.
         */
        ssl?: boolean | TLSConnectionOptions;
    }

    interface NoReplyWait {
        noreplyWait: boolean;
    }

    interface Connection {
        open: boolean;

        close(cb: (err: Error) => void): void;
        close(opts: NoReplyWait, cb: (err: Error) => void): void;
        close(opts: NoReplyWait): Promise<void>;

        reconnect(cb: (err: Error, conn: Connection) => void): void;
        reconnect(opts: NoReplyWait, cb: (err: Error, conn: Connection) => void): void;
        reconnect(opts?: NoReplyWait): Promise<Connection>;

        use(dbName: string): void;
        addListener(event: string, cb: (...args: any[]) => any): void;
        on(event: string, cb: (...args: any[]) => any): void;
    }

    interface Db {
        tableCreate(name: string, options?: TableOptions): Operation<CreateResult>;
        tableDrop(name: string): Operation<DropResult>;
        tableList(): Operation<string[]>;
        table(name: string, options?: GetTableOptions): Table;
    }

    interface TableOptions {
        primary_key?: string; // 'id'
        durability?: string; // 'soft'
        cache_size?: number;
        datacenter?: string;
    }

    interface GetTableOptions {
        useOutdated: boolean;
    }

    interface Writeable {
        update(obj: object, options?: UpdateOptions): Operation<WriteResult>;
        replace(obj: object, options?: UpdateOptions): Operation<WriteResult>;
        replace(expr: ExpressionFunction<any>): Operation<WriteResult>;
        delete(options?: UpdateOptions): Operation<WriteResult>;
    }

    /**
     * See: https://rethinkdb.com/api/javascript/changes/
     */
    interface ChangesOptions {
        /**
         * Controls how change notifications are batched. Acceptable values are `true`, `false` and a numeric value:
         *
         *   * `true`: When multiple changes to the same document occur before a batch of notifications is
         * sent, the changes are “squashed” into one change. The client receives a notification that will
         * bring it fully up to date with the server.
         *   * `false`: All changes will be sent to the client verbatim. This is the default.
         *   * `n`: A numeric value (floating point). Similar to `true`, but the server will wait `n`
         * seconds to respond in order to squash as many changes together as possible, reducing network
         * traffic. The first batch will always be returned immediately.
         */
        squash: boolean | number;

        /**
         * The number of changes the server will buffer between client reads before it starts dropping
         * changes and generates an error (default: 100,000).
         */
        changefeedQueueSize: number;

        /**
         * If `true`, the changefeed stream will begin with the current contents of the table or selection
         * being monitored. These initial results will have `new_val` fields, but no `old_val` fields. The
         * initial results may be intermixed with actual changes, as long as an initial result for the
         * changed document has already been given. If an initial result for a document has been sent and a
         * change is made to that document that would move it to the unsent part of the result set (e.g.,
         * a changefeed monitors the top 100 posters, the first 50 have been sent, and poster 48 has become
         * poster 52), an “uninitial” notification will be sent, with an `old_val` field but no `new_val`
         * field.
         */
        includeInitial: boolean;

        /**
         * If `true`, the changefeed stream will include special status documents consisting of the field
         * `state` and a string indicating a change in the feed’s state. These documents can occur at any
         * point in the feed between the notification documents described below. If `includeStates` is
         * `false` (the default), the status documents will not be sent.
         */
        includeStates: boolean;

        /**
         * If `true`, a changefeed stream on an `orderBy.limit` changefeed will include `old_offset` and
         * `new_offset` fields in status documents that include `old_val` and `new_val`. This allows
         * applications to maintain ordered lists of the stream’s result set. If `old_offset` is set and not
         * `null`, the element at `old_offset` is being deleted; if `new_offset` is set and not `null`, then
         * `new_val` is being inserted at `new_offset`. Setting `includeOffsets` to `true` on a changefeed
         * that does not support it will raise an error.
         */
        includeOffsets: boolean;

        /**
         * If `true`, every result on a changefeed will include a `type` field with a string that indicates
         * the kind of change the result represents: `add`, `remove`, `change`, `initial`, `uninitial`,
         * `state`. Defaults to `false`.
         */
        includeTypes: boolean;
    }

    interface HasFields<T> {
        /**
         * Test if an object has one or more fields. An object has a field if it has that key and the key has
         * a non-null value.
         *
         * `hasFields` lets you test for nested fields in objects. If the value of a field is itself a set of
         * key/value pairs, you can test for the presence of specific keys.
         *
         * See: https://rethinkdb.com/api/javascript/has_fields/
         */
        hasFields(selector: BooleanMap): T;

        /**
         * Test if an object has one or more fields. An object has a field if it has that key and the key has
         * a non-null value. For instance, the object `{'a': 1,'b': 2,'c': null}` has the fields `a` and `b`.
         *
         * When applied to a single object, `hasFields` returns `true` if the object has the fields and
         * `false` if it does not. When applied to a sequence, it will return a new sequence (an array or
         * stream) containing the elements that have the specified fields.
         *
         * See: https://rethinkdb.com/api/javascript/has_fields/
         */
        hasFields(...fields: string[]): T;
    }

    interface Table extends Sequence, HasFields<Sequence> {
        indexCreate(name: string, index?: ExpressionFunction<any>): Operation<CreateResult>;
        indexDrop(name: string): Operation<DropResult>;
        indexList(): Operation<string[]>;

        insert(obj: any[] | any, options?: InsertOptions): Operation<WriteResult>;

        get(key: string): Sequence; // primary key
        getAll(key: string, index?: Index): Sequence; // without index defaults to primary key
        getAll(...keys: string[]): Sequence;
    }

    interface Sequence extends Operation<Cursor>, Writeable {
        between(lower: any, upper: any, index?: Index): Sequence;

        filter(
          rqlOrObj: ExpressionFunction<boolean> | Expression<boolean> | { [key: string]: any },
        ): Sequence;

        /**
         * Turn a query into a changefeed, an infinite stream of objects representing
         * changes to the query’s results as they occur. A changefeed may return changes
         * to a table or an individual document (a “point” changefeed). Commands such as
         * filter or `map` may be used before the changes command to transform or filter
         * the output, and many commands that operate on sequences can be chained after
         * `changes`.
         *
         * See: https://rethinkdb.com/api/javascript/changes/
         */
        changes(opts?: ChangesOptions): Sequence;

        // Join
        // these return left, right
        innerJoin(sequence: Sequence, join: JoinFunction<boolean>): Sequence;
        outerJoin(sequence: Sequence, join: JoinFunction<boolean>): Sequence;
        eqJoin(
          leftAttribute: string | ExpressionFunction<any>, rightSequence: Sequence, index?: Index,
        ): Sequence;
        zip(): Sequence;

        // Transform
        map(transform: ExpressionFunction<any>): Sequence;
        withFields(...selectors: any[]): Sequence;
        concatMap(transform: ExpressionFunction<any>): Sequence;
        orderBy(...keys: string[]): Sequence;
        orderBy(...sorts: Sort[]): Sequence;
        skip(n: number): Sequence;
        limit(n: number): Sequence;
        slice(start: number, end?: number): Sequence;
        nth(n: number): Expression<any>;
        indexesOf(obj: any): Sequence;
        isEmpty(): Expression<boolean>;
        union(sequence: Sequence): Sequence;
        sample(n: number): Sequence;

        // Aggregate
        reduce(r: ReduceFunction<any>, base?: any): Expression<any>;
        count(): Expression<number>;
        distinct(): Sequence;
        groupedMapReduce(
          group: ExpressionFunction<any>, map: ExpressionFunction<any>, reduce: ReduceFunction<any>,
          base?: any): Sequence;
        groupBy(...aggregators: Aggregator[]): Expression<object>; // TODO: reduction object
        contains(prop: string): Expression<boolean>;

        // Manipulation
        pluck(...props: string[]): Sequence;
        without(...props: string[]): Sequence;
    }

    type ExpressionFunction<U> = (doc: Expression<any>) => Expression<U>;

    type JoinFunction<U> = (left: Expression<any>, right: Expression<any>) => Expression<U>;

    type ReduceFunction<U> = (acc: Expression<any>, val: Expression<any>) => Expression<U>;

    interface InsertOptions {
        conflict?: 'error' | 'replace' | 'update' | ((id: string, oldDoc: any, newDoc: any) => any);
        durability?: 'hard' | 'soft';
        returnChanges?: boolean | 'always';
    }

    interface UpdateOptions {
        nonAtomic?: boolean;
        durability?: 'hard' | 'soft';
        returnChanges?: boolean;
    }

    interface WriteResult {
        inserted: number;
        replaced: number;
        unchanged: number;
        errors: number;
        deleted: number;
        skipped: number;
        first_error: Error;
        generated_keys: string[]; // only for insert
    }

    interface JoinResult {
        left: any;
        right: any;
    }

    interface CreateResult {
        created: number;
    }

    interface DropResult {
        dropped: number;
    }

    interface Index {
        index: string;
        left_bound?: string; // 'closed'
        right_bound?: string; // 'open'
    }

    interface BooleanMap {
        [key: string]: boolean | BooleanMap;
    }

    interface Expression<T> extends Writeable, Operation<T>, HasFields<Expression<number>> {
        (prop: string): Expression<any>;
        merge(query: Expression<object>): Expression<object>;
        append(prop: string): Expression<object>;
        prepend(prop: string): Expression<object>;
        contains(prop: string): Expression<boolean>;

        and(b: boolean | Expression<boolean>): Expression<boolean>;
        or(b: boolean | Expression<boolean>): Expression<boolean>;
        eq(v: any | Expression<any>): Expression<boolean>;
        ne(v: any | Expression<any>): Expression<boolean>;
        not(): Expression<boolean>;

        gt(value: T): Expression<boolean>;
        ge(value: T): Expression<boolean>;
        lt(value: T): Expression<boolean>;
        le(value: T): Expression<boolean>;

        add(n: number): Expression<number>;

        /**
         * Subtract two numbers.
         *
         * See: https://rethinkdb.com/api/javascript/sub/
         *
         * Example:
         *
         *     r.expr(2).sub(2).run(conn, callback)
         */
        sub(n: number, ...numbers: number[]): Expression<number>;

        /**
         * Retrieve how many seconds elapsed between today and `date`.
         *
         * See: https://rethinkdb.com/api/javascript/sub/
         *
         * Example:
         *
         *     r.now().sub(365 * 24 * 60 * 60)
         */
        sub(date: Time): Expression<number>;

        mul(n: number): Expression<number>;
        div(n: number): Expression<number>;
        mod(n: number): Expression<number>;

        default(value: T): Expression<T>;
    }

    interface OperationOptions {
        /**
         * One of three possible values affecting the consistency guarantee for the query (default: 'single').
         *
         *   * 'single' (the default) returns values that are in memory (but not necessarily written to disk)
         * on the primary replica.
         *   * 'majority' will only return values that are safely committed on disk on a majority of
         * replicas. This requires sending a message to every replica on each read, so it is the slowest but
         * most consistent.
         *   * 'outdated' will return values that are in memory on an arbitrarily-selected replica. This is
         * the fastest but least consistent.
         */
        readMode: "single" | "majority" | "outdated";

        /**
         * What format to return times in (default: 'native'). Set this to 'raw' if you want times returned
         * as JSON objects for exporting.
         */
        timeFormat: "native" | "raw";

        /**
         * Whether or not to return a profile of the query’s execution (default: false).
         */
        profile: boolean;

        /**
         * Possible values are 'hard' and 'soft'. In soft durability mode RethinkDB will acknowledge the
         * write immediately after receiving it, but before the write has been committed to disk.
         */
        durability: "hard" | "soft";

        /**
         * What format to return `grouped_data` and `grouped_streams` in (default: 'native'). Set this to
         * 'raw' if you want the raw pseudotype.
         */
        groupFormat: "native" | "raw";

        /**
         * Set to `true` to not receive the result object or cursor and return immediately.
         */
        noreply: boolean;

        /**
         * The database to run this query against as a string. The default is the database specified in the
         * db parameter to connect (which defaults to test). The database may also be specified with the db command.
         */
        db: string;

        /**
         * The maximum numbers of array elements that can be returned by a query (default: 100,000). This
         * affects all ReQL commands that return arrays. Note that it has no effect on the size of arrays
         * being written to the database; those always have an upper limit of 100,000 elements.
         */
        arrayLimit: number;

        /**
         * What format to return binary data in (default: 'native'). Set this to 'raw' if you want the raw
         * pseudotype.
         */
        binaryFormat: "native" | "raw";

        /**
         * Minimum number of rows to wait for before batching a result set (default: 8). This is an integer.
         */
        minBatchRows: number;

        /**
         * Maximum number of rows to wait for before batching a result set (default: unlimited). This is an
         * integer.
         */
        maxBatchRows: number;

        /**
         * Maximum number of bytes to wait for before batching a result set (default: 1MB). This is an
         * integer.
         */
        maxBatchBytes: number;

        /**
         * Maximum number of seconds to wait before batching a result set (default: 0.5). This is a float
         * (not an integer) and may be specified to the microsecond.
         */
        maxBatchSeconds: number;

        /**
         * Factor to scale the other parameters down by on the first batch (default: 4). For example, with
         * this set to 8 and maxBatchRows set to 80, on the first batch maxBatchRows will be adjusted to 10
         * (80 / 8). This allows the first batch to return faster.
         */
        firstBatchScaledownFactor: number;
    }

    interface Operation<T> {
        /**
         * Run a query on a connection. The callback will get either an error, a single JSON result, or a
         * cursor/an array, depending on the query.
         *
         * See: https://rethinkdb.com/api/javascript/run/
         */
        run(conn?: Connection, opts?: OperationOptions, cb?: (err: Error, result: T) => void): void;
        run(conn?: Connection, cb?: (err: Error, result: T) => void): void;
        run(conn?: Connection, opts?: OperationOptions): Promise<T>;
    }

    interface Aggregator { }

    interface Sort { }

    interface ReqlType {
        $reql_type$: string;
    }

    interface Time extends ReqlType {
        $reql_type$: "TIME";
        epoch_time: number;
        timezone: string;
    }

    interface Binary extends ReqlType {
        $reql_type$: "BINARY";
        data: string;
    }

    interface ReqlError extends Error { }

    /**
     * An error has occurred within the driver. This may be a driver bug, or it may
     * be an unfulfillable command, such as an unserializable query.
     *
     * See https://www.rethinkdb.com/docs/error-types/
     */
    interface ReqlDriverError extends ReqlError { }
}
