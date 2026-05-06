-- Active: 1775724267059@@127.0.0.1@3306
ALTER TABLE users 
MODIFY email VARCHAR(100) NULL;

ALTER TABLE users
CHANGE residence domicile VARCHAR(150);

ALTER TABLE marriages 
DROP COLUMN marriage_entry_number,
DROP COLUMN special_license_number,
DROP COLUMN registrar_certification_number,
DROP COLUMN private_parties_count,
DROP COLUMN private_parties_names;

ALTER TABLE marriages
-- Witness 1
ADD COLUMN witness1_name VARCHAR(100) AFTER conducted_by,
ADD COLUMN witness1_son_of VARCHAR(100) AFTER witness1_name,
ADD COLUMN witness1_clan VARCHAR(100) AFTER witness1_son_of,
-- Witness 2
ADD COLUMN witness2_name VARCHAR(100) AFTER witness1_clan,
ADD COLUMN witness2_son_of VARCHAR(100) AFTER witness2_name,
ADD COLUMN witness2_clan VARCHAR(100) AFTER witness2_son_of;

ALTER TABLE marriages
CHANGE certificate_number civil_marriage_certificate_number VARCHAR(50);

ALTER TABLE marriage_parties 
CHANGE residence_address domicile VARCHAR(150);

ALTER TABLE marriage_parties
DROP COLUMN age,
DROP COLUMN occupation,
DROP COLUMN father_residence,
DROP COLUMN mother_residence,
DROP COLUMN father_occupation,
DROP COLUMN mother_occupation,
DROP COLUMN residence_county,
DROP COLUMN residence_sub_county;

UPDATE parishes
SET deanery = 'Nyeri Central Deanery'
WHERE deanery = 'Nyeri Municipality Deanery';

DROP TABLE IF EXISTS marriage_documents;


INSERT INTO parishes (parish_name, deanery) VALUES
('Kamakwa Parish', 'Tetu Deanery'),
('Witima Parish', 'Othaya Deanery'),
('Kamatu Parish', 'Karatina Deanery'),
('Giathegu Parish', 'Mukurwe-ini Deanery');

UPDATE parishes
SET parish_name = 'Ithenguri Parish'
WHERE parish_name = 'Itheguri Parish'; 

UPDATE parishes
SET parish_name = 'St. Teresa Equator Parish'
WHERE parish_name = 'St. Teresa Parish';
