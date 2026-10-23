export const legacySessions={
0:{name:'Recovery',kind:'rest',moves:[]},
1:{name:'Upper A — Push',kind:'lift',moves:[['Medicine ball chest pass',3,5,0,'Fast reps; full reset','Power'],['Half-kneeling landmine press',3,8,2,'Control ribs and hips','Strength'],['DB bench press',3,10,2,'Full comfortable range; 1–3 reps in reserve','Muscle'],['Single-arm DB floor press',2,10,2,'Resist rotation','Stability'],['Plate steering wheels',3,12,1,'Control shoulder height; optional','Accessory'],['Plate overhead triceps extension',3,12,1,'Elbows comfortable','Accessory'],['Thoracic rotation and wall slide',2,8,0,'Controlled mobility','Mobility']]},
2:{name:'Lower A — Strength',kind:'lift',moves:[['Box jump',3,3,0,'Low box; stick landing','Power'],['Goblet or front squat',3,8,2,'Full controlled range','Strength'],['Romanian deadlift',3,8,2,'Hinge, neutral trunk','Strength'],['Reverse lunge',3,8,2,'Each leg','Unilateral'],['Calf raise',3,12,1,'Pause at top','Accessory'],['Dead bug',3,8,0,'Each side','Core'],['Ankle rocks and hip 90/90',2,8,0,'Mobility','Mobility']]},
3:{name:'Mobility / recovery',kind:'rest',moves:[]},
4:{name:'Upper B — Pull',kind:'lift',moves:[['Med ball rotational throw',3,5,0,'Each side','Power'],['Pull-up or assisted pull-up',3,8,2,'Use full controlled range','Strength'],['Chest-supported DB row',3,10,2,'Pause at contraction','Muscle'],['Incline push-up or DB incline press',2,10,2,'Second weekly chest stimulus','Muscle'],['Face pull',3,12,1,'Light and controlled','Stability'],['Hammer curl',3,10,1,'No swinging','Accessory'],['Dead hang / scapular control',2,25,0,'Seconds, comfortable hold','Mobility']]},
5:{name:'Lower B — Athletic',kind:'lift',moves:[['Broad jump',3,3,0,'Full reset; quality landings','Power'],['Trap bar deadlift',3,6,2,'Crisp sets; no grinding','Strength'],['Step-up',3,8,2,'Each leg; controlled','Unilateral'],['Hip thrust or glute bridge',3,10,2,'Pause at top','Muscle'],['Farmer carry',3,30,2,'Seconds; strong posture','Carry'],['Side plank',2,30,0,'Seconds each side','Core'],['Hip flexor stretch',2,40,0,'Seconds each side','Mobility']]},
6:{name:'Optional mobility / lift',kind:'optional',moves:[['Easy sled push',4,20,0,'Meters, light','Conditioning'],['Turkish get-up',2,3,1,'Each side; light','Stability'],['Mobility flow',1,15,0,'Minutes','Mobility']]}
};
// The new split applies only to unstarted sessions sourced October 15 onward.
export const PPLPP_START='2026-10-15';
export const sessions={
0:{name:'Active recovery — optional walk + stretching',kind:'rest',moves:[]},
1:{name:'Push A — Strength',kind:'lift',focus:'push',coach:'Chest and pressing strength, explosive upper-body work, and shoulder control. Busy week: prioritize Push A, Pull A, and Legs.',moves:[['Medicine ball chest pass',3,5,0,'Crisp explosive reps; reset fully','Power'],['DB bench press',3,8,2,'Controlled full range; finish before grinding','Strength'],['Half-kneeling landmine press',3,8,2,'Each side; keep ribs and hips controlled','Strength'],['Plate steering wheels',2,12,1,'Light, controlled shoulder work','Accessory'],['Plate overhead triceps extension',2,12,1,'Comfortable elbows; controlled lowering','Accessory'],['Thoracic rotation and wall slide',2,8,0,'Slow shoulder and thoracic mobility','Mobility']]},
2:{name:'Pull A — Pull-up strength',kind:'lift',focus:'pull',coach:'PFT pull-ups first. Start with 4 sets of 2 clean reps; rest about 2 minutes. Use 3–4 only when repeatable with roughly 2 clean reps left. After all sets are controlled, add one rep to one set next time. Build toward your usual April PFT; no weekly max-outs.',moves:[['Pull-up',4,2,2,'Strict dead hang; chin over bar, no kip. Start 2 reps/set; rest 2 minutes. Do not superset. Keep about 2 clean reps left.','Strength'],['Chest-supported DB row',3,8,2,'Pause briefly; keep chest supported','Strength'],['Face pull',2,12,1,'Light, smooth shoulder-blade control','Stability'],['Incline dumbbell curl',2,10,1,'No swing; controlled lower','Accessory'],['Farmer carry',2,30,2,'Seconds; tall posture, controlled grip work','Carry'],['Dead hang / scapular control',2,20,0,'Seconds; comfortable hang, stop before grip failure','Mobility']]},
3:{name:'Legs — Strength + athleticism',kind:'lift',focus:'lower',coach:'One complete leg session: squat, hinge, unilateral strength, calves, and core. Keep jumps crisp and lifting repeatable. Tuesday speed work comes first; Thursday is rest. Keep Wednesday legs controlled and avoid grinding or excessive soreness before Friday speed.',moves:[['Box jump',3,3,0,'Low box; reset and stick each landing','Power'],['Goblet or front squat',3,8,2,'Full comfortable range; controlled reps','Strength'],['Romanian deadlift',3,8,2,'Hinge with a neutral trunk','Strength'],['Reverse lunge',2,8,2,'Each leg; steady balance','Unilateral'],['Calf raise',3,12,1,'Pause briefly at the top','Accessory'],['Dead bug',3,8,0,'Each side; steady trunk and breathing','Core'],['Ankle rocks and hip 90/90',2,8,0,'Controlled ankle and hip mobility','Mobility']]},
4:{name:'Push B — Muscle + control',kind:'optional',focus:'push',coach:'Second upper-body stimulus using different presses and accessories. Incline chest, overhead pressing, lateral delts, and triceps complement Push A. If the week is busy, this is an extra session after the three-day base.',moves:[['Medicine ball rotational throw',2,5,0,'Each side; light, explosive, reset fully','Power'],['Incline dumbbell press',3,10,2,'Comfortable incline; controlled lowering','Muscle'],['Dumbbell overhead press',3,8,2,'Brace; avoid leaning back','Strength'],['Cable lateral raise',2,12,1,'Each side; light and controlled','Accessory'],['Cable rope pressdown',2,12,1,'Keep elbows steady','Accessory'],['Wall slide',2,8,0,'Slow shoulder mobility','Mobility']]},
5:{name:'Pull B — Pull-up volume',kind:'optional',focus:'pull',coach:'PFT practice first: 6 sets of 2 clean pull-ups, with 90–120 seconds between sets. Start lower rather than reaching failure. Add one rep to one set only after every set stays strict. Different rows, rear-delts, curls, and plank work complement Pull A. This is the fifth lift when the week allows.',moves:[['Pull-up',6,2,2,'Strict reps; start 2/set, rest 90–120 seconds. Do not superset. Stop before form breaks.','Strength'],['Seated cable row',3,10,2,'Steady trunk; controlled reach and pull','Muscle'],['Rear-delt fly',2,12,1,'Light, chest supported if possible','Stability'],['Hammer curl',2,10,1,'Neutral wrists; no swing','Accessory'],['Front plank',3,30,0,'Seconds; steady position and normal breathing for PFT practice','Core'],['Thoracic open book',2,8,0,'Each side; comfortable rotation','Mobility']]},
6:{name:'Optional mobility / recovery',kind:'rest',moves:[]}
};
// Thursday and Sunday are full rest in the revised combined schedule.
const cftSessions={...sessions,4:{name:'Rest',kind:'rest',moves:[]},6:{...sessions[4],coach:sessions[4].coach+' Optional only after an easy long run; skip when fatigued.'}};
const returnSessions=Object.fromEntries(Object.entries(cftSessions).map(([day,s])=>[day,{...s,coach:(s.coach||'')+' Reduced return week: two working sets, no jumps, no grinding. Optional upper sessions may be skipped.',moves:s.moves.filter(m=>m[5]!=='Power').map(m=>[m[0],Math.min(m[1],2),...m.slice(2)])}]));
export const sessionsForDate=date=>date<PPLPP_START?legacySessions:date<'2026-10-26'?sessions:date<='2026-11-01'?returnSessions:cftSessions;
// Keep the original source date and ID for previously logged/moved run identity.
export const runDefaultMoves={'2026-10-15':'2026-10-14'};
export const runSpecs={
'2026-10-12':['W1 Easy + 6 Strides',38,'Easy conversational + six relaxed strides','7dxXAFCicjoRRvqTzibPWr'],
'2026-10-15':['W1 8 × 200m Controlled Speed',30,'Fast and smooth, not maximal','kb95rh8M92eXwkFEhocRGT'],
'2026-10-16':['W1 3 × 5 min Threshold',39,'Optional if fatigued','vxUJkv2vKBTi24mGEhvDUt'],
'2026-10-17':['W1 Long Easy 45',45,'Conversational; walk breaks allowed','rV2YgQsSoeAzN5ozpWY1Ee'],
'2026-10-19':['W2 Easy + 6 Strides',43,'Easy and relaxed','eXLZ8yo7QH3HR3yWWUrzbN'],
'2026-10-22':['W2 6 × 300m Speed',32,'Strong and even','395HLbzWiZJ2PdpnAUj1we'],
'2026-10-23':['W2 2 × 8 min Threshold',40,'Optional; protect Saturday run','tMH2fbNqGquuzcUeGRT7ri'],
'2026-10-24':['W2 Long Easy 50',50,'Conversational','e25kcRPTaJztjyKc9gBwJq'],
'2026-10-26':['W3 Easy + 8 Strides',46,'Smooth accelerations','pu9rLrPhLiAz2Fchc2oPQ2'],
'2026-10-29':['W3 6 × 400m CFT Repeats',35,'Repeatable pace','gZR7x6C6toL4Qc76yCsEsv'],
'2026-10-30':['W3 4 × 5 min Threshold',46,'Optional if fatigued','aDviz9CgKx3eUTZopURodr'],
'2026-10-31':['W3 Long Easy 55',55,'Easy; walk breaks allowed','tnu9KeJvS7UT6vUWkYTe3m'],
'2026-11-02':['W4 Easy + 6 Strides',38,'Relaxed strides','fYUx3kc4zqpna26UMZGpFD'],
'2026-11-05':['W4 880-yard Benchmark',22,'Even pacing; avoid unrealistic target','ivUf9TouS6vtmQAQq6FSgv'],
'2026-11-06':['W4 Easy 30',30,'Optional after benchmark','d3K8V4FozSJ57xn4pZb2WD'],
'2026-11-07':['W4 Long Easy 45',45,'Recovery week','mwg2uFDjWzctC3BPa2cBbU'],
'2026-11-09':['W5 Easy + 8 Strides',51,'Smooth','3qx63XbnRFiWPsMkQWjAHJ'],
'2026-11-12':['W5 5 × 600m Speed Endurance',35,'Controlled 600m repeats','nJJQt7gAuDE6psJzk2jKeM'],
'2026-11-13':['W5 3 × 8 min Threshold',51,'Optional','2qwcUh9Erw1kSTJ6dkggUQ'],
'2026-11-14':['W5 Long Easy 60',60,'Conversational','89YuhQncmapYQE1LRTc4jM'],
'2026-11-16':['W6 Easy + 6 Strides',43,'Relaxed','sNDcp41P4XsrptNfrya1Qr'],
'2026-11-19':['W6 Drop Sets',34,'Controlled CFT speed','fvtsabDLBrdmhmFaekXTSx'],
'2026-11-20':['W6 Threshold',44,'Optional','gXqZPoFWTGd1ntQJ77Dpkf'],
'2026-11-21':['W6 Long Easy 55',55,'Easy','pgky4oPoSGoRXFYUvL3tLr'],
'2026-11-23':['W7 Easy + 6 Strides',48,'Relaxed','vXesT4wmgDkAa7D3sDj1Vq'],
'2026-11-26':['W7 Sharpening',35,'Repeatable, not maximal','5abAjnK18ejXWZeQgSA1kZ'],
'2026-11-27':['W7 Threshold',40,'Optional','76DX3icYQYE2Vq98K5JCRB'],
'2026-11-28':['W7 Long Easy 50',50,'Conversational','kvuwkmMEmBKikzfa6rSxvJ'],
'2026-11-30':['W8 Easy + 4 Strides',35,'Relaxed','2fRZScJQBkpe8tq4F3Dw44'],
'2026-12-03':['W8 880-yard Re-test',22,'Even pacing','odJP96gajfEni2y63m4rg9'],
'2026-12-04':['W8 Easy Shakeout',20,'Optional','mTGeFk34cjVHDx9dQnYyHJ'],
'2026-12-05':['W8 Long Easy 40',40,'Conversational','uUThj4AM6JV5FQRNqQfvLV']};

