import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { of, tap } from 'rxjs';

export class SimpleCacheInterceptor implements NestInterceptor {
  private readonly cache = new Map();

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const url = context.switchToHttp().getRequest().url;

    if (this.cache.has(url)) {
      console.log('its on cache', url);
      return of(this.cache.get(url));
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    return next.handle().pipe(
      tap(data => {
        this.cache.set(url, data);
        console.log('in cache', url);
      }),
    );
  }
}
