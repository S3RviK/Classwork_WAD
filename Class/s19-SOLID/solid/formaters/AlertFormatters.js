export class AlertFormatters {
    static formatText(sensorData) {
        return `[ALERT] sensor: ${sensorData.id} exceeded limit value: ${sensorData.reading}`;
    }
    
    static formatJson(sensorData) {
        return `
            <div style="border: 1px solid red; padding: 10px; margin: 10px;">
                <h3>ALERT</h3>
                <p>Sensor ID: ${sensorData.id}</p>
                <p>Exceeded Limit Value: ${sensorData.reading}</p>
            </div>
        `;
    }
}