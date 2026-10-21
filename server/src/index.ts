import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ErrorValidacion, formatearProtocolo, validarPeticion } from './protocolo.js';
import type { ErrorResponse, FormatProtocolRequest, FormatProtocolResponse } from './types.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post(
  '/api/format-protocol',
  (req: Request<unknown, FormatProtocolResponse | ErrorResponse, FormatProtocolRequest>, res) => {
    try {
      res.json(formatearProtocolo(validarPeticion(req.body)));
    } catch (e) {
      if (e instanceof ErrorValidacion) {
        res.status(400).json({ error: e.message, detalles: e.detalles });
        return;
      }
      throw e;
    }
  },
);

// En producción el mismo servidor entrega el frontend compilado (client/dist).
const distCliente = join(dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (existsSync(distCliente)) {
  app.use(express.static(distCliente));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(join(distCliente, 'index.html')));
}

app.use((err: Error & { status?: number }, _req: Request, res: Response<ErrorResponse>, _next: NextFunction) => {
  if (err.status && err.status < 500) {
    res.status(err.status).json({ error: 'El cuerpo de la petición no es JSON válido o es demasiado grande.' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno al procesar el protocolo.' });
});

app.listen(PORT, () => {
  console.log(`Protocolab API escuchando en http://localhost:${PORT}`);
});
