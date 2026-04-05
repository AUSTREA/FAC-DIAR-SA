// Fecha y hora automáticas
window.onload = () => {
  const fecha = new Date();
  document.getElementById("fecha").textContent =
    `Fecha: ${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  document.getElementById("hora").textContent =
    `Hora: ${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')}`;
};

// Recalcular totales al escribir
document.addEventListener("input", calcularFactura);

function calcularFactura() {
  const filas = document.querySelectorAll("#tabla-servicios tbody tr");
  let subtotalGeneral = 0;

  filas.forEach(fila => {
    const inputCant = fila.querySelector(".cant");
    const inputCosto = fila.querySelector(".costo");

    let cant, costo;

    if (inputCant && inputCosto) {
      // Modo manual con inputs
      cant = parseFloat(inputCant.value) || 0;
      costo = parseFloat(inputCosto.value) || 0;
      const subtotal = cant * costo;
      fila.querySelector(".subtotal").textContent = subtotal ? formatoQuetzal(subtotal) : "";
      subtotalGeneral += subtotal;
    } else {
      // Modo XML con texto plano
     const textoCant = parseFloat(fila.cells[0]?.textContent) || 0;
const textoCosto = fila.cells[2]?.textContent || "";
const costo = parseFloat(textoCosto.replace("Q", "").replace(",", "").trim()) || 0;
const subtotal = textoCant * costo;
subtotalGeneral += subtotal;

    }
  });

  const iva = subtotalGeneral * 0.12;
  const total = subtotalGeneral + iva;

  document.getElementById("subtotal").textContent = formatoQuetzal(subtotalGeneral);
  document.getElementById("iva").textContent = formatoQuetzal(iva);
  document.getElementById("total").textContent = formatoQuetzal(total);
  document.getElementById("total-letras").textContent = numeroALetras(total);
}


// Convierte número a letras (simplificado)
function numeroALetras(num) {
  if (num === 0) return "Cero quetzales";
  return num.toFixed(2) + " quetzales"; // Puedes integrar una librería más adelante
}

// Cargar datos desde XML
function cargarXML() {
  const input = document.getElementById("archivoXML");
  const file = input.files[0];
  if (!file) return alert("Selecciona un archivo XML");

  const reader = new FileReader();
  reader.onload = function (e) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(e.target.result, "text/xml");

    // Datos generales
    const fechaHora = xmlDoc.getElementsByTagName("dte:DatosGenerales")[0]?.getAttribute("FechaHoraEmision") || "";
    const [fecha, hora] = fechaHora.split("T");
    document.getElementById("autorizacion").textContent =
      "Autorización: " + xmlDoc.getElementsByTagName("dte:NumeroAutorizacion")[0]?.textContent || "";
    document.getElementById("fecha").textContent = "Fecha: " + fecha;
    document.getElementById("hora").textContent = "Hora: " + (hora?.split("-")[0] || "");

    // Emisor
   //pendiente por si lo queire el hessler
    // Receptor
    const receptor = xmlDoc.getElementsByTagName("dte:Receptor")[0];
document.getElementById("nombreReceptor").textContent = receptor?.getAttribute("NombreReceptor") || "—";
document.getElementById("nitReceptor").textContent = receptor?.getAttribute("IDReceptor") || "—";
const municipio = xmlDoc.getElementsByTagName("dte:Municipio")[0]?.textContent || "";
const departamento = xmlDoc.getElementsByTagName("dte:Departamento")[0]?.textContent || "";
const pais = xmlDoc.getElementsByTagName("dte:Pais")[0]?.textContent || "";
document.getElementById("direccionReceptor").textContent = `${municipio}, ${departamento}, ${pais}`;


    // Servicios
const items = xmlDoc.getElementsByTagName("dte:Item");
const tbody = document.getElementById("items");
tbody.innerHTML = ""; // Limpia la tabla

for (let i = 0; i < items.length; i++) {
  const cantidad = items[i].getElementsByTagName("dte:Cantidad")[0]?.textContent || "";
  const descripcion = items[i].getElementsByTagName("dte:Descripcion")[0]?.textContent || "";
  const precio = items[i].getElementsByTagName("dte:PrecioUnitario")[0]?.textContent || "";
  const subtotal = (parseFloat(cantidad) * parseFloat(precio)).toFixed(2);

const fila = `<tr>
  <td>${cantidad}</td>
  <td>${descripcion}</td>
  <td>${formatoQuetzal(parseFloat(precio))}</td>
  <td class="subtotal">${formatoQuetzal(parseFloat(subtotal))}</td>
</tr>`;
  tbody.innerHTML += fila;
}


    // Totales
    const iva = xmlDoc.getElementsByTagName("dte:TotalImpuesto")[0]?.getAttribute("TotalMontoImpuesto") || "0.00";
    const total = xmlDoc.getElementsByTagName("dte:GranTotal")[0]?.textContent || "0.00";

    document.getElementById("iva").textContent = formatoQuetzal(parseFloat(iva));
document.getElementById("total").textContent = formatoQuetzal(parseFloat(total));
    const totalLetrasXML = xmlDoc.getElementsByTagName("dte:TextoTotal")[0]?.textContent;
document.getElementById("total-letras").textContent = totalLetrasXML || numeroALetras(parseFloat(total));


    // QR SAT (simulado como imagen)
    const qr = document.getElementById("qr");
    if (qr) qr.innerHTML = `<img src="PICTURES/qr-sat.png" alt="QR SAT" style="width:100px;">`;
  };
  reader.readAsText(file);
}

//descargar pdf
function descargarPDF() {
  const factura = document.getElementById("factura");

  const ventana = window.open("", "", "width=900,height=700");

  ventana.document.write(`
    <html>
    <head>
      <title>Factura</title>
      <link rel="stylesheet" href="carta.css">
      <style>
        body {
          margin: 0;
          padding: 0;
        }

        @page {
          size: letter;
          margin: 0;
        }

        .factura {
          width: 21.59cm;
          min-height: 27.94cm;
          padding: 1.5cm;
          box-sizing: border-box;
        }
      </style>
    </head>
    <body>
      ${factura.outerHTML}
    </body>
    </html>
  `);

  ventana.document.close();

  ventana.onload = function () {
    ventana.focus();
    ventana.print();
    ventana.close();
  };
}
// Convierte número a letras con miles y centavos
function numeroALetras(num) {
  const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
  const decenas = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const especiales = {
    10: "diez", 11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
    16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve"
  };

  function convertirParteEntera(n) {
    if (n === 0) return "cero";
    let resultado = "";

    if (n >= 1000000) {
      const millones = Math.floor(n / 1000000);
      resultado += convertirParteEntera(millones) + " millón" + (millones > 1 ? "es " : " ");
      n %= 1000000;
    }

    if (n >= 1000) {
      const miles = Math.floor(n / 1000);
      resultado += (miles === 1 ? "mil " : convertirParteEntera(miles) + " mil ");
      n %= 1000;
    }

    if (n >= 100) {
      const centenas = Math.floor(n / 100);
      resultado += (centenas === 1 && n % 100 === 0) ? "cien " : ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"][centenas] + " ";
      n %= 100;
    }

    if (n >= 10 && n <= 19) {
      resultado += especiales[n] + " ";
    } else {
      const dec = Math.floor(n / 10);
      const uni = n % 10;
      resultado += decenas[dec];
      if (dec > 1 && uni > 0) resultado += " y ";
      resultado += unidades[uni] + " ";
    }

    return resultado.trim();
  }

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  return `${convertirParteEntera(entero)} quetzales con ${convertirParteEntera(centavos)} centavos`;
}

function formatoQuetzal(num) {
  return "Q " + num.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function agregarFila(cantidad = "", descripcion = "", precio = "") {
  const tbody = document.querySelector("#tabla-servicios tbody");
  
  // Calcular subtotal
  const subtotal = (parseFloat(cantidad) || 0) * (parseFloat(precio) || 0);

  // Crear fila
  const fila = document.createElement("tr");

  fila.innerHTML = `
    <td class="cantidad">${cantidad}</td>
    <td class="descripcion">${descripcion}</td>
    <td class="costo">${formatoQuetzal(parseFloat(precio) || 0)}</td>
    <td class="subtotal">${formatoQuetzal(subtotal)}</td>
  `;

  tbody.appendChild(fila);

  calcularFactura(); // recalcula totales automáticamente
}
