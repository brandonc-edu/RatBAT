/*
INSERT INTO LightCycleColony VALUES
(0, 'Lights ON 7 AM to 7 PM in housing colony');

INSERT INTO LightCycleTest VALUES
(0, 'Tested during subjective night/sleep cycle (lights ON)');

INSERT INTO ArenaType VALUES
(1, '160x160 cm table surface on 60 cm high legs');

INSERT INTO ArenaLoc VALUES
(2, 'OF #2 in room U59_north'),
(1, 'OF #1 in room U59_south'),
(3, 'OF #3 in room U60_south');

INSERT INTO ArenaObjects VALUES
(1, 'an object in OF locales 10 14 5 and 8');

INSERT INTO LightConditions VALUES
(0, 'room ILLUMINATED (fluorescent lights ON)');

INSERT INTO SurgeryManipulation VALUES
(1, 'Sham lesion done'),
(4, 'Nucleus Accumbens Core (NAc) targeted');

INSERT INTO SurgeryOutcome VALUES
(0, 'No lesion present'),
(2, 'Lesion does NOT meet criteria');

INSERT INTO EventType VALUES
(1, 'Standard OF trial');

INSERT INTO Animal VALUES
('Q405HT1001', 0, 0),
('Q405HT1002', 0, 0),
('Q405HT1003', 0, 0);

INSERT INTO Apparatus VALUES
(0, 1, 2, 1, 0),
(1, 1, 1, 1, 0),
(2, 1, 3, 1, 0);

INSERT INTO Treatment VALUES
(0, 1,   0, 'SAL',  0,     'NA', 0, 'NA',  0),
(1, 1,   0, 'mCPP', 0.625, 'NA', 0, 'NA',  0),
(2, 4,   2, 'SAL',  0,     'NA', 0, 'NA',  0);
*/

INSERT INTO Trial VALUES
(0015689, '2012-01-14 08:03:00', 445, 2, 2, 2, 'Vanessa Aversa', 55, 0, 'N/A', 1, 1, 1, 1, 'Q405HT1001', 0, 0),
(0015691, '2012-01-19 08:07:00', 468, 4, 4, 4, 'Vanessa Aversa', 55, 1, 'fell at 2', 1, 1, 1, 1, 'Q405HT1001', 0, 0),
(0015697, '2012-02-08 07:29:00', 510, 10, 10, 10, 'Vanessa Aversa', 55, 0, 'N/A', 1, 1, 1, 1, 'Q405HT1001', 0, 0),
(0015703, '2012-01-30 10:11:00', 418, 6, 6, 2, 'Kester Ng', 55, 0, 'cart at 8', 1, 1, 1, 1, 'Q405HT1002', 1, 1),
(0015708, '2012-01-12 09:15:00', 363, 1, 1, 1, 'Amanda Toufeili', 55, 0, 'boards maybe on opposite tables', 1, 1, 1, 1, 'Q405HT1003', 2, 2);

INSERT INTO Video VALUES
('Q405HT1_of2_inj02_20120114_001_042_008_045.mpg',  0015689),
('Q405HT1_of2_inj04_20120119_001_042_008_045.mpg',  0015691),
('Q405HT1_of2_inj10_20120208_001_042_008_045.mpg',  0015697),
('Q405HT1_of1_inj06_20120130_016_041_002_044.mpg',  0015703),
('Q405HT1_of3_inj01_20120112_046_003_012.mpg',      0015708);

INSERT INTO Fall VALUES
(0015691, 53);

INSERT INTO Experiment VALUES
(51,  0015689),
(51,  0015691),
(51,  0015697),
(51,  0015703),
(51,  0015708);

INSERT INTO Study VALUES
('Q40', 51);

INSERT INTO Project VALUES
(12, 'Resynthesis of compulsive checking');

INSERT INTO ProjectGroup VALUES
(12, 'Q40');
