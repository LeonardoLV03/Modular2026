#!/usr/bin/env bash
# Prueba de integración HTTP (opcional). Con el servidor corriendo:
#   cd backend && swipl server.pl        (otra terminal)
#   bash tests/prueba_http.sh            (usa el módulo fractura)
set -euo pipefail
API="${API:-http://localhost:5000}"
MOD="fractura"
H='Content-Type: application/json'

echo "== start-consultation ($MOD)"
START=$(curl -s -X POST "$API/api/start-consultation" -H "$H" -d "{\"module\":\"$MOD\",\"answers\":[]}")
echo "$START"
SID=$(echo "$START" | python3 -c 'import sys,json; print(json.load(sys.stdin)["sessionId"])')

echo "== next-question"
curl -s -X POST "$API/api/next-question" -H "$H" \
  -d "{\"sessionId\":\"$SID\",\"module\":\"$MOD\",\"answers\":[\"Brazo, antebrazo o muñeca\"]}"; echo

echo "== diagnosis"
DIAG=$(curl -s -X POST "$API/api/diagnosis" -H "$H" \
  -d "{\"sessionId\":\"$SID\",\"module\":\"fractura\",\"answers\":[\"Brazo, antebrazo o muñeca\",\"Solo inflamación o moretón\",\"Puede moverla con algo de dolor\",\"Dolor leve o puntual\",\"Ninguno de los anteriores\"]}")
echo "$DIAG"
echo "$DIAG" | python3 -c '
import sys, json
d = json.load(sys.stdin)
assert isinstance(d["results"], list), "results no es lista"
assert isinstance(d["exactOnly"], bool), "exactOnly no es booleano"
assert isinstance(d["confidence"], (int, float)), "confidence no es numerico"
assert d["recommendations"], "recomendaciones vacias"
print("OK contrato:", d["caseType"], d["confidence"], d["severity"])'

echo "== end-consultation"
curl -s -X POST "$API/api/end-consultation" -H "$H" -d "{\"sessionId\":\"$SID\"}"; echo

echo "== hemorragia: ya no termina antes de tiempo (debe decir shouldFinish:false y pregunta 3)"
START=$(curl -s -X POST "$API/api/start-consultation" -H "$H" -d '{"module":"hemorragia","answers":[]}')
SID=$(echo "$START" | python3 -c 'import sys,json; print(json.load(sys.stdin)["sessionId"])')
NEXT=$(curl -s -X POST "$API/api/next-question" -H "$H" \
  -d "{\"sessionId\":\"$SID\",\"module\":\"hemorragia\",\"answers\":[\"Poco  (manchas o goteo leve)\",\"La herida es superficial\"]}")
echo "$NEXT"
echo "$NEXT" | python3 -c '
import sys, json
d = json.load(sys.stdin)
assert d["shouldFinish"] is False and d["questionNumber"] == 3, "hemorragia termino antes de tiempo"
print("OK: sigue a la pregunta 3")'
curl -s -X POST "$API/api/end-consultation" -H "$H" -d "{\"sessionId\":\"$SID\"}"; echo
