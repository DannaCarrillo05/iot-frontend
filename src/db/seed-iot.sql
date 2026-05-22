CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO units (code, display_name, symbol)
VALUES
	('celsius', 'Celsius', 'degC'),
	('percent', 'Percent', '%')
ON CONFLICT (code) DO NOTHING;

INSERT INTO measurement_definitions (metric_key, display_name, value_type, canonical_unit_id)
VALUES
	(
		'temperature',
		'Temperature',
		'number',
		(SELECT id FROM units WHERE code = 'celsius')
	),
	(
		'humidity',
		'Humidity',
		'number',
		(SELECT id FROM units WHERE code = 'percent')
	)
ON CONFLICT (metric_key) DO NOTHING;
