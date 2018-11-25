import { Pool, QueryResult } from 'pg';
import { from, Observable } from 'rxjs';
import { forkJoin } from 'rxjs/operators';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';

import * as Uuid from 'uuid/v4';

import { AlreadyExistsError, NotFoundError } from '../common';
import { executeTransaction, handlePostgresError } from '../util/postgres';
import { Record } from '../util/telemetry';

interface Poem {
    title: string;
    words: string[];
}

namespace Poem {
    export interface Row {
        poemId: Uuid;
        title: string;
    }
}

interface Word {
    source: string;
    target: string;
    count: number;
}

export class PoemDatastore {

    public clientPool: Pool;

    constructor(clientPool: Pool) {
        this.clientPool = clientPool;
    }
    // queries on page load
    // getWords(100) (get 100 most common words)
    // getWordDecendents() for each word
    // getWordAncestors() for each word
    // oof

    /** Get words based on number of poems it is in */
    public getWords() {
    }

    public getWordDecendents() {
    }

    public getWordAncestors() {
    }
    /** Get peom details and words in the poem */
    public getPoem() {
    }

    @Record
    public insertPoem(poem: Poem) {
        const poemId = Uuid();
        const poemQuery = `INSERT INTO poems (poemid, title) VALUES ($1, $2)`;
        
        // map words to (taretWord, sourceWord, count)
        const wordQueryData = poem.words.reduce((result, word, index) => {
            if(index === poem.words.length - 1) {
                return result;
            }
            const paramIndex = index*3 + 1;
            result.params.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex+2})`);
            result.values.push([word, poem.words[index + 1], 0]);
            return result;
        }, {params: [] as string[], values: [] as [string, string, number][] });
        const wordQuery = `INSERT INTO words (source, target, count) VALUES ${wordQueryData.params.join(', ')}
                            ON DUPLICATE KEY UPDATE count = count + 1`;

        // const poemsWordsQuery = `INSERT INTO poems_words (poemid, word, position) VALUES ${`

        const queries = [
            { query: poemQuery, params: [poemId, poem.title] }
            { query: wordQuery, params: wordQueryData.values }
        ];
        if(cursorRecording.frames.length > 0) {
            queries.push({ query: framesQuery, params: [cursorRecording.id, ...frameValues] });
        }
        return executeTransaction(this.clientPool, queries
        ).map((results: Array<QueryResult | undefined>) => {
            // TODO: return DB results
            return cursorRecording;
        }).catch((err: Error) => {
            // TODO: actual error handling
            if(err.message === 'already exists') {
                return Observable.throw(new AlreadyExistsError(`Cursor recording with id '${cursorRecording.id}' already exists`)) as Observable<CursorRecording>;
            }
            return Observable.throw(err) as Observable<CursorRecording>;
        }).catch(handlePostgresError<CursorRecording>('insertCursorRecording', [recordingQuery, framesQuery].join('\n')));
    }

    @Record()
    public getCursorRecordings(roomId: Room.Id, limit: number) {
        const cursorRecordingsQuery =
            `SELECT *
            FROM cursorrecordings
            WHERE roomid = $1
            ORDER BY created_at DESC
            LIMIT ${limit > 0 ? '$2' : 'ALL'};`;
        const framesQuery =
            `SELECT *
            FROM cursorrecordingframes
            WHERE cursorrecordingid = ANY($1)
            ORDER BY cursorrecordingid, t ASC;`;
        return Observable.fromPromise(this.clientPool.query(
            cursorRecordingsQuery,
            (limit > 0 ? [roomId, limit] : [roomId]),
        )).mergeMap((result: QueryResult) => {
            const recordingIds = result.rows.map((row) => row.cursorrecordingid);
            return Observable.forkJoin(
                Observable.fromPromise(this.clientPool.query(
                    framesQuery,
                    [recordingIds])),
                Observable.of(result));
        }).map(([framesResult, recordingsResult]) => {
            const cursorFrames = framesResult.rows.reduce((frames, row) => {
                let recording = frames.get(row.cursorrecordingid);
                if(!recording) {
                    recording = [];
                }
                // query should have returned frames ordered by t
                recording.push({
                    pos: row.pos,
                    t: row.t,
                });
                frames.set(row.cursorrecordingid, recording);
                return frames;
            }, new Map<CursorRecording.Id, CursorRecordingFrame>());

            return recordingsResult.rows.reduce((recordings, row) => {
                const cursorRecording = new CursorRecording({
                    activeUserId: row.activeuserid,
                    frames: cursorFrames.get(row.cursorrecordingid) || [],
                    id: row.cursorrecordingid,
                });

                recordings.set(cursorRecording.id, cursorRecording);
                return recordings;
            }, new Map<CursorRecording.Id, CursorRecording>());
        }).catch(handlePostgresError<Map<CursorRecording.Id, CursorRecording>>('getCursorRecordings', [cursorRecordingsQuery, framesQuery].join('\n')));
    }

    @Record()
    public insertCursorRecording(roomId: Room.Id, cursorRecording: CursorRecording) {
        const recordingQuery =
            `INSERT INTO cursorrecordings (cursorrecordingid, activeuserid, roomid) VALUES ($1, $2, $3)`;

        const frameQueryParams = cursorRecording.frames.map((frame, index) => {
            const paramIndex = index*2 + 2;
            return `($1, $${paramIndex}, $${paramIndex + 1})`;
        });
        const framesQuery =
            `INSERT INTO cursorrecordingframes (cursorrecordingid, pos, t) VALUES ${frameQueryParams.join(', ')} RETURNING *;`;
        const frameValues = cursorRecording.frames.reduce((flatFrames, frame) => {
            flatFrames.push(`(${frame.pos.x},${frame.pos.y})`);
            flatFrames.push(frame.t);
            return flatFrames;
        }, [] as any[]);

        const queries = [{ query: recordingQuery, params: [cursorRecording.id, cursorRecording.activeUserId, roomId] }];
        if(cursorRecording.frames.length > 0) {
            queries.push({ query: framesQuery, params: [cursorRecording.id, ...frameValues] });
        }
        return executeTransaction(this.clientPool, queries
        ).map((results: Array<QueryResult | undefined>) => {
            // TODO: return DB results
            return cursorRecording;
        }).catch((err: Error) => {
            // TODO: actual error handling
            if(err.message === 'already exists') {
                return Observable.throw(new AlreadyExistsError(`Cursor recording with id '${cursorRecording.id}' already exists`)) as Observable<CursorRecording>;
            }
            return Observable.throw(err) as Observable<CursorRecording>;
        }).catch(handlePostgresError<CursorRecording>('insertCursorRecording', [recordingQuery, framesQuery].join('\n')));
    }
}
