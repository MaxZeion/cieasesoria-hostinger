import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false; // SSR endpoint

interface ContactFormData {
    nombre: string;
    telefono?: string;
    email: string;
    mensaje: string;
    privacidad: string;
    recaptcha_token?: string;
}

interface RecaptchaResponse {
    success: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
}

// Verify reCAPTCHA token with Google
async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
    const secretKey = import.meta.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.warn('RECAPTCHA_SECRET_KEY not configured, skipping verification');
        return { success: true, score: 1.0 }; // Skip if not configured
    }

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${token}`,
        });

        const data: RecaptchaResponse = await response.json();
        return {
            success: data.success && (data.score ?? 0) >= 0.5,
            score: data.score ?? 0
        };
    } catch (error) {
        console.error('reCAPTCHA verification failed:', error);
        return { success: false, score: 0 };
    }
}

export const POST: APIRoute = async ({ request }) => {
    try {
        // Parse form data
        const formData = await request.formData();
        const data: ContactFormData = {
            nombre: formData.get('nombre') as string,
            telefono: formData.get('telefono') as string || '',
            email: formData.get('email') as string,
            mensaje: formData.get('mensaje') as string,
            privacidad: formData.get('privacidad') as string,
            recaptcha_token: formData.get('recaptcha_token') as string || '',
        };

        // Verify reCAPTCHA if token provided
        if (data.recaptcha_token) {
            const recaptchaResult = await verifyRecaptcha(data.recaptcha_token);
            if (!recaptchaResult.success) {
                console.warn('reCAPTCHA verification failed, score:', recaptchaResult.score);
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'Verificación de seguridad fallida. Por favor, inténtalo de nuevo.'
                    }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Validate required fields
        if (!data.nombre || !data.email || !data.mensaje) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Por favor, completa todos los campos obligatorios.'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Por favor, introduce un email válido.'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate privacy checkbox
        if (!data.privacidad) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Debes aceptar la política de privacidad.'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get SMTP config from environment variables
        const smtpHost = import.meta.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(import.meta.env.SMTP_PORT || '587');
        const smtpUser = import.meta.env.SMTP_USER;
        const smtpPass = import.meta.env.SMTP_PASS;
        const contactEmailTo = import.meta.env.CONTACT_EMAIL_TO || 'cieasesoria@gmail.com';

        // Validate SMTP config
        if (!smtpUser || !smtpPass) {
            console.error('SMTP credentials not configured');
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Error de configuración del servidor. Contacta por teléfono.'
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // Email content
        const mailOptions = {
            from: `"CIE Asesoría Web" <${smtpUser}>`,
            to: contactEmailTo,
            replyTo: data.email,
            subject: `Nuevo mensaje de contacto - ${data.nombre}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">
            Nuevo Mensaje de Contacto
          </h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 120px;">Nombre:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.nombre}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                <a href="mailto:${data.email}" style="color: #3182ce;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Teléfono:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                ${data.telefono ? `<a href="tel:${data.telefono}" style="color: #3182ce;">${data.telefono}</a>` : 'No proporcionado'}
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f7fafc; border-radius: 8px;">
            <h3 style="color: #2d3748; margin-top: 0;">Mensaje:</h3>
            <p style="color: #4a5568; white-space: pre-wrap;">${data.mensaje}</p>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #718096;">
            Este mensaje fue enviado desde el formulario de contacto de cieasesoria.com
          </p>
        </div>
      `,
            text: `
Nuevo Mensaje de Contacto

Nombre: ${data.nombre}
Email: ${data.email}
Teléfono: ${data.telefono || 'No proporcionado'}

Mensaje:
${data.mensaje}

---
Enviado desde el formulario de contacto de cieasesoria.com
      `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return new Response(
            JSON.stringify({
                success: true,
                message: '¡Mensaje enviado correctamente! Te responderemos pronto.'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo o contacta por teléfono.'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
