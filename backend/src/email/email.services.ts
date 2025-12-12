import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // tu correo Gmail
      pass: process.env.EMAIL_PASS,  // app password
    },
  });

  async sendContactEmail(data: {
    name: string;
    email: string;
    role: string;
    units: string;
    message: string;
  }) {
    const mail = {
      from: `"Comunidad Organizada" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: "Nuevo contacto desde la landing",
      html: `
        <h2>Nuevo contacto</h2>
        <p><b>Nombre:</b> ${data.name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Rol/Cargo:</b> ${data.role}</p>
        <p><b>N° Departamentos:</b> ${data.units}</p>
        <p><b>Mensaje:</b><br>${data.message}</p>
      `,
    };

    await this.transporter.sendMail(mail);
    return { ok: true };
  }
}
