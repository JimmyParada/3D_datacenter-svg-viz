from flask import Flask, jsonify
from flask_cors import CORS
import re
import requests

app = Flask(__name__)
CORS(app)
####### Sala UPS#####
#ZABBIX_URL = "http://172.30.126.200/zabbix/api_jsonrpc.php"
#ZABBIX_TOKEN = (
#    "b05782cd60877443484c6b145391b0d53cec48b3e61d53df64c203aea541eb42"
#)
ZABBIX_URL = "http://172.30.126.250/zabbix/api_jsonrpc.php"
ZABBIX_TOKEN = (
    "6803a1c0020d73852c413223f9f87de244e27acd66c41f44476d6c1eb339f29a"
)

RACK_KEYS = [
    "AD03",
    "AD04",
    "AD05",
    "AD06",
    "AD07",
    "AD08",
    "AD09",
    "AD10",
    "AD11",
    "AD12",
    "AD13",
    "AD15",
    "AD16",
    "AD18",
    "AD19",
    "AD21",
    "AD22",
    "AD23",
    "AD24",
    "AD25",
    "AJ03",
    "AJ04",
    "AJ05",
    "AJ06",
    "AJ07",
    "AJ08",
    "AJ10",
    "AJ11",
    "AJ13",
    "AJ14",
    "AJ15",
    "AP05",
    "AP06",
    "AP09",
    "AP10",
    "AP11",
    "VA03",
    "VA04",
    "VA08",
    "VA10",
    "VA11",
    "VA12",
    "VA13",
    "VA14",
    "VA17",
    "VA19",
    "VA20",
    "BB05",
    "BB06",
    "BB07",
    "BB08",
    "BB09",
    "BB10",
    "BB13",
    "BB14",
    "BB15",
    "BB17",
    "BB18",
    "BB19",
    "BB20",
    "BB21",
    "BF02",
    "BF03",
    "BF04",
    "BF05",
    "BF06",
    "BF07",
    "BF08",
    "BF16",
    "BF17",
    "BF19",
    "BF20",
    "BF21",
    "BF22",
    "BF23",
    "BF24",
]


@app.route("/api/racks-status", methods=["GET"])
def get_racks_status():
  headers = {
      "Content-Type": "application/json-rpc",
      "Authorization": f"Bearer {ZABBIX_TOKEN}",
  }

  hosts_payload = {
      "jsonrpc": "2.0",
      "method": "host.get",
      "params": {
          "output": ["hostid", "host", "name"],
          "search": {"name": "V11R"},
          "selectItems": ["itemid", "name", "key_", "lastvalue"],
          "selectHostGroups": ["name"],  # Trae los grupos configurados en Zabbix
      },
      "id": 1,
  }

  try:
    response = requests.post(
        ZABBIX_URL, json=hosts_payload, headers=headers
    ).json()
    hosts_data = response.get("result", [])
  except Exception as e:
    print(f"Error de conexión con Zabbix: {e}")
    return jsonify({"error": "Error al conectar con la API de Zabbix"}), 500

  formatted_data = {}

  for host in hosts_data:
    full_name = host.get("name", "")

    # 1. Identificar Rack al que pertenece la PDU
    rack_name = None
    for key in RACK_KEYS:
      if key.lower() in full_name.lower():
        rack_name = key
        break

    if not rack_name:
      continue

    # 2. Extraer el nombre del Grupo / Cliente
    # Prioridad A: Texto entre paréntesis en el nombre del Host (ej: "Instapago (CTDV)")
    match = re.search(r"\((.*?)\)", full_name)
    if match:
      group_label = match.group(1)
    else:
      # Prioridad B: Primer Host Group de Zabbix (excluyendo "Discovered hosts")
      groups = [
          g["name"]
          for g in host.get("hostgroups", [])
          if "discovered" not in g["name"].lower()
      ]
      group_label = groups[0] if groups else "Sin Grupo"

    # Inicializar registro si es nuevo
    if rack_name not in formatted_data:
      formatted_data[rack_name] = {
          "temp": 0.0,
          "power_kw": 0.0,
          "group": group_label,
          "pdus": [],
      }

    pdu_power = 0.0
    pdu_temp = 0.0

    for item in host.get("items", []):
      key_str = item.get("key_", "")
      item_name = item.get("name", "").lower()
      val = item.get("lastvalue")

      if val is None or val == "":
        continue

      try:
        val_float = float(val)

        # Carga Eléctrica (kVATotal o PowerTotal)
        if key_str in ["kVATotal", "PowerTotal"]:
          pdu_power = val_float

        # Temperatura (Clave T2 o sensor de temp)
        elif (
            key_str == "T2"
            or "temp" in key_str.lower()
            or "temp" in item_name
        ):
          if val_float > pdu_temp:
            pdu_temp = val_float

      except ValueError:
        pass

    # Sumar la potencia al acumulado del Rack
    formatted_data[rack_name]["power_kw"] += pdu_power
    formatted_data[rack_name]["pdus"].append(f"{full_name}: {pdu_power} kVA")

    # Guardar temperatura máxima
    if pdu_temp > formatted_data[rack_name]["temp"]:
      formatted_data[rack_name]["temp"] = pdu_temp

  # Formateo final para salida en Terminal y API Flask
  final_response = {}
  print("\n================ SUMATORIA POR RACKS CON GRUPOS ================")
  for rack, data in formatted_data.items():
    kw_total = round(data["power_kw"], 2)
    temp_total = round(data["temp"], 1)
    group_name = data["group"]

    final_response[rack] = {
        "group": group_name,
        "temp": temp_total,
        "power": f"{kw_total:.2f} kVA",
        "power_num": kw_total,
        "pdus_detectadas": data["pdus"],
    }

    # Formato de consola solicitado
    print(
        f"{group_name:<20} | Rack {rack:<5} | Total Sumado: {kw_total:.2f} kVA"
        f" | Temp ={temp_total:.0f} °C"
    )

  print("=================================================================\n")

  return jsonify(final_response)


if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5000, debug=True)