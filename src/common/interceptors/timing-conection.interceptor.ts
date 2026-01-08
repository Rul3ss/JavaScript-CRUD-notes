import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';

export class TimingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    console.log('executando antes');
    await new Promise(resolve => setTimeout(resolve, 3000));

    return next.handle().pipe(
      tap(() => {
        console.log('depois');
      }),
    );
  }
}
