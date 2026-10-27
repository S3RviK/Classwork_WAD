const express = require("express");
const https = require("https");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.urlencoded({ extended: false }));

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return replacements[character];
  });
}

function showMessage(res, message, status = 200) {
  res.status(status).send(`
    <!DOCTYPE html>
    <html lang="es">
      <head><meta charset="UTF-8"><title>Reporte del clima</title></head>
      <body>
        <h1>Reporte del clima</h1>
        <p>${escapeHtml(message)}</p>
        <a href="/">Volver al inicio</a>
      </body>
    </html>
  `);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.post("/", (req, res) => {
  const city = (req.body.cityName || "").trim();
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!city) {
    return showMessage(res, "Escribe el nombre de una ciudad.", 400);
  }

  if (!apiKey) {
    return showMessage(
      res,
      "Falta configurar OPENWEATHER_API_KEY antes de consultar el clima.",
      500
    );
  }

  const address = new URL("https://api.openweathermap.org/data/2.5/weather");
  address.searchParams.set("q", city);
  address.searchParams.set("appid", apiKey);
  address.searchParams.set("units", "metric");
  address.searchParams.set("lang", "es");

  // Pido las unidades métricas para que la temperatura ya venga en Celsius.
  const request = https.get(address, (response) => {
    let responseData = "";

    response.on("data", (chunk) => {
      responseData += chunk;
    });

    response.on("end", () => {
      let weatherData;

      try {
        weatherData = JSON.parse(responseData);
      } catch (error) {
        console.error("La respuesta del servicio no era JSON válido:", error.message);
        return showMessage(res, "El servicio devolvió una respuesta que no pude leer.", 502);
      }

      if (response.statusCode !== 200) {
        return showMessage(
          res,
          weatherData.message || "No pude encontrar el clima de esa ciudad.",
          502
        );
      }

      if (
        !weatherData.main ||
        !Number.isFinite(weatherData.main.temp) ||
        !Array.isArray(weatherData.weather) ||
        !weatherData.weather[0] ||
        !weatherData.weather[0].description ||
        !weatherData.weather[0].icon
      ) {
        return showMessage(res, "La respuesta del servicio no tenía los datos esperados.", 502);
      }

      const description = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const temperature = Math.round(weatherData.main.temp);

      res.send(`
        <!DOCTYPE html>
        <html lang="es">
          <head><meta charset="UTF-8"><title>Clima de ${escapeHtml(weatherData.name)}</title></head>
          <body>
            <h1>Clima de ${escapeHtml(weatherData.name)}</h1>
            <p>Temperatura: ${temperature} °C</p>
            <p>Descripción: ${escapeHtml(description)}</p>
            <img
              src="https://openweathermap.org/img/wn/${encodeURIComponent(icon)}@2x.png"
              alt="${escapeHtml(description)}"
            >
            <p><a href="/">Consultar otra ciudad</a></p>
          </body>
        </html>
      `);
    });

    response.on("error", (error) => {
      console.error("Error al recibir el clima:", error.message);
      if (!res.headersSent) {
        showMessage(res, "Hubo un problema al recibir los datos del clima.", 502);
      }
    });
  });

  request.setTimeout(10000, () => {
    request.destroy(new Error("La consulta del clima tardó demasiado."));
  });

  request.on("error", (error) => {
    console.error("No se pudo consultar el servicio del clima:", error.message);
    if (!res.headersSent) {
      showMessage(res, "No se pudo conectar con el servicio del clima.", 502);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
