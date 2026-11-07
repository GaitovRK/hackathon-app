import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

const DEFAULT_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  402: 'PAYMENT_REQUIRED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  413: 'PAYLOAD_TOO_LARGE',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
};

/** Normalises every error to { statusCode, code, message, ...extra }. Never echoes headers or tokens. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const r = exception.getResponse();
      body = typeof r === 'string' ? { message: r } : { ...(r as Record<string, unknown>) };
      if (Array.isArray(body.message)) body.message = body.message.join('; ');
      if (body.error && !body.code) delete body.error;
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as { type?: string }).type === 'entity.too.large'
    ) {
      statusCode = 413;
      body = { message: 'Payload too large' };
    } else {
      this.logger.error(`Unhandled error: ${(exception as Error)?.name ?? 'unknown'}`);
      body = { message: 'Internal server error' };
    }

    delete body.error;
    res.status(statusCode).json({
      ...body,
      statusCode,
      code: (body.code as string | undefined) ?? DEFAULT_CODES[statusCode] ?? 'ERROR',
      message: (body.message as string | undefined) ?? 'Error',
    });
  }
}
