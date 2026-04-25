ALTER TABLE users 
MODIFY email VARCHAR(100) NULL;

ALTER TABLE marriage_parties 
DROP COLUMN occupation,
DROP COLUMN father_occupation,
DROP COLUMN mother_occupation;

ALTER TABLE marriages 
DROP COLUMN registrar_certification_number;

ALTER TABLE marriage_parties 
DROP COLUMN age;

ALTER TABLE users 
CHANGE residence domicile VARCHAR(150);


ALTER TABLE marriage_parties 
DROP COLUMN father_residence,
DROP COLUMN mother_residence;

UPDATE parishes
SET deanery = 'Nyeri Central Deanery'
WHERE deanery = 'Nyeri Municipality Deanery';


INSERT INTO parishes (parish_name, deanery) VALUES
('Kamakwa Parish', 'Tetu Deanery'),
('Witima Parish', 'Othaya Deanery'),
('Kamatu Parish', 'Karatina Deanery'),
('Giathegu Parish', 'Mukurwe-ini Deanery'),
('St. Teresa Equator', 'Nanyuki Deanery'),


UPDATE parishes
SET parish_name = 'Ithenguri Parish'
WHERE parish_name = 'Itheguri Parish';