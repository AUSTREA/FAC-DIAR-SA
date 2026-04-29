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
// FECHA FACTURA (SIEMPRE HOY)
// ==========================
function setFechaFactura() {
  const hoy = new Date();

  const fechaEl = document.getElementById("fecha");
  if (fechaEl) {
    fechaEl.textContent = hoy.toLocaleDateString("es-GT");
  }

  const horaEl = document.getElementById("hora");
  if (horaEl) {
    horaEl.textContent = hoy.toLocaleTimeString("es-GT");
  }
}

window.addEventListener("load", setFechaFactura);

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
// LETRAS
// ==========================
function numeroALetras(num) {

  function convertir(n) {
    if (n === 0) return "cero";
    if (n === 100) return "cien";

    const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const especiales = {
      10: "diez", 11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince"
    };
    const decenas = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const centenas = ["", "ciento", "doscientos", "trescientos", "cuatrocientos",
      "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

    if (n < 10) return unidades[n];
    if (n >= 10 && n < 16) return especiales[n];
    if (n < 20) return "dieci" + unidades[n - 10];
    if (n === 20) return "veinte";
    if (n < 30) return "veinti" + unidades[n - 20];

    if (n < 100) {
      let d = Math.floor(n / 10);
      let u = n % 10;
      return decenas[d] + (u ? " y " + unidades[u] : "");
    }

    if (n < 1000) {
      let c = Math.floor(n / 100);
      let r = n % 100;
      return centenas[c] + (r ? " " + convertir(r) : "");
    }

    if (n < 1000000) {
      let m = Math.floor(n / 1000);
      let r = n % 1000;
      let texto = (m === 1 ? "mil" : convertir(m) + " mil");
      return texto + (r ? " " + convertir(r) : "");
    }

    return "";
  }

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  let letras = convertir(entero);

  letras = letras.replace("uno mil", "mil");
  letras = letras.replace(/uno$/, "un");

  letras = letras.charAt(0).toUpperCase() + letras.slice(1);

  if (centavos === 0) {
    return `${letras} quetzales exactos`;
  }

  return `${letras} quetzales con ${convertir(centavos)} centavos`;
}

// ==========================
// AGREGAR MANUAL
// ==========================
function agregarItem() {

  const vendedor = document.getElementById("inputVendedor").value;
  const pago = document.getElementById("inputPAGO").value;
  const cliente = document.getElementById("inputCLIENTE").value;

  document.getElementById("vendedor").textContent =
    (vendedor && vendedor.trim() !== "") ? vendedor : "—";

  document.getElementById("formaPago").textContent =
    (pago && pago.trim() !== "") ? pago : "—";

  document.getElementById("codigoCliente").textContent =
    (cliente && cliente.trim() !== "") ? cliente : "—";
}

// ==========================
// UTILIDAD
// ==========================
function obtenerFilaRelleno() {
  return document.querySelector(".fila-relleno");
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

    // FECHA Y HORA
    const fechaHora =
      xmlDoc.getElementsByTagName("dte:DatosGenerales")[0]
        ?.getAttribute("FechaHoraEmision");

    if (fechaHora) {
      const partes = fechaHora.split("T");

      const fecha = partes[0] || "—";
      const hora = partes[1]?.split("-")[0] || "—";

      document.getElementById("fechaHoraEmision").textContent = fecha;
      document.getElementById("hora").textContent = hora;
    } else {
      document.getElementById("fechaHoraEmision").textContent = "—";
      document.getElementById("hora").textContent = "—";
    }

    // CLIENTE
    const receptor =
      xmlDoc.getElementsByTagName("dte:Receptor")[0];

    document.getElementById("nombreReceptor").textContent =
      receptor?.getAttribute("NombreReceptor") || "—";

    document.getElementById("nitReceptor").textContent =
      receptor?.getAttribute("IDReceptor") || "—";

    const receptorDireccionNode =
      xmlDoc.getElementsByTagName("dte:DireccionReceptor")[0];

    const direccion = receptorDireccionNode?.getElementsByTagName("dte:Direccion")[0]?.textContent?.trim();
    const municipio = receptorDireccionNode?.getElementsByTagName("dte:Municipio")[0]?.textContent?.trim();
    const departamento = receptorDireccionNode?.getElementsByTagName("dte:Departamento")[0]?.textContent?.trim();
    const pais = receptorDireccionNode?.getElementsByTagName("dte:Pais")[0]?.textContent?.trim();

    const direccionArray = [direccion, municipio, departamento, pais]
      .filter(v => v && v.trim() !== "");

    document.getElementById("direccionReceptor").textContent =
      direccionArray.length ? direccionArray.join(", ") : "";

    // ITEMS
    const items = xmlDoc.getElementsByTagName("dte:Item");
    const tbody = document.getElementById("items");

    const relleno = obtenerFilaRelleno();
    tbody.innerHTML = "";
    tbody.appendChild(relleno);

    for (let i = 0; i < items.length; i++) {

      const cantidad =
        items[i].getElementsByTagName("dte:Cantidad")[0]?.textContent || 0;

      const descripcion =
        items[i].getElementsByTagName("dte:Descripcion")[0]?.textContent || "";

      const precio =
        items[i].getElementsByTagName("dte:PrecioUnitario")[0]?.textContent || 0;

      const subtotal =
        parseFloat(cantidad) * parseFloat(precio);

      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${cantidad}</td>
        <td>${descripcion}</td>
        <td>${formatoQuetzal(parseFloat(precio))}</td>
        <td>${formatoQuetzal(subtotal)}</td>
      `;

      tbody.insertBefore(fila, relleno);
    }

    // TOTALES
    const subtotalXML =
      limpiarNumero(xmlDoc.getElementsByTagName("dte:MontoGravable")[0]?.textContent);

    const ivaXML =
      limpiarNumero(xmlDoc.getElementsByTagName("dte:MontoImpuesto")[0]?.textContent);

    const totalXML =
      limpiarNumero(xmlDoc.getElementsByTagName("dte:GranTotal")[0]?.textContent);

    document.getElementById("subtotal").textContent =
      formatoQuetzal(subtotalXML);

    document.getElementById("iva").textContent =
      formatoQuetzal(ivaXML);

    document.getElementById("total").textContent =
      formatoQuetzal(totalXML);

    document.getElementById("total-letras").textContent =
      numeroALetras(totalXML);

    // CERTIFICADOR
    const ns = "http://www.sat.gob.gt/dte/fel/0.2.0";

    const nitCertificador =
      xmlDoc.getElementsByTagNameNS(ns, "NITCertificador")[0]?.textContent;

    document.getElementById("nitCertificador").textContent =
      nitCertificador || "—";

    const nodoAut =
      xmlDoc.getElementsByTagNameNS(ns, "NumeroAutorizacion")[0];

    document.getElementById("autorizacion").textContent =
      nodoAut?.textContent?.trim() || "—";

    const serie = nodoAut?.getAttribute("Serie");
    document.getElementById("serie").textContent =
      serie || "—";

    const numero = nodoAut?.getAttribute("Numero");
    document.getElementById("numero").textContent =
      numero || "—";

    
    // QR (FIX incluido)
    const uuid = nodoAut?.textContent?.trim();

    const emisor =
      xmlDoc.getElementsByTagName("dte:Emisor")[0]
        ?.getAttribute("NITEmisor");

    const receptorQR =
      receptor?.getAttribute("IDReceptor");

    const totalQR =
      Number(totalXML).toFixed(2);

    if (uuid && emisor && receptorQR && totalQR) {

      const linkQR =
        `https://felpub.c.sat.gob.gt/verificador-web/publico/vistas/verificacionDte.jsf?tipo=autorizacion&numero=${uuid}&emisor=${emisor}&receptor=${receptorQR}&monto=${totalQR}`;

      const qrDiv = document.getElementById("qr");
      qrDiv.innerHTML = "";

      new QRCode(qrDiv, {
        text: linkQR,
        width: 110,
        height: 110,
        correctLevel: QRCode.CorrectLevel.H
      });

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
    <body>
      ${factura.outerHTML}
    </body>
    </html>
  `);

  ventana.document.close();

  ventana.onload = function () {
    setTimeout(() => {
      ventana.focus();
      ventana.print();
      ventana.close();
    }, 700); // 🔥 importante para carga completa
  };
}
