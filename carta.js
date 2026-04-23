// ==========================
// LIMPIEZA DE NÚMEROS
// ==========================
function limpiarNumero(valor) {
  if (typeof valor === "number") return valor;

  return parseFloat(
    String(valor).replace(/[Q,\s]/g, "")
  ) || 0;
}

// ==========================
// FECHA Y HORA
// ==========================
window.onload = () => {
  const fecha = new Date();

  document.getElementById("fecha").textContent =
    `Fecha: ${fecha.toLocaleDateString("es-GT")}`;

  document.getElementById("hora").textContent =
    `Hora: ${fecha.toLocaleTimeString("es-GT")}`;
};

// ==========================
// FORMATO QUETZALES
// ==========================
function formatoQuetzal(num) {
  return "Q " + num.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ==========================
// 🔥 LETRAS CON CENTAVOS
// ==========================
function numeroALetras(num) {
  const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];

  const especiales = {
    10: "diez", 11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince"
  };

  const decenas = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];

  const centenas = ["", "ciento", "doscientos", "trescientos", "cuatrocientos",
    "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  function convertir(n) {
    if (n < 10) return unidades[n];
    if (n >= 10 && n < 16) return especiales[n];
    if (n < 20) return "dieci" + unidades[n - 10];
    if (n === 20) return "veinte";
    if (n < 30) return "veinti" + unidades[n - 20];

    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      return decenas[d] + (u ? " y " + unidades[u] : "");
    }

    if (n === 100) return "cien";

    if (n < 1000) {
      const c = Math.floor(n / 100);
      const r = n % 100;
      return centenas[c] + (r ? " " + convertir(r) : "");
    }

    if (n < 1000000) {
      const m = Math.floor(n / 1000);
      const r = n % 1000;
      let texto = (m === 1 ? "mil" : convertir(m) + " mil");
      return texto + (r ? " " + convertir(r) : "");
    }

    return "";
  }

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  let letras = convertir(entero);

  // ajustes
  letras = letras.replace("uno mil", "mil");
  letras = letras.replace(/uno$/, "un");

  letras = letras.charAt(0).toUpperCase() + letras.slice(1);

  // 🔥 centavos en letras
  if (centavos === 0) {
    return `${letras} quetzales exactos`;
  }

  const centavosTexto = convertir(centavos);

  return `${letras} quetzales con ${centavosTexto} centavos`;
}

// ==========================
// CARGAR XML
// ==========================
function cargarXML() {
  const input = document.getElementById("archivoXML");
  const file = input.files[0];

  if (!file) {
    alert("Selecciona un archivo XML");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(e.target.result, "text/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      alert("XML inválido");
      return;
    }

    const fechaHora =
      xmlDoc.getElementsByTagName("dte:DatosGenerales")[0]
        ?.getAttribute("FechaHoraEmision") || "";

    const [fecha, hora] = fechaHora.split("T");

    const auth =
      xmlDoc.getElementsByTagName("dte:NumeroAutorizacion")[0]?.textContent || "";

    document.getElementById("autorizacion").textContent =
      "Autorización: " + auth;

    document.getElementById("fecha").textContent = "Fecha: " + (fecha || "");
    document.getElementById("hora").textContent = "Hora: " + (hora?.split("-")[0] || "");

    const receptor = xmlDoc.getElementsByTagName("dte:Receptor")[0];

    document.getElementById("nombreReceptor").textContent =
      receptor?.getAttribute("NombreReceptor") || "—";

    document.getElementById("nitReceptor").textContent =
      receptor?.getAttribute("IDReceptor") || "—";

    const municipio = xmlDoc.getElementsByTagName("dte:Municipio")[0]?.textContent || "";
    const departamento = xmlDoc.getElementsByTagName("dte:Departamento")[0]?.textContent || "";
    const pais = xmlDoc.getElementsByTagName("dte:Pais")[0]?.textContent || "";

    document.getElementById("direccionReceptor").textContent =
      `${municipio}, ${departamento}, ${pais}`;

    const items = xmlDoc.getElementsByTagName("dte:Item");
    const tbody = document.getElementById("items");

    tbody.innerHTML = "";

    for (let i = 0; i < items.length; i++) {
      const cantidad = items[i].getElementsByTagName("dte:Cantidad")[0]?.textContent || 0;
      const descripcion = items[i].getElementsByTagName("dte:Descripcion")[0]?.textContent || "";
      const precio = items[i].getElementsByTagName("dte:PrecioUnitario")[0]?.textContent || 0;

      const subtotal = parseFloat(cantidad) * parseFloat(precio);

      tbody.innerHTML += `
        <tr>
          <td>${cantidad}</td>
          <td>${descripcion}</td>
          <td>${formatoQuetzal(parseFloat(precio))}</td>
          <td class="subtotal">${formatoQuetzal(subtotal)}</td>
        </tr>
      `;
    }

    const subtotalXML = limpiarNumero(
      xmlDoc.getElementsByTagName("dte:MontoGravable")[0]?.textContent
    ) || 0;

    const ivaXML = limpiarNumero(
      xmlDoc.getElementsByTagName("dte:MontoImpuesto")[0]?.textContent
    ) || 0;

    const totalXML = limpiarNumero(
      xmlDoc.getElementsByTagName("dte:GranTotal")[0]?.textContent
    ) || 0;

    document.getElementById("subtotal").textContent =
      formatoQuetzal(subtotalXML);

    document.getElementById("iva").textContent =
      formatoQuetzal(ivaXML);

    document.getElementById("total").textContent =
      formatoQuetzal(totalXML);

    document.getElementById("total-letras").textContent =
      numeroALetras(Number(totalXML.toFixed(2)));

    const emisor =
      xmlDoc.getElementsByTagName("dte:Emisor")[0]?.getAttribute("NITEmisor");

    const receptorQR = receptor?.getAttribute("IDReceptor");

    const totalQR = Number(totalXML).toFixed(2);

    const uuid =
      xmlDoc.getElementsByTagName("dte:NumeroAutorizacion")[0]?.textContent?.trim();

    if (uuid && emisor && receptorQR && totalQR) {

      const linkQR =
        `https://felpub.c.sat.gob.gt/verificador-web/publico/vistas/verificacionDte.jsf?tipo=autorizacion&numero=${uuid}&emisor=${emisor}&receptor=${receptorQR}&monto=${totalQR}`;

      const qrDiv = document.getElementById("qr");
      qrDiv.innerHTML = "";

      new QRCode(qrDiv, {
        text: linkQR,
        width: 180,
        height: 180,
        correctLevel: QRCode.CorrectLevel.L
      });

      qrDiv.style.cursor = "pointer";
      qrDiv.onclick = () => window.open(linkQR, "_blank");
    }
  };

  reader.readAsText(file);
}

// ==========================
// PDF
// ==========================
function descargarPDF() {
  const factura = document.getElementById("factura");

  const ventana = window.open("", "", "width=900,height=700");

  ventana.document.write(`
    <html>
    <head>
      <title>Factura</title>
      <link rel="stylesheet" href="carta.css">
    </head>
    <body>${factura.outerHTML}</body>
    </html>
  `);

  ventana.document.close();

  ventana.onload = function () {
    ventana.print();
    ventana.close();
  };
}
