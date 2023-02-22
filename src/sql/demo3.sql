SELECT main_function_ID, intermediate_function_ID, count(*)
FROM RFAs
WHERE bureau != 'NWS'
GROUP BY main_function_ID, intermediate_function_ID
ORDER BY main_function_ID, intermediate_function_ID