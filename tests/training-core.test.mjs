import test from 'node:test';
import assert from 'node:assert/strict';
import {trainingWeek,phaseForWeek,prescribe,liftSummary,runSummary,dedupeByDateId,validateBackup} from '../training-core.mjs';
test('week boundaries start October 12',()=>{assert.equal(trainingWeek('2026-10-12'),1);assert.equal(trainingWeek('2026-10-19'),2);assert.equal(trainingWeek('2026-12-28'),12)});
test('every fourth week lowers programming volume',()=>{assert.equal(phaseForWeek(4).factor,.65);assert.equal(phaseForWeek(8).factor,.65);assert.equal(phaseForWeek(12).factor,.65);assert.equal(phaseForWeek(3).factor,1)});
const entry=(date,sets,finished=true)=>({date,finished,exercises:[{name:'DB bench press',sets}]});
test('progression requires repeatable target reps and safe RIR',()=>{
const old=[entry('2026-10-12',[{weight:40,reps:10,rir:2,done:true},{weight:40,reps:10,rir:2,done:true}])];
assert.equal(prescribe({name:'DB bench press',sets:[{reps:10}]},old,'2026-10-19').load,42.5);
});
test('no load bump if prior sets too hard or incomplete',()=>{
const old=[entry('2026-10-12',[{weight:40,reps:10,rir:0,done:true},{weight:40,reps:8,rir:1,done:true}])];
assert.equal(prescribe({name:'DB bench press',sets:[{reps:10}]},old,'2026-10-19').load,40);
});
test('future or unfinished sessions cannot drive prescriptions',()=>{
const old=[entry('2026-10-20',[{weight:80,reps:10,rir:2,done:true}]),entry('2026-10-12',[{weight:70,reps:10,rir:2,done:true}],false)];
assert.equal(prescribe({name:'DB bench press',sets:[{reps:10}]},old,'2026-10-19').load,null);
});
test('strength totals ignore draft workouts',()=>{
const old=[entry('2026-10-12',[{weight:40,reps:10,rir:2,done:true}]),entry('2026-10-13',[{weight:50,reps:10,rir:2,done:true}],false)];
assert.equal(liftSummary(old).sets,1);
});
test('running pace aggregates weighted by actual distance',()=>{
const r=runSummary([{distance:2,minutes:20,seconds:0},{distance:3,minutes:24,seconds:0}]);
assert.equal(r.miles,5);assert.equal(r.averagePaceSeconds,528);
});
test('dedupe records newest update only',()=>{
const r=dedupeByDateId([{id:'a',updated:'2026-10-12T00:00Z'},{id:'a',updated:'2026-10-13T00:00Z'}]);assert.equal(r.length,1);assert.equal(r[0].updated,'2026-10-13T00:00Z');
});
test('reject malformed backups',()=>{assert.equal(validateBackup({schema:2,lifts:[],runs:[],mobility:[]}),true);assert.equal(validateBackup({schema:2,lifts:{},runs:[]}),false)});
