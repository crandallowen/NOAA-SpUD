SELECT substring(point_of_contact, 1, length(point_of_contact) - 18) as POC, count(*)
FROM RFAs
GROUP BY POC
ORDER BY POC