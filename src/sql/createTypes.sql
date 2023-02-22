CREATE TYPE frequency;

CREATE FUNCTION frequency_in(cstring) RETURNS frequency
AS $$
DECLARE
    frequency_string ALIAS FOR $1;
    frequency_KHz numeric = CAST(substring(frequency_string, 1, length(frequency_string)-3) AS numeric);
    unit char = lower(substring(frequency_string, length(frequency_string)-2, 1));
BEGIN
    IF unit = 'm' THEN
        RETURN 10^3 * frequency_KHz;
    ELSIF unit = 'g' THEN
        RETURN 10^6 * frequency_KHz;
    ELSE
        RETURN 10^9 * frequency_KHz;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION frequency_out(frequency) RETURNS cstring
AS $$
DECLARE
    val ALIAS FOR $1;
BEGIN
    IF val < 10^3 THEN
        RETURN concat(val, ' KHz');
    ELSIF val >= 10^3 AND val < 10^6 THEN
        RETURN concat(val / 10^3, ' MHz');
    ELSIF val >= 10^6 AND val < 10^9 THEN
        RETURN concat(val / 10^6, 'GHz');
    ELSE
        RETURN concat(val / 10^9, 'THz')
    END IF;
END;
$$ LANGUAGE plpgsql;

-- CREATE FUNCTION frequency_recv(internal) RETURNS frequency AS $$

-- $$ LANGUAGE plpgsql;

-- CREATE FUNCTION frequency_send(frequency) RETURNS bytea AS $$

-- $$ LANGUAGE plpgsql;

CREATE TYPE frequency (
    INPUT = frequency_in,
    OUTPUT = frequency_out,
    LIKE = float8
);

-- CREATE TYPE frequency_band AS RANGE ();